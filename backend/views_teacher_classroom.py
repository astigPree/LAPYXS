from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout
from django.urls import reverse
from backend.model_utils import createNotification

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
        
        classroom_conferencing = ClassroomConferencing.objects.create(
            classroom = classroom,
            room_name = classroom.classroom_link_id
        )
        
        createNotification(
            user=request.user,
            title="Successfully Created Classrom",
            content=f"You have successfully created classroom named {classroom.classroom_name}",
            link="teacher_materials",
            action=f"sessionStorage.setItem('classroom_id',{classroom.pk});"
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
    
    classrooms = Classroom.objects.filter(classroom_owner=request.user).order_by('-created_at')
    classrooms_data = []
    for classroom in classrooms:
        classroom_data = {
            'classroom_name': classroom.classroom_name, 
            'id': classroom.pk,
            'number_of_students': len(classroom.classroom_students) if classroom.classroom_students else 0,
            'classroom_link_id': classroom.classroom_link_id
        }
        
        classrooms_data.append(classroom_data)
         
        
    return JsonResponse({'classrooms': classrooms_data}, status=200)


def api_update_teacher_classroom(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classroom_id = request.POST.get('classroom_id', None)  
    classroom_name = request.POST.get('classroom_name', None) 
    classroom_description = request.POST.get('classroom_description', None) 
    classroom_subject = request.POST.get('classroom_subject', None) 
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_name:
        return JsonResponse({'error': 'Classroom name is required.'}, status=400)
    if not classroom_description:
        return JsonResponse({'error': 'Classroom description is required.'}, status=400)
    if not classroom_subject:
        return JsonResponse({'error': 'Classroom subject is required.'}, status=400)
    
    classroom = Classroom.objects.filter(id=int(classroom_id), classroom_owner=request.user).first()
    if not classroom:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    
    classroom.classroom_name = classroom_name
    classroom.classroom_description = classroom_description
    classroom.classroom_subject = classroom_subject
    classroom.save()
     
     
    return JsonResponse({'success': 'Classroom updated successfully.'}, status=200)


def api_get_teacher_classroom(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classroom_id = request.POST.get('classroom_id', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    
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


def api_get_teacher_materials(request):
    
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
    
    materials = Material.objects.filter(
        classroom_material=classroom, 
        material_owner=request.user,
        created_at__month=selected_month
    ).order_by('-created_at').values()
    
    return JsonResponse({'materials': list(materials)}, status=200)



def api_teacher_delete_classroom(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    classroom_id = request.POST.get('classroom_id', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    
    classroom = Classroom.objects.filter(id=int(classroom_id), classroom_owner=request.user).first()
    if not classroom:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)

   # NOTIFY all the students
    # students = CustomUser.objects.filter(id__in = classroom.classroom_students)
    # for student in students:
    #     Notification.objects.create(
    #         title = "Classroom Deleted",
    #         content = f"{classroom.classroom_name} has been deleted!",
    #         user = student
    #     ) 
    
    students = CustomUser.objects.filter(id__in = classroom.classroom_students)
    for student in students:
        createNotification(
            user=student,
            title="Classroom Deleted",
            content=f"Classroom has been deleted {classroom.classroom_name}",
            link="student_classroom",
            action=f"console.log('deleted classroom {classroom.pk}');"
        )
        
    classroom.delete() 
    
    return JsonResponse({'success': 'Classroom deleted successfully.'}, status=200)



def api_teacher_add_material(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
     
    classroom_id = request.POST.get('classroom_id', None)
    material_name = request.POST.get('material_name', None)
    material_description = request.POST.get('material_description', None)
    material_link = request.POST.get('material_link', None)
    material_file = request.FILES.get('material_file', None)
    if not isinstance(classroom_id, str):
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not classroom_id.isdigit():
        return JsonResponse({'error': 'Classroom id is required.'}, status=400)
    if not isinstance(material_name, str):
        return JsonResponse({'error': 'Material name is required.'}, status=400)
    if not isinstance(material_description, str):
        return JsonResponse({'error': 'Material description is required.'}, status=400)
    
    if material_link:
        if not isinstance(material_link, str):
            return JsonResponse({'error': 'Material link is required.'}, status=400)
        
    classroom_obj = Classroom.objects.filter(id=int(classroom_id)).first()
    if not classroom_obj:
        return JsonResponse({'error': 'Classroom not found.'}, status=400)
    try:
        material_obj = Material.objects.create(
            material_name=material_name,
            material_description=material_description,  
            classroom_material=classroom_obj,
            material_owner=request.user
        )
        
        if material_link:
            material_obj.material_link = material_link
        if material_file:
            material_obj.material_file = material_file
        material_obj.save()
        
         
        students = CustomUser.objects.filter(pk__in=classroom_obj.classroom_students, user_type="Student")
        for student in students:
            createNotification(
                user=student,
                title="Material has been added",
                content=f"Material has been added in the classroom {classroom_obj.classroom_name}",
                link="student_materials",
                action=f"sessionStorage.setItem('classroom_id',{classroom_obj.pk});"
            )
        
            # Notification.objects.create(
            #     title = 'New material added',
            #     content = f"{classroom_obj.classroom_name} has added a new material.",
            #     user = student
            # )
        
    except Exception as e:
        return JsonResponse({'err': str(e) , 'error': 'Failed to add material.'}, status=400)
    
    return JsonResponse({'success': 'Material added successfully.'}, status=200)



def api_teacher_delete_material(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    material_id = request.POST.get('material_id', None)
    if not isinstance(material_id, str):
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    if not material_id.isdigit():
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    
    material = Material.objects.filter(id=int(material_id), material_owner=request.user).first()
    if not material:
        return JsonResponse({'error': 'Material not found.'}, status=400)
    
   # NOTIFY all the students
    # students = CustomUser.objects.filter(id__in = material.classroom_material.classroom_students)
    # for student in students:
    #     Notification.objects.create(
    #         title = "Material Deleted",
    #         content = f"{material.material_name} has been delete!",
    #         user = student
    #     ) 
    
    material.delete()
     
    
    
    return JsonResponse({'success': 'Material deleted successfully.'}, status=200)



def api_teacher_get_material(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    material_id = request.POST.get('material_id', None)
    if not isinstance(material_id, str):
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    if not material_id.isdigit():
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    
    material = Material.objects.filter(id=int(material_id), material_owner=request.user).first()
    if not material:
        return JsonResponse({'error': 'Material not found.'}, status=400)
    
    return JsonResponse({
        'material_name': material.material_name,
        'material_description': material.material_description,
        'material_link': material.material_link,
        'material_file': material.material_file.url if material.material_file else None
    }, status=200)


def api_teacher_update_material(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
    material_id = request.POST.get('material_id', None)
    material_name = request.POST.get('material_name', None)
    material_description = request.POST.get('material_description', None)
    material_link = request.POST.get('material_link', None)
    material_file = request.FILES.get('material_file', None)
    if not isinstance(material_id, str):
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    if not material_id.isdigit():
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    if not isinstance(material_name, str):
        return JsonResponse({'error': 'Material name is required.'}, status=400)
    if not isinstance(material_description, str):
        return JsonResponse({'error': 'Material description is required.'}, status=400)
     
    if not isinstance(material_link, str):
        return JsonResponse({'error': 'Material link is required.'}, status=400)
    
        
    material = Material.objects.filter(id=int(material_id), material_owner=request.user).first()
    if not material:
        return JsonResponse({'error': 'Material not found.'}, status=400)
    try:
        material.material_name = material_name
        material.material_description = material_description
        material.material_link = material_link
        if material_file:
            material.material_file = material_file
            
        material.save()

    
    
    
    except Exception as e:
        return JsonResponse({'err': str(e) , 'error': 'Failed to update material.'}, status=400)
    
    return JsonResponse({'success': 'Material updated successfully.'}, status=200)




def api_teacher_get_material_joined(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.user.user_type != "Teacher":
        return JsonResponse({'error': 'You are not a teacher.'}, status=400)
    
     
    material_id = request.POST.get('material_id', None)
    if not isinstance(material_id, str):
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    if not material_id.isdigit():
        return JsonResponse({'error': 'Material id is required.'}, status=400)
    
    material = Material.objects.filter(id=int(material_id), material_owner=request.user).first()
    if not material:
        return JsonResponse({'error': 'Material not found.'}, status=400)
    
    
    students = CustomUser.objects.filter(
        pk__in=material.material_joined,
        user_type="Student"
    )
    
    students_data = []
    for student_obj in students:
        students_data.append({
            'id': student_obj.pk,
            'fullname' : student_obj.fullname,
            'email': student_obj.email,
            'profile_image': student_obj.profile_image.url if student_obj.profile_image else None
        })
        
    return JsonResponse({
        'students': students_data
    }, status=200)
        
        
        
        
        
        
        