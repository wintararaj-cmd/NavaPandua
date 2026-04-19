from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Period, TimetableEntry
from .serializers import PeriodSerializer, TimetableEntrySerializer

class BaseTimetableViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        user = self.request.user
        # Base queryset from the model manager (all objects)
        queryset = super().get_queryset()
        
        if not user.is_authenticated:
             return queryset.none()
             
        # Filter by school for ALL roles if the user belongs to a school
        if user.school:
             queryset = queryset.filter(school=user.school)
             
        return queryset

    def perform_create(self, serializer):
        if self.request.user.school:
            serializer.save(school=self.request.user.school)
        else:
            serializer.save()

class PeriodViewSet(BaseTimetableViewSet):
    queryset = Period.objects.all()
    serializer_class = PeriodSerializer
    search_fields = ['name']

class TimetableEntryViewSet(BaseTimetableViewSet):
    queryset = TimetableEntry.objects.all()
    serializer_class = TimetableEntrySerializer
    filterset_fields = ['target_class', 'section', 'day_of_week', 'teacher']

    from rest_framework.decorators import action
    from rest_framework.response import Response
    from rest_framework import status

    @action(detail=False, methods=['get'], url_path='my-schedule')
    def my_schedule(self, request):
        user = request.user
        if user.role == 'STUDENT':
            try:
                student = user.student_profile
                queryset = self.get_queryset()
                if student.current_class:
                    queryset = queryset.filter(target_class=student.current_class)
                if student.section:
                    queryset = queryset.filter(section=student.section)
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data)
            except:
                return Response({'error': 'Profile error'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'User is not a student'}, status=status.HTTP_403_FORBIDDEN)
    
    def get_queryset(self):
        # reuse base logic to filter by school
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'STUDENT':
             try:
                 # Students see timetable for their current class & section
                 student = user.student_profile
                 if student.current_class:
                     queryset = queryset.filter(target_class=student.current_class)
                 if student.section:
                     queryset = queryset.filter(section=student.section)
             except:
                 return queryset.none()
                 
        elif user.role == 'TEACHER':
             # Teachers see their own schedule OR they can search for class timetables (if they are admin/class teacher)
             # But usually a teacher view shows *their* classes.
             # If a teacher wants to see a specific class timetable, they can use filters.
             # But by default, maybe show all for teachers to allow flexibility? 
             # Or show their own. Let's filter by teacher if 'my_schedule' param presence?
             # For now, let's show ALL to teachers so they can manage/view school timetable, 
             # but we can add a custom action 'my_schedule'.
             pass
                 
        return queryset
