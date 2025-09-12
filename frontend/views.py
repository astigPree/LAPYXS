from django.shortcuts import render

# Create your views here.



def login_page(request):
    return render(request, 'authen/login_page.html')

def register_teacher_page(request):
    return render(request, 'authen/register_students.html')

def register_student_page(request):
    return render(request, 'authen/register_teachers.html')