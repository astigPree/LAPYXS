from django.http import JsonResponse  
from backend import my_utils

from backend.models import *


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
    ).order_by('-created_at').values('content', 'created_at')
    
    
    return JsonResponse({'classroom_post': list(classroom_post)}, status=200)


