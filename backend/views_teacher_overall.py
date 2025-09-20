from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout
from django.urls import reverse

from backend import my_utils

from backend.models import *


