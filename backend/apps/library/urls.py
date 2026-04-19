from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, BookBorrowingViewSet

router = DefaultRouter()
router.register('books', BookViewSet, basename='books')
router.register('borrowings', BookBorrowingViewSet, basename='borrowings')

urlpatterns = [
    path('', include(router.urls)),
]
