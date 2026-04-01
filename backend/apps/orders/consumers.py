import json
from channels.generic.websocket import AsyncWebsocketConsumer


class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close()
            return

        role = getattr(user, 'role', None)
        if role == 'admin':
            self.groups_to_join = ['admin_orders']
        elif role == 'seller':
            self.groups_to_join = [f'seller_{user.id}', 'admin_orders']
        elif role == 'courier':
            self.groups_to_join = [f'courier_{user.id}', 'admin_orders']
        else:  # warehouse
            self.groups_to_join = ['warehouse_orders', 'admin_orders']

        # Only join the primary group (first one)
        self.group_name = self.groups_to_join[0]
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # Couriers can send location updates
        if text_data:
            data = json.loads(text_data)
            if data.get('type') == 'location':
                user = self.scope.get('user')
                await self.channel_layer.group_send('admin_orders', {
                    'type': 'courier_location',
                    'data': {
                        'courier_id': user.id,
                        'courier_name': f'{user.first_name} {user.last_name}',
                        'lat': data.get('lat'),
                        'lng': data.get('lng'),
                    }
                })

    async def order_update(self, event):
        await self.send(text_data=json.dumps({'type': 'order_update', **event['data']}))

    async def courier_location(self, event):
        await self.send(text_data=json.dumps({'type': 'courier_location', **event['data']}))
