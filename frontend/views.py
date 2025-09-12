from django.shortcuts import render

# Create your views here.



def login_page(request):
    return render(request, 'authen/login_page.html')

def register_teacher_page(request):
    return render(request, 'authen/register_teacher.html')