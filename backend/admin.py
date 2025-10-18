from django.contrib import admin

# Register your models here.

from .models import *

admin.site.register(CustomUser)
admin.site.register(Classroom)
admin.site.register(Material)
admin.site.register(Post)
admin.site.register(PostReply)
admin.site.register(StudentMaterial)
admin.site.register(Message)
admin.site.register(Notification)
admin.site.register(Activity)
admin.site.register(ActivityFile)