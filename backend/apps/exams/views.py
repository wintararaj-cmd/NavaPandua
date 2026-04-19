
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import ExamGrade, Exam, ExamSchedule, ExamResult
from .serializers import (
    ExamGradeSerializer, ExamSerializer, 
    ExamScheduleSerializer, ExamResultSerializer
)
from .services import GradingService
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import io

class ExamBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if not user.is_authenticated:
            return queryset.none()
        if user.role in ['SCHOOL_ADMIN', 'TEACHER'] and user.school:
            queryset = queryset.filter(school=user.school)
        return queryset

    def perform_create(self, serializer):
        if self.request.user.school:
            serializer.save(school=self.request.user.school)
        else:
            serializer.save()

class ExamGradeViewSet(ExamBaseViewSet):
    queryset = ExamGrade.objects.all()
    serializer_class = ExamGradeSerializer
    search_fields = ['name']

class ExamViewSet(ExamBaseViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    search_fields = ['name']

    @action(detail=True, methods=['get'], url_path='report-card')
    def download_report_card(self, request, pk=None):
        exam = self.get_object()
        student_id = request.query_params.get('student_id')
        
        if not student_id:
             return Response({"error": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get results
        results = ExamResult.objects.filter(
             exam_schedule__exam=exam,
             student_id=student_id
        ).select_related('exam_schedule__subject', 'grade', 'student__user')

        if not results.exists():
             return Response({"error": "No results found for this student in this exam"}, status=status.HTTP_404_NOT_FOUND)

        student = results.first().student
        
        # Generate PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        elements.append(Paragraph(f"Report Card: {exam.name}", styles['Title']))
        elements.append(Paragraph(f"Student: {student.user.get_full_name()} ({student.roll_number})", styles['Normal']))
        elements.append(Paragraph(f"Class: {student.current_class.name} - {student.section.name}", styles['Normal']))
        elements.append(Paragraph("<br/>", styles['Normal']))

        # Table Data
        data = [['Subject', 'Marks', 'Grade', 'Remarks']]
        total_marks = 0
        max_marks = 0
        
        for res in results:
             data.append([
                 res.exam_schedule.subject.name,
                 f"{res.marks_obtained} / {res.exam_schedule.full_marks}",
                 res.grade.name if res.grade else '-',
                 res.remarks
             ])
             total_marks += res.marks_obtained
             max_marks += res.exam_schedule.full_marks

        # Total Row
        data.append(['Total', f"{total_marks} / {max_marks}", '-', '-'])
        
        # GPA Row
        gpa = GradingService.calculate_gpa(student, exam)
        data.append(['GPA', str(gpa), '-', '-'])
                             
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(table)
        
        doc.build(elements)
        buffer.seek(0)
        
        filename = f"ReportCard_{student.roll_number}_{exam.name}.pdf"
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class ExamScheduleViewSet(ExamBaseViewSet):
    queryset = ExamSchedule.objects.all()
    serializer_class = ExamScheduleSerializer
    filterset_fields = ['exam', 'subject']

class ExamResultViewSet(ExamBaseViewSet):
    queryset = ExamResult.objects.all()
    serializer_class = ExamResultSerializer
    filterset_fields = ['exam_schedule', 'student', 'grade']
    search_fields = ['student__first_name', 'student__last_name']

    @action(detail=False, methods=['get'], url_path='my-results')
    def my_results(self, request):
        user = request.user
        if user.role == 'STUDENT':
            student = user.student_profile
            results = self.get_queryset().filter(student=student)
            serializer = self.get_serializer(results, many=True)
            return Response(serializer.data)
        return Response({'error': 'User is not a student'}, status=status.HTTP_403_FORBIDDEN)


    def perform_create(self, serializer):
        # Save first to get the instance with all relations
        if self.request.user.school:
            instance = serializer.save(school=self.request.user.school)
        else:
            instance = serializer.save()
            
        # Auto-calculate grade
        grade = GradingService.calculate_grade(instance)
        if grade:
            instance.grade = grade
            instance.save(update_fields=['grade'])

    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Auto-calculate grade if marks changed
        grade = GradingService.calculate_grade(instance)
        if grade != instance.grade:
            instance.grade = grade
            instance.save(update_fields=['grade'])
