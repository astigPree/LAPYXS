from django.http import JsonResponse  
from backend import my_utils
import json

from backend.models import *
from datetime import datetime
from django.utils.timezone import localtime, now
from backend.model_utils import createNotification


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
        'subject' : activity.subject if activity.subject else "Not Provided",
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
        'subject' : activity.subject if activity.subject else "Not Provided",
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
         
    # Notify student
    createNotification(
        user=student_obj,
        title=f"Checked Student",
        content=f"Teacher check the {activity.activity_name}! view the result now!",
        link="student_classroom_view_activity",
        action=f"sessionStorage.setItem('activity_id',{activity.pk});sessionStorage.setItem('classroom_id',{activity.activity_classroom.pk});"
    )
    return JsonResponse({'success': 'Student successfully checked.'}, status=200)
    
    
    
def api_teacher_get_list_of_message(request): 
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classrooms = Classroom.objects.filter(
        classroom_owner = request.user
    )
    
    students_pks = []
    for classroom in classrooms:
        students_pks += classroom.classroom_students
     
    students_pks = list(set(students_pks))
    
    students = CustomUser.objects.filter(
        id__in = students_pks,
        user_type = 'Student'
    )
     
    messages = []
    for student in students:
        student_info = {
            'id' : student.pk,
            'name' : student.fullname,
            'last_message' : "There is no message recorded.",
            'is_read' : True,
            'image' : student.profile_image.url if student.profile_image else None,
            'created_at' : now(),
        } 
        last_message_student = Message.objects.filter(
            sender = student,
            receiver = request.user, 
        ).order_by('-id').first() 
        last_message_teacher = Message.objects.filter(
            sender = request.user,
            receiver = student, 
        ).order_by('-id').first() 
        if last_message_student and last_message_teacher:
            if last_message_student.created_at > last_message_teacher.created_at:
                student_info['last_message'] = last_message_student.content
                student_info['is_read'] = last_message_student.is_seen_by_receiver
                student_info['created_at'] = last_message_student.created_at
            else:
                student_info['last_message'] = last_message_teacher.content
                student_info['is_read'] = last_message_teacher.is_seen
                student_info['created_at'] = last_message_teacher.created_at
        elif last_message_student:
            student_info['last_message'] = last_message_student.content
            student_info['is_read'] = last_message_student.is_seen_by_receiver
            student_info['created_at'] = last_message_student.created_at
        elif last_message_teacher:
            student_info['last_message'] = last_message_teacher.content
            student_info['is_read'] = last_message_teacher.is_seen
            student_info['created_at'] = last_message_teacher.created_at
        
        
        
            
                
        # if last_message:
        #     student_info['last_message'] = last_message.content
        #     student_info['is_read'] = last_message.is_seen
        #     student_info['created_at'] = last_message.created_at
        
        
        messages.append(student_info)
        
    messages.sort(key=lambda x: x['created_at'], reverse=True)


    return JsonResponse({
        "messages" : messages
    }, status=200)
    
    
    
    
    
    