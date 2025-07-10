from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import HabitViewset, HabitRecordViewSet


router = DefaultRouter()
router.register('', HabitViewset, basename='habit')
router.register('record', HabitRecordViewSet, basename='habitrecord')

urlpatterns = [
    path('', include(router.urls)),  
]