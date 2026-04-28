
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

    @action(detail=True, methods=['get'], url_path='consolidated-marksheet')
    def consolidated_marksheet(self, request, pk=None):
        exam = self.get_object()
        class_id = request.query_params.get('class_id')
        
        if not class_id:
            return Response({"error": "class_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        from apps.students.models import Student
        from apps.subjects.models import Subject
        from apps.exams.models import ExamResult, ExamSchedule
        
        students = Student.objects.filter(current_class_id=class_id, school=exam.school).order_by('roll_number', 'first_name')
        schedules = ExamSchedule.objects.filter(exam=exam).select_related('subject')
        subjects = [s.subject for s in schedules]
        
        if not students.exists():
            return Response({"error": "No students found in this class"}, status=status.HTTP_404_NOT_FOUND)

        # Prepare PDF
        buffer = io.BytesIO()
        from reportlab.lib.pagesizes import landscape, A4
        doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph(f"Consolidated Marksheet: {exam.name}", styles['Title']))
        elements.append(Paragraph(f"Class ID: {class_id}", styles['Normal']))
        elements.append(Paragraph("<br/>", styles['Normal']))

        # Table Header: Roll, Name, Subjects..., Total, GPA
        header = ['Roll', 'Student Name'] + [sub.name for sub in subjects] + ['Total', 'GPA']
        data = [header]

        for student in students:
            row = [student.roll_number or '-', student.user.get_full_name()]
            student_total = 0
            
            for schedule in schedules:
                result = ExamResult.objects.filter(student=student, exam_schedule=schedule).first()
                if result:
                    row.append(str(result.marks_obtained))
                    student_total += result.marks_obtained
                else:
                    row.append('-')
            
            row.append(str(student_total))
            gpa = GradingService.calculate_gpa(student, exam)
            row.append(str(gpa))
            data.append(row)

        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.indigo),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ]))
        elements.append(table)
        
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Consolidated_{exam.name}.pdf"'
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

    @action(detail=False, methods=['post'], url_path='bulk-save')
    def bulk_save_results(self, request):
        from django.db import transaction
        
        schedule_id = request.data.get('exam_schedule')
        results_data = request.data.get('results', [])
        
        if not schedule_id:
            return Response({"error": "exam_schedule ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            schedule = ExamSchedule.objects.get(id=schedule_id, school=request.user.school)
        except ExamSchedule.DoesNotExist:
            return Response({"error": "Exam schedule not found"}, status=status.HTTP_404_NOT_FOUND)
            
        success_count = 0
        with transaction.atomic():
            for res in results_data:
                student_id = res.get('student_id')
                marks = res.get('marks_obtained', 0)
                remarks = res.get('remarks', '')
                is_absent = res.get('is_absent', False)
                
                if not student_id:
                    continue
                    
                result, created = ExamResult.objects.get_or_create(
                    school=request.user.school,
                    exam_schedule=schedule,
                    student_id=student_id,
                    defaults={
                        'marks_obtained': marks,
                        'remarks': remarks,
                        'is_absent': is_absent
                    }
                )
                
                if not created:
                    result.marks_obtained = marks
                    result.remarks = remarks
                    result.is_absent = is_absent
                
                # Calculate grade
                result.grade = GradingService.calculate_grade(result)
                result.save()
                success_count += 1
                
        return Response({"message": f"Successfully saved {success_count} results"})


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
