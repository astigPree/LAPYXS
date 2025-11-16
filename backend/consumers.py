import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.core.cache import cache


class CallConsumer(AsyncWebsocketConsumer):
     
    async def connect(self): 
        self.room_group_name = settings.WS_GROUPNAME
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        
        if self.scope["user"].is_anonymous:
            await self.close()
            return   # ✅ stop execution 
        
        
        # self.groups_room_names = []
        group_names = cache.get(f"groups-{self.scope['user'].pk}" , [])
            
        
        # Join Private room group
        await self.channel_layer.group_add(
            f"{settings.WS_GROUPNAME}-{self.scope['user'].pk}",
            self.channel_name
        )
        
        group_names.append(f"{settings.WS_GROUPNAME}-{self.scope['user'].pk}")
        
        # self.groups_room_names.append(f"{settings.WS_GROUPNAME}-{self.scope['user'].pk}")


        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        
        group_names.append(self.room_group_name)
        
        # self.groups_room_names.append(self.room_group_name)
        
                
        if self.room_name != "clients":
            await self.channel_layer.group_add(
                self.room_name,
                self.channel_name
            ) 
            # self.groups_room_names.append(self.room_name)
            
            group_call = cache.get(self.room_name , {})
            if str(self.scope["user"].pk) not in group_call:
                group_call[str(self.scope["user"].pk)] = {
                    "fullname" : self.scope["user"].fullname,
                    "id" : self.scope["user"].pk
                }
                cache.set(self.room_name , group_call)
            
            group_names.append(self.room_name)
            await self.accept()
            
            # send current members list to the newly connected client only
            # await self.send(text_data=json.dumps({"type": "peers", "peers": list(group_call.values())}))

            # # notify others that a new peer joined
            # await self.channel_layer.group_send(
            #     self.room_group_name,
            #     {"type": "broadcast_new_peer", "id": self.scope["user"].pk, "fullname": self.scope["user"].fullname, "sender": self.channel_name}
            # )
 
        else:
             
            await self.accept()
        
        cache.set(f"groups-{self.scope['user'].pk}" , group_names)
        
 
    async def disconnect(self, close_code):
        try:
            if self.room_name != "clients":
                group_call = cache.get(self.room_name, {})
                if str(self.scope["user"].pk) in group_call:
                    del group_call[str(self.scope["user"].pk)]
                    cache.set(self.room_name, group_call)

            group_names = cache.get(f"groups-{self.scope['user'].pk}", [])
            for room_name in group_names:
                try:
                    await self.channel_layer.group_discard(room_name, self.channel_name)
                except Exception:
                    # Ignore if already discarded or transport closed
                    pass
        except Exception as e:
            # Optional: log instead of raising
            print(f"Disconnect cleanup error: {e}")


    # async def disconnect(self, close_code):
    #     # await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    #     if self.room_name != "clients":
    #         # self.group_call[self.room_name].remove(self.scope["user"].pk)
    #         # if len(self.group_call[self.room_name]) == 0:
    #         #     del self.group_call[self.room_name]
                    
    #         group_call = cache.get(self.room_name , {})
    #         if str(self.scope["user"].pk) in group_call:
    #             del group_call[str(self.scope["user"].pk)]
    #             cache.set(self.room_name , group_call)
        
    #     # print("Groups room names:", self.groups_room_names)
        
    #     group_names = cache.get(f"groups-{self.scope['user'].pk}" , [])
    #     for room_name in group_names:
    #         await self.channel_layer.group_discard(room_name, self.channel_name)
        
    async def receive(self, text_data=None, bytes_data=None):
        raw = text_data if text_data is not None else bytes_data
        try:
            data = json.loads(raw)
        except Exception as exc:
            # log the raw payload and ignore or close
            # use your logger; print for quick debugging
            print("WS receive: invalid JSON:", repr(raw), "error:", exc)
            return

        action = data.get('type', None)
        
        if (action == "new-offer") or (action == "new-answer") :
            receiver_channel_name = data.get('data', {}).get('receiver_channel_name', '')
            data['data']['receiver_channel_name'] = self.channel_name
            
            await self.channel_layer.send(
                receiver_channel_name,
                {"type": "signal", "data": data, "sender": self.channel_name },
            )
            return
        
        data['data']['receiver_channel_name'] = self.channel_name
        
        await self.channel_layer.group_send(
            self.room_name,
            {"type": "signal", "data": data, "sender": self.channel_name },
        )

    async def signal(self, event):
        # if event["sender"] != self.channel_name and not event["is_joined"]:
        #     await self.send(text_data=json.dumps(event["data"]))
        # else:
            # await self.send(text_data=json.dumps(event["data"]))
        data = event["data"]
            
        await self.send(text_data=json.dumps(data))
         
        
    async def lapyxs_event(self, event):
        
        await self.send(text_data=json.dumps(event["data"]))
        
        