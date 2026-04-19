
import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { feeService, type FeeAllocation } from '../../services/feeService';
import toast from 'react-hot-toast';

interface FeePaymentModalProps {
    isOpen: boolean;
    allocation: FeeAllocation | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FeePaymentModal({ isOpen, allocation, onClose, onSuccess }: FeePaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount_paid: '',
        payment_mode: 'CASH',
        reference_number: '',
        notes: ''
    });

    React.useEffect(() => {
        if (allocation) {
            setFormData(prev => ({ ...prev, amount_paid: allocation.remaining_amount || allocation.amount }));
        }
    }, [allocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!allocation) return;

        try {
            setLoading(true);
            await feeService.collectPayment({
                allocation: allocation.id,
                amount_paid: parseFloat(formData.amount_paid),
                payment_mode: formData.payment_mode,
                reference_number: formData.reference_number,
                notes: formData.notes
            });
            toast.success('Payment recorded successfully');
            onSuccess();
            onClose();
            setFormData({
                amount_paid: '',
                payment_mode: 'CASH',
                reference_number: '',
                notes: ''
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !allocation) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg mb-6 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Balance Due</p>
                            <p className="text-2xl font-black text-indigo-900">₹{allocation.remaining_amount}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Fee Type</p>
                            <p className="text-sm font-bold text-gray-900">{allocation.fee_type_name}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay (₹)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                                max={allocation.remaining_amount}
                                value={formData.amount_paid}
                                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'].map(mode => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, payment_mode: mode })}
                                        className={`px-3 py-2 text-xs font-bold rounded-md border transition-all ${formData.payment_mode === mode
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        {mode.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Transaction ID, Cheque No, etc."
                                value={formData.reference_number}
                                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-6"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <CheckCircle className="h-5 w-5" />
                            )}
                            Confirm Payment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
