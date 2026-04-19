
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { classService, type Class } from '../../services/classService';

interface EnquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function EnquiryModal({ isOpen, onClose, onSave, initialData }: EnquiryModalProps) {
    const [formData, setFormData] = useState({
        school: '',
        student_name: '',
        parent_name: '',
        phone: '',
        email: '',
        target_class: '',
        status: 'NEW',
        description: ''
    });
    const [classes, setClasses] = useState<Class[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSchools();
            fetchClasses();
            if (initialData) {
                setFormData({
                    school: initialData.school || '',
                    student_name: initialData.student_name || '',
                    parent_name: initialData.parent_name || '',
                    phone: initialData.phone || '',
                    email: initialData.email || '',
                    target_class: initialData.target_class || '',
                    status: initialData.status || 'NEW',
                    description: initialData.description || ''
                });
            } else {
                // Reset form
                setFormData({
                    school: '',
                    student_name: '',
                    parent_name: '',
                    phone: '',
                    email: '',
                    target_class: '',
                    status: 'NEW',
                    description: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const fetchSchools = async () => {
        try {
            const { schoolService } = await import('../../services/schoolService');
            const data = await schoolService.getAll();
            setSchools(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch schools', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const data = await classService.getClasses();
            setClasses(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to fetch classes', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {initialData ? 'Edit Enquiry' : 'New Enquiry'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">School *</label>
                        <select
                            required
                            className="input w-full mt-1"
                            value={formData.school}
                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        >
                            <option value="">Select School</option>
                            {schools.map((school) => (
                                <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student Name</label>
                        <input
                            type="text"
                            required
                            className="input w-full mt-1"
                            value={formData.student_name}
                            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Parent Name</label>
                        <input
                            type="text"
                            required
                            className="input w-full mt-1"
                            value={formData.parent_name}
                            onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                required
                                className="input w-full mt-1"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                className="input w-full mt-1"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target Class</label>
                        <select
                            className="input w-full mt-1"
                            value={formData.target_class}
                            onChange={(e) => setFormData({ ...formData, target_class: e.target.value })}
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="input w-full mt-1"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="VISITED">Visited</option>
                            <option value="APPLICATION_PURCHASED">Application Purchased</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes/Description</label>
                        <textarea
                            className="input w-full mt-1"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Enquiry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
