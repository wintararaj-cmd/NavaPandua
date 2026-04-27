
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, Download, ArrowRight, ArrowLeft, Building, User, Users, GraduationCap, BookOpen, ClipboardList } from 'lucide-react';

const AdmissionForm = () => {
    const [step, setStep] = useState(1);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    const [formData, setFormData] = useState({
        // Step 1: Institution
        school: '',
        target_class: '',
        receipt_no: '',
        admission_date: new Date().toISOString().split('T')[0],

        // Step 2: Student Details
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'MALE',
        place_of_birth: '',
        nationality: 'Indian',
        mother_tongue: '',
        religion: '',
        caste: 'GENERAL',
        blood_group: '',
        
        category: 'GENERAL', // GENERAL / STAFF
        staff_name: '',
        staff_id: '',

        primary_contact_person: '',
        primary_contact_phone: '',
        relationship_with_student: '',
        
        address: '',
        city: '',
        state: '',
        country: 'India',
        postal_code: '',

        // Step 3: Academic History
        previous_school_name: '',
        previous_school_address: '',
        previous_school_city: '',
        previous_school_state: '',
        previous_school_country: 'India',
        previous_school_pincode: '',
        previous_school_principle_name: '',
        previous_school_board: '',
        previous_school_class: '',
        previous_school_medium: '',
        
        second_language: '',
        third_language: '',

        // Step 4: Family Details
        father_name: '',
        father_phone: '',
        father_email: '',
        father_qualification: '',
        father_college: '',
        father_occupation_type: 'PRIVATE', // GOVT, PVT, BUSINESS, PROFESSIONAL, OTHERS
        father_occupation: '',
        father_organisation: '',
        father_designation: '',
        father_income: '',
        father_office_address: '',

        mother_name: '',
        mother_phone: '',
        mother_email: '',
        mother_qualification: '',
        mother_college: '',

        is_single_parent: false,
        legal_guardian: '',
        is_guardian_father: false,
        is_guardian_mother: false,

        // Photos
        photo: null,
        father_photo: null,
        mother_photo: null
    });

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/admissions/public/');
                setSchools(response.data.data);
            } catch (error) {
                console.error('Failed to fetch schools:', error);
                toast.error('Failed to load schools. Please try again later.');
            }
        };
        fetchSchools();
        
        // Auto-generate a receipt number for the UI
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        setFormData(prev => ({
            ...prev,
            receipt_no: `REG-${new Date().getFullYear()}-${randomNum}`
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData({
                ...formData,
                [name]: files[0]
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleNext = () => setStep(step + 1);
    const handlePrev = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            const response = await axios.post(
                'http://localhost:8000/api/v1/admissions/public/', 
                data,
                { 
                    responseType: 'blob',
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
            setSubmitted(true);
            toast.success('Admission application submitted successfully!');
        } catch (error) {
            console.error('Submission failed:', error.response?.data || error.message);
            if (error.response?.data instanceof Blob) {
                // If the error response is a blob, we need to read it as JSON
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        console.error('Validation errors:', errorData);
                        toast.error(`Submission failed: ${Object.values(errorData).flat().join(', ')}`);
                    } catch (e) {
                        toast.error('Failed to submit application. Please check all required fields.');
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                toast.error('Failed to submit application. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const selectedSchool = schools.find(s => s.id === formData.school);

    if (submitted) {
        return (
            <section className="admission-section">
                <div className="container">
                    <div className="admission-container">
                        <div className="success-card">
                            <div className="success-icon">
                                <CheckCircle size={48} />
                            </div>
                            <h2>Application Submitted!</h2>
                            <p className="text-gray-600 mb-8">
                                Your admission application has been received successfully. 
                                We have generated an acknowledgement for you.
                            </p>
                            <div className="flex justify-center gap-4">
                                <a 
                                    href={pdfUrl} 
                                    download={`acknowledgement_${formData.first_name}.pdf`}
                                    className="btn btn-yellow"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Download size={20} /> Download Acknowledgement
                                </a>
                                <button 
                                    onClick={() => window.location.href = '/'}
                                    className="btn btn-outline-dark"
                                    style={{ marginLeft: '10px' }}
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="admission-section">
            <div className="container">
                <div className="admission-container">
                    <div className="admission-header">
                        <h1>Online Admission</h1>
                        <p>Join our academic community for a brighter future</p>
                    </div>

                    <div className="admission-steps">
                        {[
                            { n: 1, l: 'Institution', i: Building },
                            { n: 2, l: 'Student', i: User },
                            { n: 3, l: 'Academic', i: BookOpen },
                            { n: 4, l: 'Family', i: Users },
                            { n: 5, l: 'Review', i: ClipboardList }
                        ].map(s => (
                            <div key={s.n} className={`step-item ${step >= s.n ? 'active' : ''}`} onClick={() => step > s.n && setStep(s.n)}>
                                <div className="step-number">{s.n}</div>
                                <span>{s.l}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="admission-form-content">
                        {/* Step 1: Institution Selection */}
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2 text-primary"><Building size={20} /> Select Institution & Base Info</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>School / Institute *</label>
                                        <select name="school" value={formData.school} onChange={handleChange} className="form-control" required>
                                            <option value="">Select School</option>
                                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Admission Sought for Class *</label>
                                        <select name="target_class" value={formData.target_class} onChange={handleChange} className="form-control" required disabled={!formData.school}>
                                            <option value="">Select Class</option>
                                            {selectedSchool?.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Registration / Receipt No. (Auto-generated)</label>
                                        <input 
                                            type="text" 
                                            name="receipt_no" 
                                            value={formData.receipt_no} 
                                            className="form-control" 
                                            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                            readOnly 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Admission Date</label>
                                        <input 
                                            type="date" 
                                            name="admission_date" 
                                            value={formData.admission_date} 
                                            className="form-control" 
                                            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                            readOnly 
                                        />
                                    </div>
                                </div>
                                <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={handleNext} className="btn-next" disabled={!formData.target_class}>
                                        Next <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Student Details */}
                        {step === 2 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2 text-primary"><User size={20} /> Student Personal Details</h3>
                                <div className="form-grid">
                                    <div className="form-group"><label>First Name *</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="form-control" required /></div>
                                    <div className="form-group"><label>Middle Name</label><input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>Last Name *</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="form-control" required /></div>
                                    <div className="form-group"><label>Date of Birth *</label><input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="form-control" required /></div>
                                    <div className="form-group">
                                        <label>Gender *</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="form-control" required>
                                            <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Place of Birth</label><input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>Nationality</label><input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group">
                                        <label>Mother Tongue</label>
                                        <select name="mother_tongue" value={formData.mother_tongue} onChange={handleChange} className="form-control">
                                            <option value="">Select Language</option>
                                            <option value="Bengali">Bengali</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="English">English</option>
                                            <option value="Urdu">Urdu</option>
                                            <option value="Assamese">Assamese</option>
                                            <option value="Odia">Odia</option>
                                            <option value="Sanskrit">Sanskrit</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Religion</label>
                                        <select name="religion" value={formData.religion} onChange={handleChange} className="form-control">
                                            <option value="">Select Religion</option>
                                            <option value="Hindu">Hindu</option>
                                            <option value="Muslim">Muslim</option>
                                            <option value="Sikh">Sikh</option>
                                            <option value="Christian">Christian</option>
                                            <option value="Buddhist">Buddhist</option>
                                            <option value="Jain">Jain</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Caste</label>
                                        <select name="caste" value={formData.caste} onChange={handleChange} className="form-control">
                                            <option value="GENERAL">General</option><option value="SC">SC</option><option value="ST">ST</option><option value="OBC">OBC</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Blood Group</label><input type="text" name="blood_group" value={formData.blood_group} onChange={handleChange} className="form-control" placeholder="e.g. A+" /></div>
                                    
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                                            <option value="GENERAL">General Candidate</option><option value="STAFF">Staff Child</option>
                                        </select>
                                    </div>
                                    {formData.category === 'STAFF' && (
                                        <>
                                            <div className="form-group"><label>Staff Name</label><input type="text" name="staff_name" value={formData.staff_name} onChange={handleChange} className="form-control" /></div>
                                            <div className="form-group"><label>Staff ID</label><input type="text" name="staff_id" value={formData.staff_id} onChange={handleChange} className="form-control" /></div>
                                        </>
                                    )}

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <h4 className="mt-4 mb-2 text-sm font-bold text-gray-700">Primary Contact for Communication</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><label className="text-xs">Contact Person</label><input type="text" name="primary_contact_person" value={formData.primary_contact_person} onChange={handleChange} className="form-control" /></div>
                                            <div><label className="text-xs">Relationship</label><input type="text" name="relationship_with_student" value={formData.relationship_with_student} onChange={handleChange} className="form-control" /></div>
                                            <div><label className="text-xs">Mobile No.</label><input type="tel" name="primary_contact_phone" value={formData.primary_contact_phone} onChange={handleChange} className="form-control" /></div>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                        <label>Full Residential Address *</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} className="form-control" rows="2" required />
                                    </div>
                                    <div className="form-group"><label>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <select name="state" value={formData.state} onChange={handleChange} className="form-control">
                                            <option value="">Select State</option>
                                            <option value="West Bengal">West Bengal</option>
                                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                            <option value="Assam">Assam</option>
                                            <option value="Bihar">Bihar</option>
                                            <option value="Chhattisgarh">Chhattisgarh</option>
                                            <option value="Goa">Goa</option>
                                            <option value="Gujarat">Gujarat</option>
                                            <option value="Haryana">Haryana</option>
                                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                                            <option value="Jharkhand">Jharkhand</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Kerala">Kerala</option>
                                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Manipur">Manipur</option>
                                            <option value="Meghalaya">Meghalaya</option>
                                            <option value="Mizoram">Mizoram</option>
                                            <option value="Nagaland">Nagaland</option>
                                            <option value="Odisha">Odisha</option>
                                            <option value="Punjab">Punjab</option>
                                            <option value="Rajasthan">Rajasthan</option>
                                            <option value="Sikkim">Sikkim</option>
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                            <option value="Telangana">Telangana</option>
                                            <option value="Tripura">Tripura</option>
                                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                                            <option value="Uttarakhand">Uttarakhand</option>
                                            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                            <option value="Chandigarh">Chandigarh</option>
                                            <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                            <option value="Ladakh">Ladakh</option>
                                            <option value="Lakshadweep">Lakshadweep</option>
                                            <option value="Puducherry">Puducherry</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>PIN Code</label><input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="form-control" /></div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Student Photograph</label>
                                        <input type="file" name="photo" onChange={handleChange} accept="image/*" className="form-control" />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={handlePrev} className="btn-prev"><ArrowLeft size={18} /> Previous</button>
                                    <button type="button" onClick={handleNext} className="btn-next">Next <ArrowRight size={18} /></button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Academic History */}
                        {step === 3 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2 text-primary"><BookOpen size={20} /> Previous School Details</h3>
                                <div className="form-grid">
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Name of the School</label><input type="text" name="previous_school_name" value={formData.previous_school_name} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>Name of Principle</label><input type="text" name="previous_school_principle_name" value={formData.previous_school_principle_name} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group" style={{ gridColumn: 'span 3' }}><label>School Address</label><input type="text" name="previous_school_address" value={formData.previous_school_address} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>City</label><input type="text" name="previous_school_city" value={formData.previous_school_city} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>State</label><input type="text" name="previous_school_state" value={formData.previous_school_state} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>PIN Code</label><input type="text" name="previous_school_pincode" value={formData.previous_school_pincode} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>Last Class Attended</label><input type="text" name="previous_school_class" value={formData.previous_school_class} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>Board / Affiliation</label><input type="text" name="previous_school_board" value={formData.previous_school_board} onChange={handleChange} className="form-control" /></div>
                                    <div className="form-group"><label>Medium of Instruction</label><input type="text" name="previous_school_medium" value={formData.previous_school_medium} onChange={handleChange} className="form-control" /></div>
                                    
                                    <div className="form-group"><label>2nd Language (Opted)</label><input type="text" name="second_language" value={formData.second_language} onChange={handleChange} className="form-control" placeholder="e.g. Hindi/Bengali" /></div>
                                    <div className="form-group"><label>3rd Language (Opted)</label><input type="text" name="third_language" value={formData.third_language} onChange={handleChange} className="form-control" /></div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={handlePrev} className="btn-prev"><ArrowLeft size={18} /> Previous</button>
                                    <button type="button" onClick={handleNext} className="btn-next">Next <ArrowRight size={18} /></button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Family Details */}
                        {step === 4 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2 text-primary"><Users size={20} /> Parents / Guardians Information</h3>
                                
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                                    <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2"><User size={16} /> Father's Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group"><label>Father's Name *</label><input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="form-control" required /></div>
                                        <div className="form-group"><label>Contact No *</label><input type="tel" name="father_phone" value={formData.father_phone} onChange={handleChange} className="form-control" required /></div>
                                        <div className="form-group"><label>Email ID</label><input type="email" name="father_email" value={formData.father_email} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group"><label>Qualification</label><input type="text" name="father_qualification" value={formData.father_qualification} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group"><label>College/University</label><input type="text" name="father_college" value={formData.father_college} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group">
                                            <label>Occupation Type</label>
                                            <select name="father_occupation_type" value={formData.father_occupation_type} onChange={handleChange} className="form-control">
                                                <option value="GOVT">Government</option><option value="PRIVATE">Private Sector</option><option value="BUSINESS">Business</option><option value="PROFESSIONAL">Professional</option><option value="OTHERS">Others</option>
                                            </select>
                                        </div>
                                        <div className="form-group"><label>Occupation</label><input type="text" name="father_occupation" value={formData.father_occupation} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group"><label>Organisation Name</label><input type="text" name="father_organisation" value={formData.father_organisation} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group"><label>Annual Income</label><input type="number" name="father_income" value={formData.father_income} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Office Address</label><input type="text" name="father_office_address" value={formData.father_office_address} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group"><label>Father's Photo</label><input type="file" name="father_photo" onChange={handleChange} accept="image/*" className="form-control" /></div>
                                    </div>
                                </div>

                                <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 mb-6">
                                    <h4 className="font-bold text-pink-800 mb-4 flex items-center gap-2"><User size={16} /> Mother's Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group"><label>Mother's Name *</label><input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className="form-control" required /></div>
                                        <div className="form-group"><label>Contact No *</label><input type="tel" name="mother_phone" value={formData.mother_phone} onChange={handleChange} className="form-control" required /></div>
                                        <div className="form-group"><label>Email ID</label><input type="email" name="mother_email" value={formData.mother_email} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group"><label>Qualification</label><input type="text" name="mother_qualification" value={formData.mother_qualification} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group"><label>College/University</label><input type="text" name="mother_college" value={formData.mother_college} onChange={handleChange} className="form-control" /></div>
                                        <div className="form-group"><label>Mother's Photo</label><input type="file" name="mother_photo" onChange={handleChange} accept="image/*" className="form-control" /></div>
                                    </div>
                                </div>

                                <div className="form-group flex items-center gap-6 py-2 px-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="is_single_parent" checked={formData.is_single_parent} onChange={handleChange} /> 
                                        <span className="font-bold text-sm">Single Parent?</span>
                                    </label>
                                    {formData.is_single_parent && (
                                        <div className="flex items-center gap-4 flex-1">
                                            <input type="text" name="legal_guardian" value={formData.legal_guardian} onChange={handleChange} placeholder="Legal Guardian Name" className="form-control" />
                                            <div className="flex gap-4">
                                                <label className="text-xs flex items-center gap-1"><input type="checkbox" name="is_guardian_father" checked={formData.is_guardian_father} onChange={handleChange} /> Father</label>
                                                <label className="text-xs flex items-center gap-1"><input type="checkbox" name="is_guardian_mother" checked={formData.is_guardian_mother} onChange={handleChange} /> Mother</label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions mt-6">
                                    <button type="button" onClick={handlePrev} className="btn-prev"><ArrowLeft size={18} /> Previous</button>
                                    <button type="button" onClick={handleNext} className="btn-next">Next <ArrowRight size={18} /></button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Review & Submit */}
                        {step === 5 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2 text-primary"><ClipboardList size={20} /> Review Your Application</h3>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-gray-400 mb-2">Student Information</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Name:</strong> {formData.first_name} {formData.middle_name} {formData.last_name}</p>
                                                <p><strong>DOB:</strong> {formData.date_of_birth}</p>
                                                <p><strong>Class Sought:</strong> {selectedSchool?.classes.find(c => c.id === formData.target_class)?.name}</p>
                                                <p><strong>Nationality:</strong> {formData.nationality}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-gray-400 mb-2">Primary Contact</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Person:</strong> {formData.primary_contact_person || formData.father_name}</p>
                                                <p><strong>Phone:</strong> {formData.primary_contact_phone || formData.father_phone}</p>
                                                <p><strong>Address:</strong> {formData.address}, {formData.city}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-gray-400 mb-2">Family Information</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Father:</strong> {formData.father_name} ({formData.father_phone})</p>
                                                <p><strong>Mother:</strong> {formData.mother_name} ({formData.mother_phone})</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-gray-400 mb-2">Files Attached</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><strong>Student Photo:</strong> {formData.photo ? 'Yes' : 'No'}</p>
                                                <p><strong>Father Photo:</strong> {formData.father_photo ? 'Yes' : 'No'}</p>
                                                <p><strong>Mother Photo:</strong> {formData.mother_photo ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-6">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Declaration:</strong> I/We hereby declare that the information provided is correct to the best of my/our knowledge. I/We agree to abide by the rules and regulations of the school.
                                    </p>
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={handlePrev} className="btn-prev"><ArrowLeft size={18} /> Previous</button>
                                    <button type="submit" className="btn-submit" disabled={loading}>
                                        {loading ? 'Submitting Application...' : 'Submit Admission Application'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AdmissionForm;
