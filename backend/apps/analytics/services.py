from django.db.models import Avg, Max, Min, Count, Q
from apps.exams.models import ExamResult, Exam
from apps.students.models import Student
from apps.classes.models import Class

class PerformanceAnalyticsService:
    @staticmethod
    def get_class_performance(school, class_id=None):
        """Get performance stats for classes."""
        query = ExamResult.objects.filter(exam_schedule__exam__school=school)
        if class_id:
            query = query.filter(student__current_class_id=class_id)
        
        stats = query.values(
            'student__current_class__name',
            'exam_schedule__subject__name'
        ).annotate(
            avg_marks=Avg('marks_obtained'),
            max_marks=Max('marks_obtained'),
            min_marks=Min('marks_obtained'),
            student_count=Count('student', distinct=True)
        ).order_by('student__current_class__name')
        
        return stats

    @staticmethod
    def get_top_students(school, limit=10):
        """Get top performing students based on average marks."""
        top_students = ExamResult.objects.filter(
            exam_schedule__exam__school=school
        ).values(
            'student__id', 
            'student__user__first_name', 
            'student__user__last_name',
            'student__current_class__name'
        ).annotate(
            overall_avg=Avg('marks_obtained')
        ).order_by('-overall_avg')[:limit]
        
        return top_students

import pandas as pd
from io import BytesIO
from apps.teachers.models import Teacher
from apps.fees.models import FeePayment

class ReportExportService:
    @staticmethod
    def export_students(school, filters=None):
        queryset = Student.objects.filter(school=school).select_related('user', 'current_class', 'section')
        if filters:
            queryset = queryset.filter(**filters)
            
        data = []
        for student in queryset:
            data.append({
                'Admission No': student.admission_number,
                'Full Name': f"{student.user.first_name} {student.user.last_name}",
                'Class': student.current_class.name if student.current_class else 'N/A',
                'Section': student.section.name if student.section else 'N/A',
                'Roll No': student.roll_number,
                'Father Name': student.father_name,
                'Email': student.user.email,
                'Phone': student.user.phone
            })
        
        return pd.DataFrame(data)

    @staticmethod
    def export_teachers(school, filters=None):
        queryset = Teacher.objects.filter(school=school).select_related('user')
        if filters:
            queryset = queryset.filter(**filters)
            
        data = []
        for teacher in queryset:
            data.append({
                'Employee ID': teacher.employee_id,
                'Full Name': f"{teacher.user.first_name} {teacher.user.last_name}",
                'Department': teacher.department,
                'Designation': teacher.designation,
                'Joining Date': teacher.joining_date,
                'Email': teacher.user.email,
                'Phone': teacher.user.phone
            })
        
        return pd.DataFrame(data)

    @staticmethod
    def export_finance(school, filters=None):
        queryset = FeePayment.objects.filter(school=school).select_related('allocation__student__user', 'allocation__fee_master__fee_type')
        if filters:
            queryset = queryset.filter(**filters)
            
        data = []
        for payment in queryset:
            data.append({
                'Date': payment.payment_date,
                'Student': f"{payment.allocation.student.user.first_name} {payment.allocation.student.user.last_name}",
                'Fee Type': payment.allocation.fee_master.fee_type.name,
                'Amount Paid': payment.amount_paid,
                'Payment Mode': payment.payment_mode,
                'Transaction ID': payment.transaction_id
            })
        
        return pd.DataFrame(data)

    @staticmethod
    def to_excel(df):
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        return output.getvalue()

    @staticmethod
    def to_csv(df):
        return df.to_csv(index=False).encode('utf-8')
