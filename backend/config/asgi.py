"""
ASGI config for School Management System.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# For now, use simple ASGI without Channels
# WebSocket support will be added when Channels is installed
application = get_asgi_application()

# Uncomment below when Channels is installed:
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from channels.security.websocket import AllowedHostsOriginValidator
# from apps.live_classes import routing as live_classes_routing
# from apps.notifications import routing as notifications_routing
#
# application = ProtocolTypeRouter({
#     'http': django_asgi_app,
#     'websocket': AllowedHostsOriginValidator(
#         AuthMiddlewareStack(
#             URLRouter(
#                 live_classes_routing.websocket_urlpatterns +
#                 notifications_routing.websocket_urlpatterns
#             )
#         )
#     ),
# })

