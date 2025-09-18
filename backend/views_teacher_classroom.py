from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout
from django.urls import reverse

from backend import my_utils

from backend.models import *

def api_create_classroom(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classroom_name = request.POST.get('classroom_name', None) 
    classroom_description = request.POST.get('classroom_description', None)
    classroom_subject = request.POST.get('classroom_subject', None) 
    if not classroom_name:
        return JsonResponse({'error': 'Classroom name is required.'}, status=400)
    if not classroom_description:
        return JsonResponse({'error': 'Classroom description is required.'}, status=400)
    if not classroom_subject:
        return JsonResponse({'error': 'Classroom subject is required.'}, status=400)
     
    try:
        classroom = Classroom.objects.create(
            classroom_name = classroom_name,
            classroom_description = classroom_description,
            classroom_subject = classroom_subject,
            classroom_owner = request.user
        )
        classroom.classroom_link_id = my_utils.generate_obfuscated_id(classroom.id, 10)
        classroom.save()
        
        
        Notification.objects.create(
            title = "Classroom",
            content = f"Classroom {classroom.classroom_name} has been created",
            user = request.user
        )
        return JsonResponse({'success': 'Classroom created successfully.'}, status=200)
    except Exception as e:
        return JsonResponse({'err': str(e) , "error": "Something went wrong please try again later"}, status=400)
    
    
    
def api_get_teacher_classrooms(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classrooms = Classroom.objects.filter(classroom_owner=request.user)
    classrooms_data = []
    for classroom in classrooms:
        classroom_data = {
            'classroom_name': classroom.classroom_name, 
            'id': classroom.pk,
            'number_of_students': 0
        }
        
        User : CustomUser = get_user_model()
        
        for student in User.objects.filter(user_type="Student"):
            if classroom in student.classrooms:
                classroom_data['number_of_students'] += 1
        
        
        classrooms_data.append(classroom_data)
         
        
    return JsonResponse({'classrooms': classrooms_data}, status=200)

