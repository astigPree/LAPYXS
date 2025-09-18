from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout
from django.urls import reverse
 

from backend.models import CustomUser

# Create your views here.

def api_register_auth(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    
    register_type = request.POST.get('register_type', None)
    if register_type not in ['teacher', 'student']:
        return JsonResponse({'error': 'Invalid register type.'}, status=400)
    
    
    fullname = request.POST.get('fullname', None)
    email = request.POST.get('email', None)
    password = request.POST.get('password', None)
    confirm_password = request.POST.get('confirm_password', None)
    school_name = request.POST.get('school_name', None)
    subject_area = request.POST.get('subject_area', None)
    description = request.POST.get('description', None)
    profile = request.FILES.get('profile', None)
    grade_level = request.POST.get('grade_level', None)
    
    if not fullname:
        return JsonResponse({'error': 'Full name is required.'}, status=400)
    if not email:
        return JsonResponse({'error': 'Email is required.'}, status=400)
    if not password:
        return JsonResponse({'error': 'Password is required.'}, status=400)
    if password != confirm_password:
        return JsonResponse({'error': 'Passwords do not match.'}, status=400)
    if not profile:
        return JsonResponse({'error': 'Profile is required.'}, status=400)
    
    if not school_name:
        return JsonResponse({'error': 'School name is required.'}, status=400)
    if not subject_area and register_type == 'teacher':
        return JsonResponse({'error': 'Subject area is required.'}, status=400)
    if not description and register_type == 'teacher':
        return JsonResponse({'error': 'Description is required.'}, status=400)
    if not grade_level and register_type == 'student':
        return JsonResponse({'error': 'Grade level is required.'}, status=400)
    
    
    try:
        
        User : CustomUser = get_user_model()
        base_user = User.objects.create_user(
            fullname=fullname,
            email=email, 
            school_name=school_name, 
            profile_image=profile, 
            username=email,
            user_type= 'Teacher' if register_type == 'teacher' else 'Student',
        )
        
        if register_type == 'teacher':
            base_user.subject_area = subject_area
            base_user.short_bio = description
        
        if register_type == 'student':
            base_user.grade_level = grade_level
        base_user.save()
        
        # Register the authentication
        base_user.set_password(password)
        base_user.save()
        
        # Login the user
        login(request, base_user)
        
        return JsonResponse({
            'success': 'Account registered successfully.' , 
            'err' : f"{base_user.user_type}", 
            'url' : reverse('home_page')
        }, status=200)

         
    except Exception as e:
        return JsonResponse({'err': str(e) , 'error': 'Error registering account.'}, status=400)
    
    



def api_login_auth(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    email = request.POST.get('email', None)
    password = request.POST.get('password', None)
    
    if not email:
        return JsonResponse({'error': 'Email is required.'}, status=400)
    if not password:
        return JsonResponse({'error': 'Password is required.'}, status=400)
    
    try:
        
        User : CustomUser = get_user_model()
        user = User.objects.get(email=email)
        if user.check_password(password):
            login(request, user)
            return JsonResponse({'success': 'Login successful.' , 'url' : reverse('home_page') }, status=200)
        else:
            return JsonResponse({'error': 'Invalid password.'}, status=400)
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=400)
    


def api_logout_auth(request):
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    logout(request)
    return JsonResponse({'success': 'Logout successful.'}, status=200)


