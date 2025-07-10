from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import TaskEntryViewSet, ProjectEntryViewSet

router = DefaultRouter()
router.register('projects', ProjectEntryViewSet, basename='project')
router.register('tasks', TaskEntryViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),  
]