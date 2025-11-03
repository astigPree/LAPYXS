import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings

class CallConsumer(AsyncWebsocketConsumer):
    async def connect(self): 
        self.room_group_name = settings.WS_GROUPNAME

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Just relay to the group (other peer)
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "signal", "data": data, "sender": self.channel_name},
        )

    async def signal(self, event):
        if event["sender"] != self.channel_name:
            await self.send(text_data=json.dumps(event["data"]))