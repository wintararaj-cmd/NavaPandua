
import { useState } from 'react';
import { School, ChevronDown, Check } from 'lucide-react';
import { authStore } from '../stores/authStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function SchoolSwitcher() {
    const { user, updateUser } = authStore();
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);

    const allowedSchools = user?.allowed_schools || [];
    const currentSchoolId = typeof user?.school === 'string' ? user?.school : user?.school?.id;
    const currentSchool = allowedSchools.find(s => s.id === currentSchoolId);

    if (allowedSchools.length <= 1) return null;

    const handleSwitch = async (schoolId: string) => {
        if (schoolId === currentSchoolId) {
            setIsOpen(false);
            return;
        }

        try {
            setSwitching(true);
            const response = await authService.switchSchool(schoolId);
            if (response.success) {
                updateUser(response.data.user);
                toast.success(`Switched to ${response.data.user.school.name}`);
                // Optional: Force reload to clear any school-specific state/caches
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to switch school');
        } finally {
            setSwitching(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all text-sm font-medium text-gray-700"
            >
                <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                    <School className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="max-w-[150px] truncate">
                    {currentSchool?.name || 'Select School'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Schools</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {allowedSchools.map((school) => (
                                <button
                                    key={school.id}
                                    onClick={() => handleSwitch(school.id)}
                                    disabled={switching}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${school.id === currentSchoolId ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-600'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{school.name}</span>
                                        <span className="text-[11px] opacity-70">Code: {school.code}</span>
                                    </div>
                                    {school.id === currentSchoolId && (
                                        <Check className="w-4 h-4 text-indigo-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
