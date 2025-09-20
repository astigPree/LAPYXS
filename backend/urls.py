from django.urls import path
from backend.views import *

urlpatterns = [
    path('register', api_register_auth , name='api_register_auth'),
    path('login', api_login_auth , name='api_login_auth'),
    path('logout', api_logout_auth , name='api_logout_auth'),
    path('update', api_update_auth , name='api_update_auth'),
    
    # TEACHER ------------------------
    path('create_classroom', api_create_classroom , name='api_create_classroom'),
    path('get_teacher_classrooms', api_get_teacher_classrooms , name='api_get_teacher_classroom'),
    path('update_classroom', api_update_teacher_classroom , name='api_update_teacher_classroom'),
    path('get_teacher_selected_classroom', api_get_teacher_classroom , name='api_get_teacher_classroom'),
    path('get_teacher_classroom_materials', api_get_teacher_materials , name='api_get_teacher_materials'),
    path('delete_classroom' , api_teacher_delete_classroom , name='api_teacher_delete_classroom'),
    path('create_material', api_teacher_add_material , name='api_teacher_add_material'),
    path('delete_material', api_teacher_delete_material , name='api_teacher_delete_material'),
    path('get_teacher_material', api_teacher_get_material , name='api_teacher_get_material'),
    path('update_material', api_teacher_update_material , name='api_teacher_update_material'),
    path('get_teacher_materials_joined', api_teacher_get_material_joined , name='api_teacher_get_material_joined'),
    
    
    
    # STUDENT ------------------------
    path('join_classroom', api_student_join_classroom , name='api_student_join_classroom'),
    path('get_student_classroom', api_get_student_classrooms , name='api_get_student_classroom'),
    path('visit_student_classroom', api_get_student_classroom , name='api_get_student_classroom'),
    path('get_student_activities_materials', api_get_student_materials_activities , name='api_get_student_materials'),
    path('leave_student_classroom', api_student_leave_classroom , name='api_student_leave_classroom'),
    path('get_student_classroom_materials', api_student_get_material , name='api_student_get_material'),
    path('update_student_material', api_student_join_material , name='api_student_join_material'),
    
]