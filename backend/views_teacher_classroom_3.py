from django.http import JsonResponse  
from backend import my_utils
import json

from backend.models import *
from datetime import datetime
from django.utils.timezone import localtime, now

import io 
import pandas as pd 
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods

def api_teacher_get_activity(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    activity_id = request.POST.get('activity_id', None)
    if not isinstance(activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400) 
    
    activity = Activity.objects.filter(id=int(activity_id), activity_owner=request.user).first()
    if (not activity):
        return JsonResponse({'error': 'Activity does not exist'}, status=400)

    is_editable = False
    current_local_datetime = localtime(now())
    if (activity.activity_starting_date > current_local_datetime):
        is_editable = True
    

    data = {
        'activity_name' : activity.activity_name,
        'activity_description': activity.activity_description,
        'activity_type': activity.activity_type,
        'activity_starting_date': activity.activity_starting_date,
        'activity_due_date': activity.activity_due_date,
        'activity_content': activity.activity_content,
        'activity_total_scores': activity.activity_total_scores,
        'activity_total_items': len(activity.activity_content),
        'overall_certificate': activity.overall_certificate.url if activity.overall_certificate else None, 
        'overall_certificate_name' : activity.overall_certificate_name,
        'is_editable' : is_editable
    } 
    return JsonResponse(data, status = 200)
    
     
def api_teacher_get_activity_joined(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
     
    activity_id = request.POST.get('activity_id', None)
    if not isinstance(activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    
    activity = Activity.objects.filter(id=int(activity_id), activity_owner=request.user).first()
    if not activity:
        return JsonResponse({'error': 'Activity not found.'}, status=400)
    
    
    students = CustomUser.objects.filter(
        pk__in=activity.activity_joined,
        user_type="Student"
    )
    
    students_data = []
    for student_obj in students:
        students_data.append({
            'id': student_obj.pk,
            'fullname' : student_obj.fullname,
            'email': student_obj.email,
            'profile_image': student_obj.profile_image.url if student_obj.profile_image else None,
            'checked' : student_obj.pk in activity.activity_checked
        })
        
    return JsonResponse({
        'students': students_data
    }, status=200)
        
    
     
def api_teacher_get_activity_files(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
     
    activity_id = request.POST.get('activity_id', None)
    if not isinstance(activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    
    activity = Activity.objects.filter(id=int(activity_id), activity_owner=request.user).first()
    if not activity:
        return JsonResponse({'error': 'Activity not found.'}, status=400)
    
    
    activities_fileKeys = []
    for actKey in activity.activity_content:
        if activity.activity_content[actKey].get('type', None) == 'question-file':
            activities_fileKeys.append(activity.activity_content[actKey].get('fileKey', '************'))
    
    activities_files = ActivityFile.objects.filter(
        activity_custom_id__in=activities_fileKeys,
        activity=activity
    ).values() 
            
    return JsonResponse({
        'data': list(activities_files)
    }, status=200)
        

def api_teacher_get_dashboard(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    
    classroom_count = request.user.classroom_owner.count()
    total_students_all_classroom = 0 
    total_students_list = []
    for classroom_obj in request.user.classroom_owner.all():
        total_students_all_classroom += len(classroom_obj.classroom_students)
        total_students_list += classroom_obj.classroom_students
    
    total_students = len(set(total_students_list))
    
    return JsonResponse({
        'classroom_count': classroom_count,
        'total_students_all_classroom': total_students_all_classroom,
        'total_students': total_students,
    }, status=200)








def api_teacher_get_student_activity(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)

    activity_id = request.POST.get('activity_id', None)
    if not isinstance(activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400) 

    activity = Activity.objects.filter(id=int(activity_id)).first()
    if (not activity):
        return JsonResponse({'error': 'Activity does not exist'}, status=400)
    
    
    student_id = request.POST.get('student_id', None)
    if not isinstance(student_id, str):
        return JsonResponse({'error': 'Student id is required.'}, status=400)
    if not student_id.isdigit():
        return JsonResponse({'error': 'Student id is required.'}, status=400) 
    
    if int(student_id) not in activity.activity_joined:
        return JsonResponse({'error': 'Student does not participated.'}, status=400)
    
    student_obj = CustomUser.objects.filter(
        id=int(student_id),
        user_type = 'Student'
    ).first()
    if not student_obj:
        return JsonResponse({'error': 'Student does not participated.'}, status=400)
 
    answer_sheets = activity.activity_content 
    total_score = 0 
    
    student_answer_sheet = {} 
    student_activity = StudentActivity.objects.filter(
        activity = activity, 
        student = student_obj, 
    ).first()
    if ( not student_activity):
        return JsonResponse({'error': 'Student does not submitted.'}, status=400)
         
    total_score = student_activity.scores
    student_answer_sheet = student_activity.activity_answers
        
    for contentKey in answer_sheets: 
        if answer_sheets[contentKey].get('type') == 'selection':
            answer_sheets[contentKey]['answer_id'] = student_answer_sheet.get(contentKey, {}).get('answer', '')
        elif answer_sheets[contentKey].get('type') == 'multiple':
            answer_sheets[contentKey]['answer_ids'] = student_answer_sheet.get(contentKey, {}).get('answers', [])
        elif answer_sheets[contentKey].get('type') == 'essay':
            answer_sheets[contentKey]['answer'] = student_answer_sheet.get(contentKey, {}).get('answer', '')
        elif answer_sheets[contentKey].get('type') == 'question-file':
            answer_sheets[contentKey]['answer'] = student_answer_sheet.get(contentKey, {}).get('answer', '')
        else:
            answer_sheets[contentKey]['answer'] = student_answer_sheet.get(contentKey, {}).get('filename', None)
    
        answer_sheets[contentKey]['score'] = student_answer_sheet.get(contentKey, {}).get('score', 0)
         
    certificate_url = activity.overall_certificate.url if activity.overall_certificate else None
    
    
    data = { 
        'activity_name' : activity.activity_name,
        'activity_description': activity.activity_description,
        'activity_type': activity.activity_type, 
        'activity_due_date': activity.activity_due_date,
        'activity_content': answer_sheets,
        'activity_total_scores': activity.activity_total_scores,
        'activity_total_items': len(activity.activity_content),
        'overall_certificate': certificate_url, 
        'overall_certificate_name' : activity.overall_certificate_name, 
        'total_score' : total_score,
        'student_name' : student_obj.fullname,
        'is_checked' : student_activity.is_checked
    }
    return JsonResponse(data, status = 200)



     
def api_teacher_get_student_activity_files(request):

    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
     
    activity_id = request.POST.get('activity_id', None)
    if not isinstance(activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    
    activity = Activity.objects.filter(id=int(activity_id)).first()
    if not activity:
        return JsonResponse({'error': 'Activity not found.'}, status=400)
    
    activities_fileKeys = []
    for actKey in activity.activity_content:
        if activity.activity_content[actKey].get('type', None) == 'question-file':
            activities_fileKeys.append(activity.activity_content[actKey].get('fileKey', '************'))
    
    activities_files = ActivityFile.objects.filter(
        activity_custom_id__in=activities_fileKeys,
        activity=activity
    ).values() 
            
    return JsonResponse({
        'data': list(activities_files)
    }, status=200)



def api_teacher_check_student_activity(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)

    activity_id = request.POST.get('activity_id', None)
    if not isinstance(activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400) 

    activity = Activity.objects.filter(id=int(activity_id)).first()
    if (not activity):
        return JsonResponse({'error': 'Activity does not exist'}, status=400)
    
    
    student_id = request.POST.get('student_id', None)
    if not isinstance(student_id, str):
        return JsonResponse({'error': 'Student id is required.'}, status=400)
    if not student_id.isdigit():
        return JsonResponse({'error': 'Student id is required.'}, status=400) 
    
    if int(student_id) not in activity.activity_joined:
        return JsonResponse({'error': 'Student does not participated.'}, status=400)
    
    student_obj = CustomUser.objects.filter(
        id=int(student_id),
        user_type = 'Student'
    ).first()
    if not student_obj:
        return JsonResponse({'error': 'Student does not participated.'}, status=400)
    
    # total_score = request.POST.get('total_score', '0')
    checked_scores = json.loads(request.POST.get('datas', "{}"))
     
    student_activity = StudentActivity.objects.filter(
        activity = activity, 
        student = student_obj, 
    ).first()
    if ( not student_activity):
        return JsonResponse({'error': 'Student does not submitted.'}, status=400)
    
    
    # student_activity.scores = int(total_score)
    total_score = 0
    for key in student_activity.activity_answers:
        score = checked_scores.get(key, None)
        if (not score):
            continue
        student_activity.activity_answers[key]['score'] = score
        total_score = total_score + score
    
    student_activity.scores = total_score
    student_activity.is_checked = True
    student_activity.save()
    activity.activity_checked.append(student_obj.pk)
    activity.save()
        
    # TODO: Notify itself
    # TODO : Notify all the students
    return JsonResponse({'success': 'Student successfully checked.'}, status=200)
    
    
    
@require_http_methods(["POST"])
def api_teacher_get_report(request):
    filter_value = request.POST.get("filter")

    # Use filter_value to customize your queryset
    data = [
        {"ID": 1, "Name": "Alice"},
        {"ID": 2, "Name": "Bob"},
    ]

    df = pd.DataFrame(data)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Sheet1")
    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = 'attachment; filename="export.xlsx"'
    return response


    
    