from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout
from django.urls import reverse
from django.utils.timezone import localtime, now
from backend.model_utils import *

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
    classrooms_objs = Classroom.objects.filter(id__in=classrooms_ids[::-1])
    
    for cls_obj in classrooms_objs:  
        classroom_data = {
            'classroom_name': cls_obj.classroom_name, 
            'id': cls_obj.pk,
            'number_of_students': len(cls_obj.classroom_students) if cls_obj.classroom_students else 0
        }
         
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
    
    classroom_obj.classroom_students.append(request.user.pk)
    classroom_obj.save()
      
    createNotification(
        user=classroom_obj.classroom_owner,
        title="New Student Joined!",
        content=f"Student named {request.user.fullname} joined the classroom {classroom_obj.classroom_name}",
        link="teacher_students",
        action=f"sessionStorage.setItem('classroom_id',{classroom_obj.pk});"
    )

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
    
    classroom.classroom_students.remove(request.user.pk)
    classroom.save()
    
    # Notify teacher
    teacher = classroom.classroom_owner
    if teacher:
        Notification.objects.create(
            title = "Classroom left",
            content = f"{request.user.fullname} left classroom {classroom.classroom_name}",
            user = teacher
        )
    
    createNotification(
        user=classroom.classroom_owner,
        title="Student Leave!",
        content=f"Student named {request.user.fullname} leave the classroom {classroom.classroom_name}",
        link="teacher_students",
        action=f"sessionStorage.setItem('classroom_id',{classroom.pk});"
    )

    
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
    current_local_datetime = localtime(now())
    activities = Activity.objects.filter(
        activity_classroom=classroom,
        activity_starting_date__month=selected_month,
        activity_starting_date__lte=current_local_datetime
    ).order_by('-created_at')
    
    list_of_materials = []
    for material in materials:
        list_of_materials.append({
            'type' : 'Material',
            'name': material.material_name,
            'id' : material.pk,
            'is_joined' : request.user.pk in material.material_joined,
            'uploaded_date' : material.created_at.strftime("%B %d, %Y, %I:%M %p") if material.created_at else None,
            'due_date' : None
        })
    
    list_of_activities = []
    for activity in activities:
        list_of_activities.append({
            'type' : activity.activity_type,
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
    
    


def api_student_get_material(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a Student.'}, status=400)
    
    material_id = request.POST.get('material_id', None)
    if not isinstance(material_id, str):
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    if not material_id.isdigit():
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    
    material = Material.objects.filter(id=int(material_id)).first()
    if not material:
        return JsonResponse({'error': 'Material not found.'}, status=400)
    
    return JsonResponse({
        'material_name': material.material_name,
        'material_description': material.material_description,
        'material_link': material.material_link,
        'material_file': material.material_file.url if material.material_file else None,
        'is_joined' : request.user.pk in material.material_joined
    }, status=200)



def api_student_join_material(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Student":
        return JsonResponse({'error': 'You are not a Student.'}, status=400)
    
    material_id = request.POST.get('material_id', None)
    if not isinstance(material_id, str):
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    if not material_id.isdigit():
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    
    material = Material.objects.filter(id=int(material_id)).first()
    if not material:
        return JsonResponse({'error': 'Material not found.'}, status=400)
    
    if request.user.pk in material.material_joined:
        return JsonResponse({'error': 'You have already joined this material.'}, status=400)
    
    # Join material
    material.material_joined.append(request.user.pk)
    material.save()
     
    StudentMaterial.objects.create(
        student=request.user,
        material=material
    )
    
    # createNotification(
    #     user=classroom_obj.classroom_owner,
    #     title="New Student Joined!",
    #     content=f"Student named {request.user.fullname} joined the classroom {classroom_obj.classroom_name}",
    #     link="teacher_students",
    #     action=f"sessionStorage.setItem('classroom_id',{classroom_obj.pk});"
    # )
    
    return JsonResponse({'success': 'Material joined successfully.'}, status=200)










