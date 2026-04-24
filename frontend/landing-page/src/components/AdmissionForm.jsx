
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, Download, ArrowRight, ArrowLeft, Building, User, Users, GraduationCap } from 'lucide-react';

const AdmissionForm = () => {
    const [step, setStep] = useState(1);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    const [formData, setFormData] = useState({
        school: '',
        target_class: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'MALE',
        place_of_birth: '',
        mother_tongue: '',
        nationality: 'Indian',
        religion: '',
        caste: '',
        blood_group: '',
        father_name: '',
        father_phone: '',
        father_email: '',
        father_qualification: '',
        father_occupation: '',
        mother_name: '',
        mother_phone: '',
        mother_email: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        previous_school_name: '',
        previous_school_board: '',
        previous_school_class: '',
        is_single_parent: false,
        legal_guardian: '',
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
            
            // Create a blob URL for the PDF
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);
            setSubmitted(true);
            toast.success('Admission application submitted successfully!');
        } catch (error) {
            console.error('Submission failed:', error);
            toast.error('Failed to submit application. Please check the fields and try again.');
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
                        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <span>Institution</span>
                        </div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <span>Student</span>
                        </div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <span>Family</span>
                        </div>
                        <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
                            <div className="step-number">4</div>
                            <span>Review</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="admission-form-content">
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2"><Building className="text-blue-600" /> Select Institution</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>School / Institute</label>
                                        <select 
                                            name="school" 
                                            value={formData.school} 
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                        >
                                            <option value="">Select School</option>
                                            {schools.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Admission Sought for Class</label>
                                        <select 
                                            name="target_class" 
                                            value={formData.target_class} 
                                            onChange={handleChange}
                                            className="form-control"
                                            required
                                            disabled={!formData.school}
                                        >
                                            <option value="">Select Class</option>
                                            {selectedSchool?.classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={handleNext} className="btn-next" disabled={!formData.target_class}>
                                        Next <ArrowRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2"><User className="text-blue-600" /> Student Details</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Middle Name</label>
                                        <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Nationality</label>
                                        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="form-control" />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Student Photo</label>
                                        <input type="file" name="photo" onChange={handleChange} accept="image/*" className="form-control" />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={handlePrev} className="btn-prev">
                                        <ArrowLeft size={18} style={{ display: 'inline', marginRight: '5px' }} /> Previous
                                    </button>
                                    <button type="button" onClick={handleNext} className="btn-next">
                                        Next <ArrowRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2"><Users className="text-blue-600" /> Family Details</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Father's Name</label>
                                        <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Father's Phone</label>
                                        <input type="tel" name="father_phone" value={formData.father_phone} onChange={handleChange} className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Mother's Name</label>
                                        <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Mother's Phone</label>
                                        <input type="tel" name="mother_phone" value={formData.mother_phone} onChange={handleChange} className="form-control" required />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Residential Address</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} className="form-control" rows="3" required></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Father's Photo</label>
                                        <input type="file" name="father_photo" onChange={handleChange} accept="image/*" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Mother's Photo</label>
                                        <input type="file" name="mother_photo" onChange={handleChange} accept="image/*" className="form-control" />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={handlePrev} className="btn-prev">
                                        <ArrowLeft size={18} style={{ display: 'inline', marginRight: '5px' }} /> Previous
                                    </button>
                                    <button type="button" onClick={handleNext} className="btn-next">
                                        Next <ArrowRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-fade-in">
                                <h3 className="mb-4 flex items-center gap-2"><GraduationCap className="text-blue-600" /> Review Application</h3>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                                    <div className="grid grid-cols-2 gap-y-4">
                                        <div><strong>Institution:</strong> {selectedSchool?.name}</div>
                                        <div><strong>Class:</strong> {selectedSchool?.classes.find(c => c.id === formData.target_class)?.name}</div>
                                        <div><strong>Student:</strong> {formData.first_name} {formData.last_name}</div>
                                        <div><strong>DOB:</strong> {formData.date_of_birth}</div>
                                        <div><strong>Father:</strong> {formData.father_name}</div>
                                        <div><strong>Mother:</strong> {formData.mother_name}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    By submitting this form, you confirm that the information provided is accurate to the best of your knowledge.
                                </p>
                                <div className="form-actions">
                                    <button type="button" onClick={handlePrev} className="btn-prev">
                                        <ArrowLeft size={18} style={{ display: 'inline', marginRight: '5px' }} /> Previous
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={loading}>
                                        {loading ? 'Submitting...' : 'Confirm & Submit Application'}
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
