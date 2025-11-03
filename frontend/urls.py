from django.urls import path
from . import views
urlpatterns = [

    path('', views.login_page, name='login_page'),
    path('register_teacher/', views.register_teacher_page, name='register_teacher_page'),
    path('register_student/', views.register_student_page, name='register_student_page'),
    path('home/', views.home_page, name='home_page'),

    # TEACHER PAGES ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
    path('teacher_dashboard/', views.teacher_dashboard_page, name='teacher_dashboard_page'),
    path('teacher_classroom/', views.teacher_classroom_page, name='teacher_classroom_page'),
    path('teacher_accounts/', views.teacher_accounts_page, name='teacher_accounts_page'),
    path('teacher_materials/', views.teacher_classroom_reviewers_page, name='teacher_classroom_reviewers_page'),
    path('teacher_classroom_view_reviewer/', views.teacher_classroom_view_reviewer, name='teacher_classroom_view_reviewer_page'),
    path('teacher_announcement/', views.teacher_classroom_announcement_page, name='teacher_classroom_announcement_page'),
    path('teacher_comments/', views.teacher_classroom_comments_page, name='teacher_classroom_comments_page'),
    path('teacher_students/', views.teacher_classroom_check_students , name="teacher_classroom_check_students"),
    path('teacher_view_student/', views.teacher_classroom_view_student , name="teacher_classroom_view_student"),
    path('teacher_activities/', views.teacher_classroom_activities , name="teacher_classroom_activities"),
    path('teacher_view_activity/', views.teacher_view_activity , name="teacher_view_activity"),
    path('teacher_view_student_activity/', views.teacher_view_student_activity , name="teacher_view_student_activity"),

    path('teacher_messages/', views.teacher_messages , name="teacher_messages"),
    path('teacher_messages_check/', views.teacher_messages_content , name="teacher_messages_content"),
     
    path('teacher_classroom_conferencing/', views.teacher_classroom_conferencing , name="teacher_classroom_conferencing"),

    path('teacher_start_conferencing/', views.teacher_start_conferencing , name="teacher_start_conferencing"),
    path('teacher_video_conferencing/', views.teacher_video_conferencing , name="teacher_video_conferencing"),
    
    
    # STUDENT PAGES ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    path('student_dashboard/', views.student_dashboard_page, name='student_dashboard_page'), 
    path('student_accounts/', views.student_accounts_page, name='student_accounts_page'),
    path('student_classroom/', views.student_classroom_page, name='student_classroom_page'),
    path('student_materials/', views.student_classroom_reviewer_page, name='student_classroom_reviewer_page'),
    path('student_classroom_view_reviewer/', views.student_classroom_view_reviewer, name='student_classroom_view_reviewer_page'),

    path('student_classroom_announcement/', views.student_classroom_announcement_page, name='student_classroom_announcement_page'),
    path('student_comments/', views.student_classroom_comments_page, name='student_classroom_comments_page'),
    path('student_classroom_view_activity/', views.student_classroom_view_activity, name='student_classroom_view_activity'),
 
    path('student_messages/', views.student_messages , name="student_messages"),
    path('student_view_messages/', views.student_view_messages , name="student_view_messages"),
    path('student_classroom_conferencing/', views.student_classroom_conferencing , name="student_classroom_conferencing"),
    
    path('student_start_conferencing/', views.student_start_conferencing , name="student_start_conferencing"),
    path('student_video_conferencing/', views.student_video_conferencing , name="student_video_conferencing"),
    
]