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
    



def api_get_student_classroom(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a Student.'}, status=400)
    
    classroom_id = request.POST.get('classroom_id', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    
    if int(classroom_id) not in request.user.classrooms:
        return JsonResponse({'error': 'You are not in this classroom.'}, status=400)
    
    classroom = Classroom.objects.filter(id=int(classroom_id)).first()
    if not classroom:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    return JsonResponse({
        'classroom': {
            'classroom_name': classroom.classroom_name, 
            'classroom_description': classroom.classroom_description,
            'classroom_subject': classroom.classroom_subject,
            'classroom_link_id': classroom.classroom_link_id
        }
    }, status=200)
    
    
def api_student_leave_classroom(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a Student.'}, status=400)
    
    classroom_id = request.POST.get('classroom_id', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    
    classroom = Classroom.objects.filter(id=int(classroom_id)).first()
    if not classroom:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    request.user.classrooms.remove(classroom.pk)
    request.user.save()
    
    return JsonResponse({'success': 'Classroom left successfully.'}, status=200)



def api_get_student_materials_activities(request):
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
    if not selected_month:
        return JsonResponse({'error': 'Selected month is required.'}, status=400)
    try:
        selected_month = int(selected_month.split('-')[1])  # "09" → 9
    except (AttributeError, ValueError, IndexError):
        return JsonResponse({'error': 'Invalid month format'}, status=400)
    
    
    classroom = Classroom.objects.filter(id=int(classroom_id)).first()
    if not classroom:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    
    materials = Material.objects.filter(
        classroom_material=classroom,
        created_at__month=selected_month
    ).order_by('-created_at')
    activities = Activity.objects.filter(
        activity_classroom=classroom,
        created_at__month=selected_month
    ).order_by('-created_at')
    
    list_of_materials = []
    for material in materials:
        list_of_materials.append({
            'name': material.material_name,
            'id' : material.pk,
            'is_joined' : request.user.pk in material.material_joined,
            'uploaded_date' : material.created_at.strftime("%B %d, %Y, %I:%M %p") if material.created_at else None,
            'due_date' : None
        })
    
    list_of_activities = []
    for activity in activities:
        list_of_activities.append({
            'name': activity.activity_name,
            'id' : activity.pk,
            'is_joined' : request.user.pk in activity.activity_joined,
            'uploaded_date' : activity.created_at.strftime("%B %d, %Y, %I:%M %p") if activity.created_at else None,
            'due_date' : activity.activity_due_date.strftime("%B %d, %Y, %I:%M %p") if activity.activity_due_date else None
        })
        
    # Joined and sort by latest uploaded date
    all_items = list_of_materials + list_of_activities
    all_items.sort(key=lambda x: x['uploaded_date'], reverse=True)
     
    
    return JsonResponse({ 
        'all_items' : all_items 
    }, status=200)
    
    


