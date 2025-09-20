from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout
from django.urls import reverse

from backend import my_utils

from backend.models import *


def api_get_student_classrooms(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a Student.'}, status=400)
    
    classrooms_ids : list = request.user.classrooms
    classrooms = []
    has_changed = False
    for cls_id in classrooms_ids[::-1]:
        classroom_obj = Classroom.objects.filter(id=cls_id).first()
        if not classroom_obj:
            request.user.classrooms.remove(cls_id)
            has_changed = True
            continue
        
        classroom_data = {
            'classroom_name': classroom_obj.classroom_name, 
            'id': classroom_obj.pk,
            'number_of_students': 0
        }
        
        User : CustomUser = get_user_model()
        
        for student in User.objects.filter(user_type="Student"):
            if classroom_obj.pk in student.classrooms:
                classroom_data['number_of_students'] += 1

        
        classrooms.append(classroom_data)
    
    if has_changed:
        request.user.save()

    return JsonResponse({'classrooms': classrooms}, status=200)



def api_student_join_classroom(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a Student.'}, status=400)
    
    
    classroom_link_id = request.POST.get('classroom_link_id', None)
    if not classroom_link_id:
        return JsonResponse({'error': 'Classroom link id is required.'}, status=400)
    
    classroom_obj = Classroom.objects.filter(classroom_link_id=classroom_link_id).first()
    if not classroom_obj:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    if classroom_obj.pk in request.user.classrooms:
        return JsonResponse({'error': 'You are already in this classroom.'}, status=400)
    
    request.user.classrooms.append(classroom_obj.pk)
    request.user.save()
    
    return JsonResponse({'success': 'Classroom joined successfully.'}, status=200)
    
    
    


