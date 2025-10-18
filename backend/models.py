from django.db import models
from django.contrib.auth.models import AbstractUser



class CustomUser(AbstractUser):
	fullname = models.CharField(max_length=255, null=True, blank=True)
	profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
	school_name = models.CharField(max_length=255, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	
	user_type = models.CharField(max_length=255, null=True, blank=True, choices=[('Teacher', 'Teacher'), ('Student', 'Student')])

	# teachers --->
	subject_area = models.CharField(max_length=255, null=True, blank=True)
	short_bio = models.TextField(null=True, blank=True)

	# students --->
	grade_level = models.CharField(max_length=255, null=True, blank=True)
	classrooms = models.JSONField(default=list, blank=True)
	"""
		classrooms = [
			classroom.pk , ...
		]
	"""

	def __str__(self):
		return f"{self.user_type} : {self.username} : {self.fullname}"


class Notification(models.Model):
	title = models.CharField(max_length=255, null=True, blank=True)
	content = models.TextField( null=True, blank=True)
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='user_notifications')
	is_seen = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.title



class Classroom(models.Model):
	classroom_name = models.CharField(max_length=255, null=True, blank=True)
	classroom_link_id = models.CharField(max_length=255, null=True, blank=True)
	classroom_description = models.TextField( null=True, blank=True)
	classroom_subject = models.CharField(max_length=255, null=True, blank=True)
	classroom_owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_owner')
	created_at = models.DateTimeField(auto_now_add=True)

	classroom_students = models.JSONField(default=list, blank=True , null=True)
	"""
		classroom_students = [
			customuser.pk , ...
		]
	"""

	def __str__(self):
		return self.classroom_name

class Material(models.Model):
	material_name = models.CharField(max_length=255, null=True, blank=True)
	material_joined = models.JSONField(default=list, blank=True , null=True)
	"""
		material_joined = [
			customuser.pk , ...
		]
	"""
	material_file = models.FileField(upload_to='material_files/', null=True, blank=True)
	material_description = models.TextField( null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	material_owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='material_owner')
	material_link = models.TextField( null=True, blank=True)
	classroom_material = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_material')

	def __str__(self):
		return self.material_name


class StudentMaterial(models.Model):
	student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='student_material')
	material = models.ForeignKey(Material, on_delete=models.CASCADE, null=True, blank=True , related_name='material_student')
	created_at = models.DateTimeField(auto_now_add=True)



class Activity(models.Model):
	activity_name = models.CharField(max_length=255, null=True, blank=True)
	activity_joined = models.JSONField(default=list, blank=True , null=True)
	"""
		activity_joined = [
			customuser.pk , ...
		]
	"""
	activity_description = models.TextField( null=True, blank=True)
	activity_type = models.CharField(
		max_length=255, null=True,
		blank=True,
		choices=[
			('Quiz', 'Quiz'),
			('Assessment', 'Assessment'),
			('Exam', 'Exam'),
			('Assignment', 'Assignment'),
		]
	)
	created_at = models.DateTimeField(auto_now_add=True)
	activity_owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='activity_owner')
	activity_due_date = models.DateTimeField(null=True, blank=True)
	activity_starting_date = models.DateTimeField(null=True, blank=True)
	activity_content = models.JSONField(default=dict, blank=True , null=True)
	"""
		activity_content = {
			"1": {
				"type": "selection",
				"question": "fsdfdsf",
				"selections": {
					"mguvz7vk04blvd": {
						"checked": false,
						"answer": "fsdfd"
					},
					"mguvz7vkbdx98g": {
						"checked": true,
						"answer": "dfsfd"
					}
				},
				"answer_id": "mguvz7vkbdx98g"
			} 
			"2": {
				"type": "multiple",
				"question": "fsfdsf",
				"selections": {
					"mguw4eewx204m7": {
						"checked": true,
						"answer": "4343"
					},
					"mguw4eewx17y04": {
						"checked": false,
						"answer": "111"
					},
					"mguw4eeweo73d2": {
						"checked": true,
						"answer": "5555"
					}
				},
				"answer_ids": [
					"mguw4eewx204m7",
					"mguw4eeweo73d2"
				]
			}  
			"3": {
				"type": "essay",
				"question": "fsfdsfddsfsd"
			} 
			"4": {
				"type": "file-submission",
				"question": "fsfdsfddsfsd"
			}
			"5": {
				"type": "question-file",
				"question": "fsfdsfddsfsd",
				"fileKey" : "mguw4eeweo73d3" 
			}
		} 
	"""
	activity_classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='activity_classroom')
	overall_certificate = models.FileField(upload_to='overall_certificates/', null=True, blank=True) 

	def __str__(self):
		return self.activity_name



class ActivityFile(models.Model):
	activity_file = models.FileField(upload_to='activity_files/', null=True, blank=True) 
	activity_custom_id = models.CharField(max_length=255, null=True, blank=True) # fileKey
	activity_file_classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='activity_file_classroom')
	activity = models.ForeignKey(Activity, on_delete=models.CASCADE, null=True, blank=True , related_name='activity_file')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.activity_custom_id}"


class StudentActivity(models.Model):
	activity = models.ForeignKey(Activity, on_delete=models.CASCADE, null=True, blank=True , related_name='student_activity')
	created_at = models.DateTimeField(auto_now_add=True)
	activity_answers = models.JSONField(default=dict, blank=True , null=True)
	"""
		activity_content = {
			"1" : {
				"answer" : "1",
				"answer_file" : "student_activity_file.student_activity_custom_id",
				"is_correct" : "true"
			},
			"2" : { 
				"answer" : "1",
				"answer_file" : "student_activity_file.student_activity_custom_id" 
				"is_correct" : "true"
			},
			"3" : {
				"answer" : "1",
				"answer_file" : "student_activity_file.student_activity_custom_id" 
				"is_correct" : "true"
 			},
			"4" : {
				"answer" : "1",
				"answer_file" : "student_activity_file.student_activity_custom_id" 
				"is_correct" : "true"
			}
		}
 
	"""
	student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='student_activity')
	certificate = models.FileField(upload_to='student_activity_files/', null=True, blank=True)
	scores = models.IntegerField(null=True, blank=True, default=0)
 
 
 
	def __str__(self):
		return f"{self.activity.activity_name}"



class StudentActivityFile(models.Model):
	activity_file = models.FileField(upload_to='student_activity_files/', null=True, blank=True)
	student_activity_custom_id = models.CharField(max_length=255, null=True, blank=True)
	activity_file_classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='student_activity_file_classroom')
	student_activity = models.ForeignKey(StudentActivity, on_delete=models.CASCADE, null=True, blank=True , related_name='student_activity_file')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.student_activity_custom_id}"

class ClassroomPost(models.Model):
	teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post_teacher')
	created_at = models.DateTimeField(auto_now_add=True)
	content = models.TextField( null=True, blank=True)
	classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post')

	def __str__(self):
		return f"{self.content}"


class ClassroomPostReply(models.Model):
	replier = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post_replier')
	created_at = models.DateTimeField(auto_now_add=True)
	content = models.TextField( null=True, blank=True)
	post = models.ForeignKey(ClassroomPost, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post_reply')
	classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_post_reply')

	def __str__(self):
		return f"{self.content}"
	



class Post(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='post_teacher')
    created_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField( null=True, blank=True)
    
    
class PostReply(models.Model):
	replier = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='post_replier')
	created_at = models.DateTimeField(auto_now_add=True)
	content = models.TextField( null=True, blank=True)
	post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True , related_name='post_reply')
 
 
class Message(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='message_sender')
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True , related_name='message_receiver')
    content = models.TextField( null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    classroom_message = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True , related_name='classroom_message')
    is_seen = models.BooleanField(default=False)
    


