from django.shortcuts import render, redirect

# Create your views here.



def login_page(request):
    return render(request, 'authen/login_page.html')

def register_teacher_page(request):
    return render(request, 'authen/register_teachers.html')

def register_student_page(request):
    return render(request, 'authen/register_students.html')


def home_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    
    if request.user.user_type == 'Teacher':
        return redirect('teacher_dashboard_page')
    elif request.user.user_type == 'Student':
        return redirect('student_dashboard_page')

# TEACHER PAGES ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



def teacher_dashboard_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Teacher':
        return redirect('home_page')
    return render(request, 'teacher/dashboard.html')

def teacher_classroom_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Teacher':
        return redirect('home_page')
    return render(request, 'teacher/classrooms.html')


def teacher_accounts_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Teacher':
        return redirect('home_page')
    return render(request, 'teacher/accounts.html')

def teacher_classroom_reviewers_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Teacher':
        return redirect('home_page')
    return render(request, 'teacher/classroom_reviewers.html')


def teacher_classroom_view_reviewer(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Teacher':
        return redirect('home_page')
    return render(request, 'teacher/classroom_view_reviewer.html')

def teacher_classroom_announcement_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Teacher':
        return redirect('home_page')
    return render(request, 'teacher/classroom_announcement.html')


def teacher_classroom_comments_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Teacher':
        return redirect('home_page')
    return render(request, 'teacher/classroom_comments.html')


# STUDENT PAGES ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def student_dashboard_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Student':
        return redirect('home_page')
    return render(request, 'student/dashboard.html')

def student_accounts_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Student':
        return redirect('home_page')
    return render(request, 'student/accounts.html')

def student_classroom_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Student':
        return redirect('home_page')
    return render(request, 'student/classrooms.html')

def student_classroom_reviewer_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Student':
        return redirect('home_page')
    return render(request, 'student/classroom_reviewers.html')

def student_classroom_view_reviewer(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Student':
        return redirect('home_page')
    return render(request, 'student/classroom_view_reviewer.html')


def student_classroom_announcement_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Student':
        return redirect('home_page')
    return render(request, 'student/classroom_announcement.html')


def student_classroom_comments_page(request):
    if not request.user.is_authenticated:
        return redirect('login_page')
    if request.user.user_type != 'Student':
        return redirect('home_page')
    return render(request, 'student/classroom_comments.html')
