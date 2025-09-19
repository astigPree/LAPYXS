from django.urls import path
from backend.views import *

urlpatterns = [
    path('register', api_register_auth , name='api_register_auth'),
    path('login', api_login_auth , name='api_login_auth'),
    path('logout', api_logout_auth , name='api_logout_auth'),
    path('update', api_update_auth , name='api_update_auth'),
    
    # TEACHER ------------------------
    path('create_classroom', api_create_classroom , name='api_create_classroom'),
    path('get_teacher_classroom', api_get_teacher_classrooms , name='api_get_teacher_classroom'),
    
    
    # STUDENT ------------------------
    path('join_classroom', api_student_join_classroom , name='api_student_join_classroom'),
    path('get_student_classroom', api_get_student_classrooms , name='api_get_student_classroom'),
]