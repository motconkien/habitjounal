from django.urls import path, include
from .views import get_quote

urlpatterns = [
    path('', get_quote, name='get_quote'),
]