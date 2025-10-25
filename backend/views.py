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
import io 
import pandas as pd 
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods



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


 
    
@require_http_methods(["POST"])
def api_get_student_report(request): 
     
    student_id = request.POST.get('student_id', None) 
    classroom_id = request.POST.get('classroom_id', None) 
        
    student_obj = CustomUser.objects.filter(id = int(student_id)).first()
    classroom_obj = Classroom.objects.filter(id=int(classroom_id)).first()
    
    data = [] # { activity_name : (score / total points) x 100 = percent }
    # data = [
    #     {"ID": 1, "Name": "Alice"},
    #     {"ID": 2, "Name": "Bob"},
    # ]
    
    materials = Material.objects.filter(
        classroom_material=classroom_obj
    ).order_by('created_at')
    activities = Activity.objects.filter(
        activity_classroom=classroom_obj, 
    ).order_by('created_at')

    data_dict = {}
    total_score = 0
    total_activity_points = 0
    custom_id = 0
    for activity in activities: 
        custom_id += 1
        name_dict = f"{activity.activity_name}"
        if name_dict in data_dict or "[Total Average]" in name_dict:
            name_dict = f"{name_dict} ({custom_id})"
            
        if student_obj.pk not in activity.activity_joined:
            data_dict[name_dict] = 'Not Participated'
            continue
        
        student_activity_obj = activity.student_activity.filter(
            student = student_obj
        ).first()
        if student_activity_obj:
            total_score += student_activity_obj.scores
            total_activity_points += activity.activity_total_scores
            if student_activity_obj.scores and student_activity_obj.scores != 0:
                result = ((student_activity_obj.scores / activity.activity_total_scores) * 100)
                data_dict[name_dict] = f"({student_activity_obj.scores} / {activity.activity_total_scores}) x 100 = {result}"
            else:
                data_dict[name_dict] = f"( 0 / {activity.activity_total_scores}) x 100 = No Result"
        else:
            data_dict[name_dict] = 'Not Participated'
            continue
        
    result2 = 0
    if total_score and total_score != 0 and total_activity_points and total_activity_points != 0:
        result2 = ((total_score / total_activity_points) * 100)
    data_dict["[Total Average]"] = f"( {total_score} / {total_activity_points} ) * 100 = {result2}"
    
    
    for material in materials:
        custom_id += 1
        name_dict = f"{material.material_name}"
        if name_dict in data_dict:
            name_dict = f"{name_dict} ({custom_id})"
        data_dict[name_dict] = "Participated" if student_obj.pk in material.material_joined else "Not Participated"

    data.append(data_dict)
    
    df = pd.DataFrame(data)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Sheet1")
    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = 'attachment; filename="export.xlsx"'
    return response


 
 