
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch

def generate_admission_acknowledgement(application):
    """
    Generates a PDF acknowledgement for a student admission application.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        alignment=1,
        spaceAfter=20,
        textColor=colors.HexColor('#2563eb')
    )
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=15,
        spaceAfter=10,
        textColor=colors.HexColor('#1e40af'),
        borderPadding=5,
        backColor=colors.HexColor('#eff6ff')
    )
    
    label_style = styles['Normal']
    
    elements = []
    
    # Header
    elements.append(Paragraph(f"{application.school.name}", title_style))
    elements.append(Paragraph("ADMISSION ACKNOWLEDGEMENT", styles['Heading2']))
    elements.append(Spacer(1, 0.2 * inch))
    
    # Application Info
    app_info = [
        ["Application No:", application.application_number],
        ["Date:", application.created_at.strftime('%d-%m-%Y')],
        ["Status:", application.status]
    ]
    t = Table(app_info, colWidths=[1.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.2 * inch))
    
    # Student Details
    elements.append(Paragraph("Student Details", section_style))
    student_data = [
        ["Full Name:", f"{application.first_name} {application.middle_name} {application.last_name}"],
        ["Date of Birth:", application.date_of_birth.strftime('%d-%m-%Y')],
        ["Gender:", application.gender],
        ["Mother Tongue:", application.mother_tongue or "N/A"],
        ["Nationality:", application.nationality],
        ["Blood Group:", application.blood_group or "N/A"]
    ]
    t2 = Table(student_data, colWidths=[1.5*inch, 3*inch])
    t2.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t2)
    
    # Family Details
    elements.append(Paragraph("Family Details", section_style))
    family_data = [
        ["Father's Name:", application.father_name],
        ["Father's Phone:", application.father_phone],
        ["Mother's Name:", application.mother_name],
        ["Mother's Phone:", application.mother_phone],
        ["Address:", application.address]
    ]
    t3 = Table(family_data, colWidths=[1.5*inch, 3*inch])
    t3.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t3)
    
    # Academic Details
    elements.append(Paragraph("Admission Sought", section_style))
    academic_data = [
        ["Class:", application.target_class.name],
        ["Previous School:", application.previous_school_name or "N/A"],
        ["Previous Board:", application.previous_school_board or "N/A"]
    ]
    t4 = Table(academic_data, colWidths=[1.5*inch, 3*inch])
    t4.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t4)
    
    # Footer Note
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph("Note: This is a computer-generated acknowledgement and does not require a physical signature. Please keep this for future reference during the admission process.", styles['Italic']))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
