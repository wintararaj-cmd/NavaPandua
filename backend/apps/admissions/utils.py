
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.platypus import Image as RLImage
from django.conf import settings
import os
import re

def get_image(path, width=1.5*inch, height=1.5*inch):
    if path:
        full_path = os.path.join(settings.MEDIA_ROOT, str(path))
        if os.path.exists(full_path):
            return RLImage(full_path, width=width, height=height)
    return ""

from reportlab.platypus import PageBreak, Table, TableStyle, Image as RLImage, Spacer, Paragraph
from reportlab.lib.units import mm

def generate_admission_acknowledgement(application):
    """
    Generates a 2-page PDF admission form matching the user's uploaded image.
    """
    buffer = io.BytesIO()
    # Adjust margins to be slightly smaller to fit content
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle('Title', parent=styles['Normal'], fontSize=16, alignment=1, spaceAfter=2, fontName='Helvetica-Bold')
    sub_title_style = ParagraphStyle('SubTitle', parent=styles['Normal'], fontSize=8, alignment=1, spaceAfter=2)
    label_style = ParagraphStyle('Label', parent=styles['Normal'], fontSize=8, fontName='Helvetica-Bold')
    value_style = ParagraphStyle('Value', parent=styles['Normal'], fontSize=8)
    section_header_style = ParagraphStyle('SectionHeader', parent=styles['Normal'], fontSize=8, fontName='Helvetica-Bold', textColor=colors.white, backColor=colors.black, alignment=1, borderPadding=2)
    small_label_style = ParagraphStyle('SmallLabel', parent=styles['Normal'], fontSize=7)

    elements = []

    def add_line_field(label, value, width=1*inch):
        return Table([[Paragraph(label, label_style), Paragraph(str(value or ""), value_style)]], colWidths=[None, width])

    # --- PAGE 1 ---
    # Header
    header_data = [
        [get_image(application.school.logo if hasattr(application.school, 'logo') else None, 0.7*inch, 0.7*inch),
         [Paragraph("Tiny Tech", title_style),
          Paragraph("(Developed by CSC Academy in association with IIT Delhi)", sub_title_style),
          Paragraph(f"School Code - {getattr(application.school, 'code', 'NCAD1')}", sub_title_style),
          Paragraph("WWW.CSCTinytech.in", ParagraphStyle('URL', parent=sub_title_style, textColor=colors.blue))],
         ""]
    ]
    t_header = Table(header_data, colWidths=[1*inch, 4*inch, 1*inch])
    t_header.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('ALIGN', (1,0), (1,0), 'CENTER')]))
    elements.append(t_header)
    elements.append(Spacer(1, 5))

    elements.append(Paragraph("REGISTRATION / ADMISSION FORM", section_header_style))
    elements.append(Spacer(1, 10))

    # Registration & Date row
    dob_str = application.date_of_birth.strftime('%d%m%Y')
    dob_cells = [[dob_str[i] for i in range(8)]]
    t_dob_box = Table(dob_cells, colWidths=[4*mm]*8, rowHeights=[6*mm])
    t_dob_box.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.black), ('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('FONTSIZE', (0,0), (-1,-1), 8)]))

    # Extract numeric digits for Receipt Number (max 5)
    receipt_digits = re.findall(r'\d+', application.application_number)
    receipt_str = "".join(receipt_digits)[-5:].zfill(5) if receipt_digits else "00000"
    receipt_cells = [[receipt_str[i] for i in range(5)]]
    
    t_receipt = Table(receipt_cells, colWidths=[5*mm]*5, rowHeights=[6*mm])
    t_receipt.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.black), ('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('FONTSIZE', (0,0), (-1,-1), 8)]))

    top_row = [
        [Paragraph("Registration<br/>Receipt No. -", label_style), t_receipt, 
         Paragraph("Date -", label_style), Paragraph(application.created_at.strftime('%d-%m-%Y'), value_style),
         [get_image(application.photo, 1.2*inch, 1.4*inch) or Paragraph("Affix recent<br/>colour<br/>Photograph of<br/>the Candidate", small_label_style)]]
    ]
    t_top = Table(top_row, colWidths=[1*inch, 1.2*inch, 0.6*inch, 1.5*inch, 1.3*inch])
    t_top.setStyle(TableStyle([('GRID', (4,0), (4,0), 0.5, colors.black), ('VALIGN', (0,0), (-1,-1), 'TOP'), ('ALIGN', (4,0), (4,0), 'CENTER')]))
    elements.append(t_top)
    elements.append(Spacer(1, 5))

    elements.append(Paragraph("Use only Block Letters :", label_style))
    elements.append(Spacer(1, 5))

    # Name section
    name_row = [
        [Paragraph("Name :", label_style), Paragraph(application.first_name, value_style), Paragraph(application.middle_name, value_style), Paragraph(application.last_name, value_style)],
        ["", Paragraph("First Name", small_label_style), Paragraph("Middle Name", small_label_style), Paragraph("Last Name", small_label_style)]
    ]
    t_name = Table(name_row, colWidths=[0.6*inch, 1.8*inch, 1.8*inch, 1.8*inch])
    t_name.setStyle(TableStyle([('LINEBELOW', (1,0), (3,0), 0.5, colors.black), ('ALIGN', (1,1), (3,1), 'CENTER')]))
    elements.append(t_name)
    elements.append(Spacer(1, 5))

    # Class and DOB row
    class_dob_row = [
        [Paragraph("Admission sought in Class :", label_style), Paragraph(application.target_class.name, value_style), 
         Paragraph("Date of Birth :", label_style), t_dob_box, Paragraph("D D M M Y Y Y Y", small_label_style)]
    ]
    t_class_dob = Table(class_dob_row, colWidths=[1.8*inch, 1.2*inch, 1*inch, 1.5*inch, 1.2*inch])
    t_class_dob.setStyle(TableStyle([('LINEBELOW', (1,0), (1,0), 0.5, colors.black), ('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    elements.append(t_class_dob)
    elements.append(Spacer(1, 5))

    # Place of Birth and Gender
    pob_gender_row = [
        [Paragraph("Place of Birth :", label_style), Paragraph(application.place_of_birth, value_style), 
         Paragraph("Gender :", label_style), Paragraph(application.gender, value_style)]
    ]
    t_pob_gender = Table(pob_gender_row, colWidths=[1*inch, 3*inch, 0.7*inch, 1*inch])
    t_pob_gender.setStyle(TableStyle([('LINEBELOW', (1,0), (1,0), 0.5, colors.black), ('LINEBELOW', (3,0), (3,0), 0.5, colors.black)]))
    elements.append(t_pob_gender)
    elements.append(Spacer(1, 10))

    # Contact Info Section
    elements.append(Paragraph("Primary Contact information for communication (All information shall be provided to Primary Contact only) :", small_label_style))
    elements.append(Spacer(1, 5))
    
    contact_data = [
        [Paragraph("Contact Person's Name :", label_style), Paragraph(application.primary_contact_person, value_style), Paragraph("Mobile No. :", label_style), Paragraph(application.primary_contact_phone, value_style)],
        [Paragraph("Relationship with the Student :", label_style), Paragraph(application.relationship_with_student, value_style), "", ""],
        [Paragraph("Address :", label_style), Paragraph(application.address, value_style), "", ""],
        [Paragraph("City :", label_style), Paragraph(application.city, value_style), Paragraph("State :", label_style), Paragraph(application.state, value_style), 
         Paragraph("Country :", label_style), Paragraph(application.country or "India", value_style), Paragraph("Pin Code :", label_style), Paragraph(application.postal_code, value_style)]
    ]
    t_contact = Table(contact_data, colWidths=[1.8*inch, 2*inch, 1*inch, 2*inch])
    # Complex styling for contact table
    t_contact.setStyle(TableStyle([
        ('LINEBELOW', (1,0), (1,0), 0.5, colors.black), ('LINEBELOW', (3,0), (3,0), 0.5, colors.black),
        ('LINEBELOW', (1,1), (1,1), 0.5, colors.black), ('LINEBELOW', (1,2), (3,2), 0.5, colors.black),
        ('SPAN', (1,2), (3,2))
    ]))
    # Nested city/state table to match layout exactly
    city_row = [[Paragraph("City :", label_style), Paragraph(application.city, value_style), Paragraph("State :", label_style), Paragraph(application.state, value_style), 
                 Paragraph("Country :", label_style), Paragraph("India", value_style), Paragraph("Pin Code :", label_style), Paragraph(application.postal_code, value_style)]]
    t_city = Table(city_row, colWidths=[0.5*inch, 1*inch, 0.5*inch, 1*inch, 0.7*inch, 1*inch, 0.7*inch, 1*inch])
    t_city.setStyle(TableStyle([('LINEBELOW', (1,0), (1,0), 0.5, colors.black), ('LINEBELOW', (3,0), (3,0), 0.5, colors.black), 
                                ('LINEBELOW', (5,0), (5,0), 0.5, colors.black), ('LINEBELOW', (7,0), (7,0), 0.5, colors.black)]))
    
    elements.append(t_contact)
    elements.append(t_city)
    elements.append(Spacer(1, 10))

    # Previous School Section
    prev_school_data = [
        [Paragraph("Previous School/Montessori Details :", label_style), "", Paragraph("Mother Tongue :", label_style), Paragraph(application.mother_tongue, value_style)],
        [Paragraph("Name of the School :", label_style), Paragraph(application.previous_school_name, value_style), Paragraph("Nationality :", label_style), Paragraph(application.nationality, value_style)],
        [Paragraph("Address :", label_style), Paragraph(application.previous_school_address, value_style), Paragraph("Religion :", label_style), Paragraph(application.religion, value_style)],
        [Paragraph("City :", label_style), Paragraph(application.previous_school_city, value_style), Paragraph("State :", label_style), Paragraph(application.previous_school_state, value_style)],
        [Paragraph("Country :", label_style), Paragraph(application.previous_school_country, value_style), Paragraph("Pin Code :", label_style), Paragraph(application.previous_school_pincode, value_style)],
        [Paragraph("Name of the Principle :", label_style), Paragraph(application.previous_school_principle_name, value_style), "", ""],
        [Paragraph("Last class Attended :", label_style), Paragraph(application.previous_school_class, value_style), "", ""],
        [Paragraph("Board :", label_style), Paragraph(application.previous_school_board, value_style), Paragraph("Medium of Instruction", label_style), Paragraph(application.previous_school_medium, value_style)],
        [Paragraph("Second Language :", label_style), Paragraph(application.second_language, value_style), Paragraph("Third Language :", label_style), Paragraph(application.third_language, value_style)]
    ]
    t_prev = Table(prev_school_data, colWidths=[1.8*inch, 2.2*inch, 1.2*inch, 1.5*inch])
    t_prev.setStyle(TableStyle([
        ('LINEBELOW', (1,1), (1,1), 0.5, colors.black), ('LINEBELOW', (3,1), (3,1), 0.5, colors.black),
        ('LINEBELOW', (1,2), (1,2), 0.5, colors.black), ('LINEBELOW', (3,2), (3,2), 0.5, colors.black),
        ('LINEBELOW', (1,3), (1,3), 0.5, colors.black), ('LINEBELOW', (3,3), (3,3), 0.5, colors.black),
        ('LINEBELOW', (1,4), (1,4), 0.5, colors.black), ('LINEBELOW', (3,4), (3,4), 0.5, colors.black),
        ('LINEBELOW', (1,5), (1,5), 0.5, colors.black), ('LINEBELOW', (1,6), (1,6), 0.5, colors.black),
        ('LINEBELOW', (1,7), (1,7), 0.5, colors.black), ('LINEBELOW', (3,7), (3,7), 0.5, colors.black),
        ('LINEBELOW', (1,8), (1,8), 0.5, colors.black), ('LINEBELOW', (3,8), (3,8), 0.5, colors.black),
    ]))
    elements.append(t_prev)
    elements.append(Spacer(1, 10))

    # Academic Table
    elements.append(Paragraph("Last Academic performance record (Please put % Marks) for students seeking admission in III to Class XII (Wherever applicable)", small_label_style))
    elements.append(Spacer(1, 5))
    academic_table_data = [
        ["English", "2nd Language", "Mathematics", "science", "Social Studies", "EVS", "Others"],
        ["", "", "", "", "", "", ""]
    ]
    t_academic = Table(academic_table_data, colWidths=[1*inch]*7, rowHeights=[6*mm]*2)
    t_academic.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.black), ('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('FONTSIZE', (0,0), (-1,-1), 7)]))
    elements.append(t_academic)
    elements.append(Spacer(1, 10))

    # --- PAGE 2 ---
    elements.append(PageBreak())
    
    # Father Details
    elements.append(Paragraph("FATHER", section_header_style))
    elements.append(Spacer(1, 5))
    
    father_row1 = [
        [Paragraph("Name :", label_style), Paragraph(application.father_name, value_style), "", get_image(application.father_photo, 1*inch, 1.2*inch) or Paragraph("Affix recent<br/>colour<br/>Photograph of<br/>the Candidate", small_label_style)]
    ]
    t_father_head = Table(father_row1, colWidths=[0.6*inch, 4*inch, 0.4*inch, 1.2*inch])
    t_father_head.setStyle(TableStyle([('LINEBELOW', (1,0), (1,0), 0.5, colors.black), ('GRID', (3,0), (3,0), 0.5, colors.black), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(t_father_head)
    
    father_data = [
        [Paragraph("Qualification :", label_style), Paragraph(application.father_qualification, value_style), "", ""],
        [Paragraph("Name of the College/University/Institute :", label_style), Paragraph(application.father_college, value_style), "", ""],
        [Paragraph("Contact No. :", label_style), Paragraph(application.father_phone, value_style), Paragraph("Phone No. :", label_style), ""],
        [Paragraph("Work Details (V) Occupation Type :", label_style), Paragraph(application.father_occupation_type, value_style), "", ""],
        [Paragraph("Organisation Name :", label_style), Paragraph(application.father_organisation, value_style), "", ""],
        [Paragraph("Designation :", label_style), Paragraph(application.father_designation, value_style), Paragraph("Annual Income :", label_style), Paragraph(str(application.father_income or ""), value_style)],
        [Paragraph("Office Address :", label_style), Paragraph(application.father_office_address, value_style), "", ""],
        [Paragraph("Email Id :", label_style), Paragraph(application.father_email, value_style), "", ""]
    ]
    t_father = Table(father_data, colWidths=[2.2*inch, 2.8*inch, 1*inch, 1*inch])
    t_father.setStyle(TableStyle([
        ('LINEBELOW', (1,0), (1,0), 0.5, colors.black), ('LINEBELOW', (1,1), (3,1), 0.5, colors.black),
        ('LINEBELOW', (1,2), (1,2), 0.5, colors.black), ('LINEBELOW', (3,2), (3,2), 0.5, colors.black),
        ('LINEBELOW', (1,4), (3,4), 0.5, colors.black), ('LINEBELOW', (1,5), (1,5), 0.5, colors.black),
        ('LINEBELOW', (3,5), (3,5), 0.5, colors.black), ('LINEBELOW', (1,6), (3,6), 0.5, colors.black),
        ('LINEBELOW', (1,7), (3,7), 0.5, colors.black),
        ('SPAN', (1,1), (3,1)), ('SPAN', (1,4), (3,4)), ('SPAN', (1,6), (3,6)), ('SPAN', (1,7), (3,7))
    ]))
    elements.append(t_father)
    elements.append(Spacer(1, 10))

    # Mother Details
    elements.append(Paragraph("MOTHER", section_header_style))
    elements.append(Spacer(1, 5))
    
    mother_row1 = [
        [Paragraph("Name :", label_style), Paragraph(application.mother_name, value_style), "", get_image(application.mother_photo, 1*inch, 1.2*inch) or Paragraph("Affix recent<br/>colour<br/>Photograph of<br/>the Candidate", small_label_style)]
    ]
    t_mother_head = Table(mother_row1, colWidths=[0.6*inch, 4*inch, 0.4*inch, 1.2*inch])
    t_mother_head.setStyle(TableStyle([('LINEBELOW', (1,0), (1,0), 0.5, colors.black), ('GRID', (3,0), (3,0), 0.5, colors.black), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(t_mother_head)
    
    mother_data = [
        [Paragraph("Qualification :", label_style), Paragraph(application.mother_qualification, value_style), "", ""],
        [Paragraph("Name of the College/University/Institute :", label_style), Paragraph(application.mother_college, value_style), "", ""],
        [Paragraph("Contact No. :", label_style), Paragraph(application.mother_phone, value_style), Paragraph("Email Id :", label_style), Paragraph(application.mother_email, value_style)]
    ]
    t_mother = Table(mother_data, colWidths=[2.2*inch, 2.2*inch, 1*inch, 1.6*inch])
    t_mother.setStyle(TableStyle([
        ('LINEBELOW', (1,0), (1,0), 0.5, colors.black), ('LINEBELOW', (1,1), (3,1), 0.5, colors.black),
        ('LINEBELOW', (1,2), (1,2), 0.5, colors.black), ('LINEBELOW', (3,2), (3,2), 0.5, colors.black),
        ('SPAN', (1,1), (3,1))
    ]))
    elements.append(t_mother)
    elements.append(Spacer(1, 10))

    # Siblings
    elements.append(Paragraph("Details of Siblings :", label_style))
    elements.append(Spacer(1, 5))
    sibling_table_data = [
        ["SI No", "Name", "Class", "Sec", "Roll", "Regn No."],
        ["1", "", "", "", "", ""],
        ["2", "", "", "", "", ""]
    ]
    t_siblings = Table(sibling_table_data, colWidths=[0.6*inch, 2.4*inch, 1*inch, 0.6*inch, 0.8*inch, 1.6*inch], rowHeights=[6*mm]*3)
    t_siblings.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.black), ('ALIGN', (0,0), (-1,-1), 'CENTER'), ('FONTSIZE', (0,0), (-1,-1), 8)]))
    elements.append(t_siblings)
    elements.append(Spacer(1, 15))

    # Footer/Declaration
    declaration_text = f"I/We {application.father_name} & {application.mother_name} parent of {application.first_name} {application.last_name} Read the School's rules and regulations and hereby agree to abide by the same. All the above mentioned details provided by me/us are true in all respect."
    elements.append(Paragraph(declaration_text, small_label_style))
    elements.append(Spacer(1, 20))
    
    footer_data = [
        [Paragraph("PLACE :", label_style), Paragraph("____________________", value_style), Paragraph("Signature of Father ->", label_style), Paragraph("____________________", value_style)],
        [Paragraph("DATE :", label_style), Paragraph(application.created_at.strftime('%d-%m-%Y'), value_style), Paragraph("Signature of Mother ->", label_style), Paragraph("____________________", value_style)]
    ]
    t_footer = Table(footer_data, colWidths=[1*inch, 2*inch, 1.5*inch, 2*inch])
    elements.append(t_footer)

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_admission_invoice(application):
    """
    Generates a PDF invoice for admission fees.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    
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
        fontSize=14,
        alignment=1,
        spaceAfter=20
    )
    
    body_style = styles['Normal']
    
    elements = []
    
    # Header
    elements.append(Paragraph(f"{application.school.name}".upper(), title_style))
    elements.append(Paragraph("ADMISSION FEE INVOICE", subtitle_style))
    elements.append(Spacer(1, 0.2 * inch))
    
    # Invoice Details
    invoice_info = [
        ["Invoice No:", f"INV-{application.application_number}", "Date:", application.created_at.strftime('%d-%m-%Y')],
        ["Student Name:", f"{application.first_name} {application.last_name}", "Class:", application.target_class.name],
        ["Father's Name:", application.father_name, "Contact:", application.father_phone]
    ]
    t_info = Table(invoice_info, colWidths=[1.5*inch, 2*inch, 1*inch, 1.5*inch])
    t_info.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 0.4 * inch))
    
    # Fetch actual fee allocations created for this application
    allocations = application.fee_allocations.all()
    
    fee_data = [["S.No", "Description", "Amount (Rs)"]]
    total_amount = 0
    
    if allocations.exists():
        for i, alloc in enumerate(allocations, 1):
            fee_data.append([str(i), alloc.fee_master.fee_type.name, f"{alloc.amount:.2f}"])
            total_amount += alloc.amount
    else:
        fee_data.append(["1", "Admission Fee (Not Configured)", "0.00"])
        
    fee_data.append(["", "Total Amount:", f"{total_amount:.2f}"])
    t_fee = Table(fee_data, colWidths=[0.8*inch, 4*inch, 1.5*inch])
    t_fee.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('ALIGN', (1,1), (1,-1), 'LEFT'),
        ('ALIGN', (2,1), (2,-1), 'RIGHT'),
        ('FONTNAME', (1,-1), (2,-1), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-2), 1, colors.grey),
        ('BOX', (0,0), (-1,-1), 1, colors.grey),
        ('LINEABOVE', (1,-1), (-1,-1), 1, colors.black),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_fee)
    
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph("<b>Payment Status:</b> Paid" if application.application_fee_paid else "<b>Payment Status:</b> Pending", body_style))
    elements.append(Spacer(1, 1 * inch))
    
    # Signatures
    sig_data = [
        ["________________________", "________________________"],
        ["Accountant Signature", "Parent Signature"]
    ]
    t_sig = Table(sig_data, colWidths=[3*inch, 3*inch])
    t_sig.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    elements.append(t_sig)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
