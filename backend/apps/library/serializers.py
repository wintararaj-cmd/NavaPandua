from rest_framework import serializers
from .models import Book, BookBorrowing

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'
        read_only_fields = ['school', 'available_quantity']

class BookBorrowingSerializer(serializers.ModelSerializer):
    book_title = serializers.ReadOnlyField(source='book.title')
    borrower_name = serializers.ReadOnlyField(source='borrower.get_full_name')
    
    class Meta:
        model = BookBorrowing
        fields = '__all__'
        read_only_fields = ['school', 'issue_date', 'status', 'fine_amount', 'return_date']
