from django.shortcuts import render

from backend.views_authen import *
from backend.views_teacher_classroom import *
from backend.views_student_classroom import *
from backend.views_teacher_overall import *
from backend.views_teacher_classroom_2 import *
from backend.views_student_classroom_2 import *
from backend.views_teacher_classroom_3 import *
    

from django.http import  JsonResponse  
from backend.models import *



def api_get_notification(request):
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    
    
    selected_month = request.POST.get('selected_month', None)
    try:
        selected_month = int(selected_month.split('-')[1])  # "09" → 9
    except (AttributeError, ValueError, IndexError):
        return JsonResponse({'error': 'Invalid month format'}, status=400)
     
    notifications = Notification.objects.filter(
        user=request.user, 
        created_at__month=selected_month
    ).order_by('-created_at').values('title', 'content', 'is_seen')
     
    return JsonResponse({'notifications': list(notifications)}, status=200)
    

def api_seen_notification(request):
    
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'User not logged in.'}, status=400)
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=400)
    

    selected_month = request.POST.get('selected_month', None)
    try:
        selected_month = int(selected_month.split('-')[1])  # "09" → 9
    except (AttributeError, ValueError, IndexError):
        return JsonResponse({'error': 'Invalid month format'}, status=400)
    
    Notification.objects.filter(
        user=request.user, 
        created_at__month=selected_month
    ).update(is_seen=True)
    
    notifications = Notification.objects.filter(
        user=request.user, 
        created_at__month=selected_month
    ).order_by('-created_at').values('title', 'content', 'is_seen')
    
    return JsonResponse({'notifications': list(notifications)}, status=200)


 