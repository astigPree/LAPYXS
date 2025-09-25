from django.http import JsonResponse  
from backend import my_utils

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

    # TODO : Notify all the students
    
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
     


