from django.urls import path
from . import views
urlpatterns = [
    path('', views.login_page, name='login_page'),
    path('register_teacher/', views.register_teacher_page, name='register_teacher_page'),
    path('register_student/', views.register_student_page, name='register_student_page'),
]