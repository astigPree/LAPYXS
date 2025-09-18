from django.urls import path
from backend.views import *

urlpatterns = [
    path('register', api_register_auth , name='api_register_auth'),
    path('login', api_login_auth , name='api_login_auth'),
    path('logout', api_logout_auth , name='api_logout_auth'),
    path('update', api_update_auth , name='api_update_auth'),
]