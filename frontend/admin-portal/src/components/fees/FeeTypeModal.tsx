
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { feeService } from '../../services/feeService';
import toast from 'react-hot-toast';

interface FeeTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FeeTypeModal({ isOpen, onClose, onSuccess }: FeeTypeModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await feeService.createFeeType(formData);
            toast.success('Fee type created successfully');
            onSuccess();
            onClose();
            setFormData({ name: '', description: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create fee type');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Add Fee Type</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="e.g. Monthly Tuition, Exam Fee, Library Fee"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                rows={3}
                                placeholder="Optional description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                                Create Type
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
