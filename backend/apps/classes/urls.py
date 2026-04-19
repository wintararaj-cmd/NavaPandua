
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassViewSet, SectionViewSet

app_name = 'classes'

router = DefaultRouter()
# Specific routes should come before more general ones
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'', ClassViewSet, basename='class')

urlpatterns = [
    path('', include(router.urls)),
]
