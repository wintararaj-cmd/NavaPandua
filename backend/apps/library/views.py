from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Book, BookBorrowing
from .serializers import BookSerializer, BookBorrowingSerializer
from apps.notifications.services import NotificationService

class LibraryBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.school:
            queryset = queryset.filter(school=user.school)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.school:
            serializer.save(school=self.request.user.school)
        else:
            serializer.save()

class BookViewSet(LibraryBaseViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    search_fields = ['title', 'author', 'isbn', 'category']
    filterset_fields = ['category']

    def perform_create(self, serializer):
        # On creation, available_quantity = quantity
        quantity = self.request.data.get('quantity', 1)
        if self.request.user.school:
            serializer.save(school=self.request.user.school, available_quantity=quantity)
        else:
            serializer.save(available_quantity=quantity)

class BookBorrowingViewSet(LibraryBaseViewSet):
    queryset = BookBorrowing.objects.all()
    serializer_class = BookBorrowingSerializer
    filterset_fields = ['status', 'borrower']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role in ['STUDENT', 'TEACHER']:
            queryset = queryset.filter(borrower=user)
        return queryset

    def perform_create(self, serializer):
        book_id = self.request.data.get('book')
        try:
            book = Book.objects.get(id=book_id, school=self.request.user.school)
            if book.available_quantity <= 0:
                raise Exception("Book not available for issue")
            
            # Decrease available quantity
            book.available_quantity -= 1
            book.save()
            
            borrowing = serializer.save(school=self.request.user.school, status='ISSUED')
            
            # Notify User
            NotificationService.send_notification(
                user=borrowing.borrower,
                title="Book Issued",
                message=f"You have been issued the book '{book.title}'. Due date: {borrowing.due_date}.",
                notification_type='INFO'
            )
        except Book.DoesNotExist:
            raise Exception("Book not found")

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        borrowing = self.get_object()
        if borrowing.status == 'RETURNED':
            return Response({"error": "Book already returned"}, status=status.HTTP_400_BAD_REQUEST)
        
        borrowing.status = 'RETURNED'
        borrowing.return_date = timezone.now().date()
        borrowing.save()
        
        # Increase available quantity
        book = borrowing.book
        book.available_quantity += 1
        book.save()
        
        return Response(BookBorrowingSerializer(borrowing).data)
