
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch

def generate_admission_acknowledgement(application):
    """
    Generates a detailed PDF acknowledgement for a student admission application.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        alignment=1,
        spaceAfter=10,
        textColor=colors.HexColor('#1e3a8a')
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Heading2'],
        fontSize=12,
        alignment=1,
        spaceAfter=20,
        textColor=colors.HexColor('#475569')
    )
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading3'],
        fontSize=11,
        spaceBefore=10,
        spaceAfter=6,
        textColor=colors.white,
        backColor=colors.HexColor('#1e3a8a'),
        leftIndent=0,
        borderPadding=4
    )
    
    body_style = styles['Normal']
    body_style.fontSize = 9
    
    elements = []
    
    # Header
    elements.append(Paragraph(f"{application.school.name}".upper(), title_style))
    elements.append(Paragraph("ONLINE REGISTRATION / ADMISSION FORM ACKNOWLEDGEMENT", subtitle_style))
    
    # Top info (Receipt No & Date)
    top_info = [
        [Paragraph(f"<b>Registration Receipt No:</b> {application.application_number}", body_style), 
         Paragraph(f"<b>Date:</b> {application.created_at.strftime('%d-%m-%Y')}", body_style)]
    ]
    t_top = Table(top_info, colWidths=[3.5*inch, 2.5*inch])
    t_top.setStyle(TableStyle([('ALIGN', (1,0), (1,0), 'RIGHT')]))
    elements.append(t_top)
    elements.append(Spacer(1, 0.1 * inch))

    # Student Section
    elements.append(Paragraph("STUDENT DETAILS", section_style))
    student_data = [
        ["Full Name:", f"{application.first_name} {application.middle_name} {application.last_name}", "Class Sought:", application.target_class.name],
        ["Date of Birth:", application.date_of_birth.strftime('%d-%m-%Y'), "Gender:", application.gender],
        ["Place of Birth:", application.place_of_birth or "N/A", "Nationality:", application.nationality],
        ["Mother Tongue:", application.mother_tongue or "N/A", "Blood Group:", application.blood_group or "N/A"],
        ["Religion:", application.religion or "N/A", "Caste:", application.caste or "N/A"],
        ["Category:", application.category, "Primary Contact:", application.primary_contact_person or "Father"]
    ]
    t2 = Table(student_data, colWidths=[1.2*inch, 2*inch, 1.2*inch, 2*inch])
    t2.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t2)

    # Address Section
    elements.append(Spacer(1, 0.1 * inch))
    address_data = [
        ["Residential Address:", application.address],
        ["City:", application.city, "State:", application.state, "PIN:", application.postal_code]
    ]
    t_addr = Table(address_data, colWidths=[1.2*inch, 5.2*inch] if len(address_data[0])==2 else [1.2*inch, 2*inch, 1*inch, 1*inch, 0.6*inch, 0.6*inch])
    # Correction for irregular table
    t_addr = Table([
        ["Residential Address:", application.address, "", "", ""],
        ["City:", application.city, "State:", application.state, "PIN:", application.postal_code]
    ], colWidths=[1.2*inch, 1.8*inch, 0.8*inch, 1.6*inch, 0.4*inch, 0.6*inch])
    t_addr.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,1), 'Helvetica-Bold'),
        ('FONTNAME', (2,1), (2,1), 'Helvetica-Bold'),
        ('FONTNAME', (4,1), (4,1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('SPAN', (1,0), (5,0)),
    ]))
    elements.append(t_addr)

    # Family Section
    elements.append(Paragraph("PARENTS / GUARDIAN DETAILS", section_style))
    family_data = [
        ["Father's Name:", application.father_name, "Contact No:", application.father_phone],
        ["Qualification:", application.father_qualification or "N/A", "Occupation:", application.father_occupation or "N/A"],
        ["Mother's Name:", application.mother_name, "Contact No:", application.mother_phone],
        ["Qualification:", application.mother_qualification or "N/A", "Single Parent:", "Yes" if application.is_single_parent else "No"]
    ]
    t3 = Table(family_data, colWidths=[1.2*inch, 2*inch, 1.2*inch, 2*inch])
    t3.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t3)

    # Previous Academic Section
    elements.append(Paragraph("PREVIOUS SCHOOL DETAILS", section_style))
    academic_data = [
        ["School Name:", application.previous_school_name or "N/A"],
        ["Last Class:", application.previous_school_class or "N/A", "Board:", application.previous_school_board or "N/A"],
        ["Medium:", application.previous_school_medium or "N/A", "Languages Opted:", f"2nd: {application.second_language}, 3rd: {application.third_language}"]
    ]
    t4 = Table(academic_data, colWidths=[1.2*inch, 5.2*inch] if len(academic_data[0])==2 else [1.2*inch, 2*inch, 1.2*inch, 2*inch])
    # Fix for irregular table
    t4 = Table([
        ["School Name:", application.previous_school_name or "N/A", "", ""],
        ["Last Class:", application.previous_school_class or "N/A", "Board:", application.previous_school_board or "N/A"],
        ["Medium:", application.previous_school_medium or "N/A", "Languages:", f"2nd: {application.second_language}, 3rd: {application.third_language}"]
    ], colWidths=[1.2*inch, 2*inch, 1*inch, 2.2*inch])
    t4.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,2), 'Helvetica-Bold'),
        ('FONTNAME', (2,1), (2,2), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('SPAN', (1,0), (3,0)),
    ]))
    elements.append(t4)
    
    # Declaration
    elements.append(Spacer(1, 0.4 * inch))
    elements.append(Paragraph("<b>DECLARATION:</b> I/We hereby declare that the information provided is correct to the best of my/our knowledge. I/We agree to abide by the rules and regulations of the school.", body_style))
    
    # Footer Note
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(Paragraph("Note: This is a computer-generated acknowledgement for your online submission. Final admission is subject to document verification and school selection criteria.", styles['Italic']))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
