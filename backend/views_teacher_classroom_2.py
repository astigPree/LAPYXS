from django.http import JsonResponse  
from backend import my_utils
import json

from backend.models import *
from datetime import datetime


def api_teacher_create_post(request):
   
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    

    # class ClassroomPost(models.Model):
    #     teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post_teacher')
    #     created_at = models.DateTimeField(auto_now_add=True)
    #     content = models.TextField( null=True, blank=True)
    #     classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post')

    classroom_id = request.POST.get('classroom_id', None)
    content = request.POST.get('content', None) 
    
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not content:
        return JsonResponse({'error': 'Content is required.'}, status=400)
    
    classroom = Classroom.objects.filter(id=int(classroom_id)).first()
    if classroom is None:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    classroom_post = ClassroomPost.objects.create(
        teacher = request.user,
        classroom = classroom,
        content = content
    )
    
    
    # TODO: Notify itself
    # TODO : Notify all the students
    
    return JsonResponse({'success': 'Classroom post created successfully.'}, status=200)


def api_teacher_get_post(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    

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
    ).order_by('-created_at').values('content', 'created_at' , 'id')
    
    
    return JsonResponse({
        'classroom_post': list(classroom_post),
        'name' : request.user.fullname,
        'profile' : request.user.profile_image.url if request.user.profile_image else None
    }, status=200)


def api_teacher_remove_post(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    
    post_id = request.POST.get('post_id', None) 
    if not isinstance(post_id, str):
        return JsonResponse({'error': 'Post id is required.'}, status=400)
    if not post_id.isdigit():
        return JsonResponse({'error': 'Post id is required.'}, status=400) 

    
    classroom_post = ClassroomPost.objects.filter(id=int(post_id)).first()
    if classroom_post is None:
        return JsonResponse({'error': 'Classroom post not found.'}, status=400)
    
    classroom_post.delete()
    
    return JsonResponse({'success': 'Classroom post deleted successfully.'}, status=200)




def api_teacher_reply_post(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
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
    

    # class ClassroomPostReply(models.Model):
    #     replier = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post_replier')
    #     created_at = models.DateTimeField(auto_now_add=True)
    #     content = models.TextField( null=True, blank=True)
    #     post = models.ForeignKey(ClassroomPost, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post_reply')
    #     classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post_reply')

    classroom_post_reply = ClassroomPostReply.objects.create(
        replier=request.user,
        content=content,
        post=classroom_post,
        classroom=classroom_post.classroom
    )

    
    # TODO: Notify itself
    # TODO : Notify all the students
    
    return JsonResponse({'success': 'Classroom post reply created successfully.'}, status=200)


def api_teacher_get_selected_post(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
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
        'name' : request.user.fullname,
        'profile' : request.user.profile_image.url if request.user.profile_image else None
    })


def api_teacher_get_replies(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
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
    
def api_teacher_delete_replies(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    reply_id = request.POST.get('reply_id', None) 
    if not isinstance(reply_id, str):
        return JsonResponse({'error': 'Reply id is required.'}, status=400)
    if not reply_id.isdigit():
        return JsonResponse({'error': 'Reply id is required.'}, status=400) 

    
    classroom_post_reply = ClassroomPostReply.objects.filter(id=int(reply_id)).first()
    if classroom_post_reply is None:
        return JsonResponse({'error': 'Classroom post reply not found.'}, status=400)
    
    classroom_post_reply.delete()
    
    return JsonResponse({'success': 'Classroom post reply deleted successfully.'}, status=200)



def api_teacher_check_all_students(request):
       
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classroom_id : str = request.POST.get('classroom_id', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom ID does not exist.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom ID does not exist.'}, status=400)
    
    classroom_obj = Classroom.objects.filter(id=int(classroom_id)).first()
    if not classroom_obj:
        return JsonResponse({'error' : 'Classroom does not exist'} , status=400)
    
    students_objects = CustomUser.objects.filter(id__in=classroom_obj.classroom_students)
    
    students = []
    for student in students_objects:
        students.append({
            'id' : student.pk,
            'name' : student.fullname,
            'email' : student.email,
            'image' : student.profile_image.url if student.profile_image else None
        })
        
    return JsonResponse({
        'students' : students
    } , status=200)
    
    
def api_teacher_check_student(request):
     
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classroom_id : str = request.POST.get('classroom_id', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom ID does not exist.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom ID does not exist.'}, status=400)
    
    student_id = request.POST.get('student_id', None)
    if not isinstance(student_id, str):
        return JsonResponse({'error': 'Student ID does not exist.'}, status=400)
    if not student_id.isdigit():
        return JsonResponse({'error': 'Student ID does not exist.'}, status=400)
    
    classroom_obj = Classroom.objects.filter(id=int(classroom_id)).first()
    if not classroom_obj:
        return JsonResponse({'error' : 'Classroom does not exist'} , status=400) 
    
    student_obj = CustomUser.objects.filter(id=int(student_id)).first()
    if not student_obj:
        return JsonResponse({'error' : 'Student does not exist'} , status=400)
    
    
    materials = Material.objects.filter(classroom_material = classroom_obj).order_by('-created_at')
    materials_data = []
    for material in materials:
        material_data = {
            'id' : material.pk,
            'name' : material.material_name, 
            'created_at' :  material.created_at,
            'date' : material.created_at.strftime("%B %d, %Y, %I:%M %p") if material.created_at else None,
            'submitted' : True if int(student_id) in material.material_joined else False, 
            'type' : 'Material'
        }
        materials_data.append(material_data)
    
    activities = Activity.objects.filter(activity_classroom = classroom_obj).order_by('-created_at')
    activities_data = []
    for activity in activities:
        activity_data = {
            'id' : activity.pk,
            'name' : activity.activity_name,
            'created_at' :  activity.activity_starting_date,
            'date' : activity.activity_starting_date.strftime("%B %d, %Y, %I:%M %p") if activity.activity_starting_date else None,
            'submitted' : True if int(student_id) in activity.activity_joined else False,
            'type' : 'Activity'
        }
        activities_data.append(activity_data)
        
    
    student_data = {
        'name' : student_obj.fullname,
        'email' : student_obj.email,
        'profile' : student_obj.profile_image.url if student_obj.profile_image else None,
        'school_name' : student_obj.school_name,
        'grade_level' : student_obj.grade_level,
        'bio' :student_obj.short_bio
    }
    
    # TODO: Merge the activities and sort it by created at (APPLIED)
    all_items = materials_data + activities_data
    all_items.sort(key=lambda x: x['created_at'], reverse=True)
    return JsonResponse({
        'student' : student_data,
        'datas' : all_items
    }, status = 200)
    

    

def api_get_teacher_activities(request):
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classroom_id = request.POST.get('classroom_id', None)
    selected_month = request.POST.get('selected_month', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not selected_month:
        return JsonResponse({'error': 'Selected month is required.'}, status=400)
    try:
        selected_month = int(selected_month.split('-')[1])  # "09" → 9
    except (AttributeError, ValueError, IndexError):
        return JsonResponse({'error': 'Invalid month format'}, status=400)
    
    classroom = Classroom.objects.filter(id=int(classroom_id)).first()
    if not classroom:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    activities = Activity.objects.filter(
        activity_classroom=classroom, 
        activity_owner=request.user,
        created_at__month=selected_month
    ).order_by('-created_at').values()
    
    return JsonResponse({'activities': list(activities)}, status=200)




def api_teacher_delete_activity(request):
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
    
    activity.delete()
    
    # TODO: Notify itself
    # TODO : Notify all the students
    return JsonResponse({'success': 'Activity deleted successfully.'}, status=200)



def api_teacher_add_activity(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    # 'activity_name' : activity_name?.value,
    # 'activity_description' : activity_descriptions?.value,
    # 'activity_type' : activity_classfications?.value,
    # 'activity_starting_date' : activity_starting_date?.value,
    # 'activity_starting_time' : activity_starting_time?.value,
    # 'activity_deadline_date' : activity_deadline_date?.value,
    # 'activity_deadline_time' : activity_deadline_time?.value, 
    
    classroom_id = request.POST.get('classroom_id', None) 
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    
    classroom = Classroom.objects.filter(id=int(classroom_id)).first()
    if not classroom:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    activity_name = request.POST.get('activity_name', '')
    activity_description = request.POST.get('activity_description', '')
    activity_type = request.POST.get('activity_type', '')
    activity_starting_date = request.POST.get('activity_starting_date', '')
    activity_starting_time = request.POST.get('activity_deadline_time', '')
    activity_deadline_date = request.POST.get('activity_deadline_date', '')
    activity_deadline_time = request.POST.get('activity_deadline_time', '')
    activity_total_scores = request.POST.get('activity_total_scores', '0')
    activity_overall_certificate_name = request.POST.get('overall_certificate_name', 'No File Uploaded')
    activity_overall_certificate_file = request.FILES.get('activity_overall_certificate_file', None)
    datas = json.loads(request.POST.get('datas', '{}')) 
     
    try:
        activity_starting_datetime = datetime.strptime(
            f"{activity_starting_date} {activity_starting_time}", "%Y-%m-%d %H:%M"
        )
        activity_due_date_datetime = datetime.strptime(
            f"{activity_deadline_date} {activity_deadline_time}", "%Y-%m-%d %H:%M"
        )
    except ValueError: 
        return JsonResponse({'error': 'Incorrect Date Selected'}, status=400)
    
    activity_obj = Activity.objects.create(
        activity_name = activity_name,
        activity_description = activity_description,
        activity_type = activity_type,
        activity_owner = request.user,
        activity_classroom = classroom,
        activity_content = datas,
        overall_certificate = activity_overall_certificate_file,
        activity_total_scores = int(activity_total_scores),
        activity_due_date = activity_due_date_datetime,
        activity_starting_date = activity_starting_datetime,
        overall_certificate_name = activity_overall_certificate_name
    )
    
    for key in datas: 
        if datas[key].get('type', None) == 'question-file':
            question_file = request.FILES.get(datas[key].get('fileKey', 'None'), None)
            if question_file:
                ActivityFile.objects.create(
                    activity_file =question_file,
                    activity_custom_id = datas[key].get('fileKey', None),
                    activity = activity_obj,
                    activity_file_classroom = classroom
                )
            
    
    # TODO: Notify itself
    # TODO : Notify all the students

    return JsonResponse({'success': 'Activity added successfully.'}, status=200)