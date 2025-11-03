

from backend.models import *


def createNotification(user ,title , content , link , action):
    Notification.objects.create(
        title = title,
        content = content,
        user = user,
        link = link,
        actions = action
    )
