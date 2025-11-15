

from backend.models import *
import asyncio
from channels.layers import get_channel_layer
from django.conf import settings
from asgiref.sync import async_to_sync 


def send_to_websocket(data: dict, group_name=None , call_name=None):
    """
    Send data to websocket
    
    data: dict
        data to send to websocket
    group_name: str
        group name to send data to
        e.g. settings.WS_GROUPNAME or f"{settings.WS_GROUPNAME}-{user_id}"
    call_name: str
        call name to send data to
        e.g. check_notifications 
    """
    group_name = group_name or settings.WS_GROUPNAME
    channel_layer = get_channel_layer()

    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "lapyxs_event",
                "data": {
                    "type": call_name,
                    "data": data
                }
            }
        )
    except RuntimeError:
        # You're inside an async context (use await instead)
        # logger.warning("send_to_websocket() called from async context — use await instead.")
        pass
    except Exception as e:
        # Redis down, invalid group name, etc.
        # logger.error(f"WebSocket send failed: {e}")
        pass



def createMessage(sender , receiver, content):
    message = Message.objects.create(
        sender = sender,
        receiver = receiver,
        content = content,
        is_seen = True
    )
    send_to_websocket(
        data={
            "type" : "message",
            "content" : message.content,
            "sender" : sender.pk
        } ,
        group_name=f"{settings.WS_GROUPNAME}-{receiver.pk}",
        call_name="message"
    )
    
    
    
    


def createNotification(user ,title , content , link , action):
    Notification.objects.create(
        title = title,
        content = content,
        user = user,
        link = link,
        actions = action
    )
    send_to_websocket(
        data={} , 
        group_name=f"{settings.WS_GROUPNAME}-{user.pk}",
        call_name="notif"
    )
    
