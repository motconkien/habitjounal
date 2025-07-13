from rest_framework.routers import DefaultRouter
from .views import HabitViewset, HabitRecordViewSet

router = DefaultRouter()
router.register('record', HabitRecordViewSet, basename='habitrecord')  # register record first
router.register('', HabitViewset, basename='habit')                    # then habit404 

urlpatterns = router.urls
