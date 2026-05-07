from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LiveClassViewSet

router = DefaultRouter()
router.register('', LiveClassViewSet, basename='live-classes')

urlpatterns = [
    path('my-classes/', LiveClassViewSet.as_view({'get': 'my_classes'}), name='my-live-classes'),
    path('', include(router.urls)),
]
