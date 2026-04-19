from rest_framework import viewsets, permissions, filters
from .models import Subject
from .serializers import SubjectSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']
    filterset_fields = ['school', 'subject_type']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.role in ['SCHOOL_ADMIN', 'TEACHER'] and user.school:
            queryset = queryset.filter(school=user.school)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.school:
            serializer.save(school=self.request.user.school)
        else:
            serializer.save()
