from django.http import JsonResponse  
from backend import my_utils
from django.utils.timezone import localtime, now
import json

from backend.models import *
 
def api_student_get_post(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a Student.'}, status=400)
    

    classroom_id = request.POST.get('classroom_id', None)
    selected_month = request.POST.get('selected_month', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400) 
    try:
        selected_month = int(selected_month.split('-')[1])  # "09" → 9
    except (AttributeError, ValueError, IndexError):
        return JsonResponse({'error': 'Invalid month format'}, status=400)
    
    classroom = Classroom.objects.filter(id=int(classroom_id)).first()
    if classroom is None:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    classroom_post = ClassroomPost.objects.filter(
        classroom=classroom, 
        created_at__month=selected_month
    ).order_by('-created_at').values(
        'content', 'created_at' , 
        'id' , 'teacher__profile_image', 'teacher__fullname')
    
    
    return JsonResponse({
        'classroom_post': list(classroom_post)
    }, status=200)
 

def api_student_reply_post(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a Student.'}, status=400)
    
    post_id = request.POST.get('post_id', None)
    content = request.POST.get('content', None) 
    if not isinstance(post_id, str):
        return JsonResponse({'error': 'Post id is required.'}, status=400)
    if not post_id.isdigit():
        return JsonResponse({'error': 'Post id is required.'}, status=400)
    if not content:
        return JsonResponse({'error': 'Content is required.'}, status=400)
    
    classroom_post = ClassroomPost.objects.filter(id=int(post_id)).first()
    if classroom_post is None:
        return JsonResponse({'error': 'Classroom post not found.'}, status=400)
 
    classroom_post_reply = ClassroomPostReply.objects.create(
        replier=request.user,
        content=content,
        post=classroom_post,
        classroom=classroom_post.classroom
    )

    # NOTIFY the teacher
    # Notification.objects.create(
    #     title = "Reply Post",
    #     content = f"{request.user.fullname} replied to the post.",
    #     user = classroom_post.classroom.classroom_owner
    # ) 
    
    return JsonResponse({'success': 'Classroom post reply created successfully.'}, status=200)


def api_student_get_selected_post(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a student.'}, status=400)
    
    post_id = request.POST.get('post_id', None) 
    if not isinstance(post_id, str):
        return JsonResponse({'error': 'Post id is required.'}, status=400)
    if not post_id.isdigit():
        return JsonResponse({'error': 'Post id is required.'}, status=400) 

    
    classroom_post = ClassroomPost.objects.filter(id=int(post_id)).first()
    if classroom_post is None:
        return JsonResponse({'error': 'Classroom post not found.'}, status=400)
     
    return JsonResponse({
        'content' : classroom_post.content,
        'created_at' : classroom_post.created_at,
        'id' : classroom_post.pk,
        'name' : classroom_post.teacher.fullname,
        'profile' : classroom_post.teacher.profile_image.url if classroom_post.teacher.profile_image else None
    })


def api_student_get_replies(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a student.'}, status=400)
    
    post_id = request.POST.get('post_id', None) 
    if not isinstance(post_id, str):
        return JsonResponse({'error': 'Post id is required.'}, status=400)
    if not post_id.isdigit():
        return JsonResponse({'error': 'Post id is required.'}, status=400) 

    
    classroom_post = ClassroomPost.objects.filter(id=int(post_id)).first()
    if classroom_post is None:
        return JsonResponse({'error': 'Classroom post not found.'}, status=400)
    
    classroom_post_reply = ClassroomPostReply.objects.filter(
        post=classroom_post
    ).order_by('-created_at').values(
        'content',
        'created_at',
        'id',
        'replier__profile_image',
        'replier__fullname'
    )

    
    
    return JsonResponse({
        'classroom_post_reply': list(classroom_post_reply)
    })
     


def api_student_get_dashboard(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a student.'}, status=400)


    number_of_classroom = 0
    for classroom_obj in Classroom.objects.all():
        if request.user.pk in classroom_obj.classroom_students:
            number_of_classroom += 1
    
    
    number_of_joined_material = 0
    for material_obj in Material.objects.all():
        if request.user.pk in material_obj.material_joined:
            number_of_joined_material += 1
    

    number_of_joined_activity = 0
    for activity_obj in Activity.objects.all():
        if request.user.pk in activity_obj.activity_joined:
            number_of_joined_activity += 1
    
    
    return JsonResponse({
        'number_of_classroom': number_of_classroom,
        'number_of_joined_material': number_of_joined_material,
        'number_of_joined_activity': number_of_joined_activity,
    }, status=200)




def api_student_get_activity(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a student.'}, status=400)

    activity_id = request.POST.get('activity_id', None)
    if not isinstance(activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400) 

    activity = Activity.objects.filter(id=int(activity_id)).first()
    if (not activity):
        return JsonResponse({'error': 'Activity does not exist'}, status=400)
 
    answer_sheets = activity.activity_content
    is_participated = request.user.pk in activity.activity_joined
    total_score = 0
    # if (not is_participated):
    #     for contentKey in answer_sheets: 
    #         if answer_sheets[contentKey].get('type') == 'selection':
    #             answer_sheets[contentKey]['answer_id'] = '' 
    #         elif answer_sheets[contentKey].get('type') == 'multiple':
    #             answer_sheets[contentKey]['answer_ids'] = [] 
    
    student_answer_sheet = {}
    if is_participated:
        student_activity = StudentActivity.objects.filter(
            activity = activity, 
            student = request.user, 
        ).first()
        if (student_activity):
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
        
        
        
        
    certificate_url = activity.overall_certificate.url if activity.overall_certificate else None
    
    
    data = { 
        'activity_name' : activity.activity_name,
        'activity_description': activity.activity_description,
        'activity_type': activity.activity_type, 
        'activity_due_date': activity.activity_due_date,
        'activity_content': answer_sheets,
        'activity_total_scores': activity.activity_total_scores,
        'activity_total_items': len(activity.activity_content),
        'overall_certificate': certificate_url if is_participated else None, 
        'overall_certificate_name' : activity.overall_certificate_name,
        'is_participated' : is_participated,
        'total_score' : total_score
    }
    return JsonResponse(data, status = 200)




     
def api_student_get_activity_files(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a student.'}, status=400)
    
     
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



     
def api_student_submit_activity_files(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a student.'}, status=400)
    
    activity_id = request.POST.get('activity_id', None)
    if not isinstance(activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    
    activity = Activity.objects.filter(id=int(activity_id)).first()
    if not activity:
        return JsonResponse({'error': 'Activity not found.'}, status=400)
    
    if (request.user.pk in activity.activity_joined):
        return JsonResponse({'error': 'Already submitted the activity.'}, status=400) 
    
    datas = json.loads(request.POST.get('datas', "{}"))
    
    student_activity = StudentActivity.objects.create(
        activity = activity,
        activity_answers = datas,
        student = request.user,
    )
    
    for dataKey in datas:
        if datas[dataKey].get('type', None) == 'file-submission':
            question_file = request.FILES.get(datas[dataKey].get('fileKey', 'None'), None)
            StudentActivityFile.objects.create(
                activity_file = question_file,
                student_activity_custom_id = datas[dataKey].get('fileKey', None), 
                student_activity = student_activity,
                activity_file_classroom = activity.activity_classroom
            )
    
    activity.activity_joined.append(request.user.pk)
    activity.save()
     
    # NOTIFY the itself
    # Notification.objects.create(
    #     title = "Submit Activity",
    #     content = f"You have successfully submitted the activity on {activity.activity_name}",
    #     user = request.user
    # ) 
    # NOTIFY the teacher
    # Notification.objects.create(
    #     title = "Submit Activity",
    #     content = f"{request.user.fullname} submit its activity on {activity.activity_name}",
    #     user = activity.activity_owner
    # ) 
    
    
    
    return JsonResponse({
        'success': 'Activity submmited successfully.',
        'student_activity' : student_activity.pk
    }, status=200)



def api_student_submit_checking_activity_files(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a student.'}, status=400)
    
    student_activity_id = request.POST.get('student_activity_id', None)
    if not isinstance(student_activity_id, str):
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    if not student_activity_id.isdigit():
        return JsonResponse({'error': 'Activity id is required.'}, status=400)
    
    
    student_activity_obj = StudentActivity.objects.filter(
        student = request.user,
        id=int(student_activity_id)
    ).first()
    if not student_activity_obj:
        return  JsonResponse({'error': 'Activity not find.'}, status=400)
    
    # Doing manual checking only works in multiple and selection
    activity_obj = student_activity_obj.activity
    total_scores = 0
    if (student_activity_obj.activity_answers):
        for key in student_activity_obj.activity_answers:
            temp2 = student_activity_obj.activity_answers.get(key , None)
            
            if (temp2.get('type', None) == 'selection'):
                temp = activity_obj.activity_content.get(key , None) 
                if (temp):
                    if temp2.get('answer', None) == temp.get('answer_id', '~'):
                        total_scores = 1 + total_scores
                        student_activity_obj.activity_answers[key]['result'] = True
                        student_activity_obj.activity_answers[key]['score'] = 1
                    else:
                        student_activity_obj.activity_answers[key]['result'] = False
                        student_activity_obj.activity_answers[key]['score'] = 0
                        
            elif (temp2.get('type', None) == 'multiple'):
                temp = activity_obj.activity_content.get(key , None) 
                if (temp):
                    student_activity_obj.activity_answers[key]['result'] = False
                    student_activity_obj.activity_answers[key]['score'] = 0
                    for answer in temp2.get('answers', []):
                        if answer in temp.get('answer_ids', []):
                            total_scores = 1 + total_scores
                            student_activity_obj.activity_answers[key]['score'] = 1 + student_activity_obj.activity_answers[key]['score']
                            student_activity_obj.activity_answers[key]['result'] = True # Not needed but added

            else:
                # Create a data for other answers
                student_activity_obj.activity_answers[key]['result'] = False
                student_activity_obj.activity_answers[key]['score'] = 0
            
    student_activity_obj.scores = total_scores
    student_activity_obj.save()
         
    return JsonResponse({'success': 'Activity submitted successfully.'}, status=200)

