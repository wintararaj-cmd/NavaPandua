
import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Trash2, Edit, School as SchoolIcon } from 'lucide-react';
import { schoolService, type School } from '../services/schoolService';
import SchoolModal from '../components/schools/SchoolModal';
import toast from 'react-hot-toast';

export default function Schools() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const data = await schoolService.getSchools();
            setSchools(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            toast.error('Failed to fetch schools');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSchool(null);
        setIsModalOpen(true);
    };

    const handleEdit = (school: School) => {
        setEditingSchool(school);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this school?')) return;
        try {
            await schoolService.deleteSchool(id);
            toast.success('School deleted successfully');
            fetchSchools();
        } catch (error) {
            toast.error('Failed to delete school');
            console.error(error);
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (editingSchool) {
                await schoolService.updateSchool(editingSchool.id, data);
                toast.success('School updated successfully');
            } else {
                await schoolService.createSchool(data);
                toast.success('School created successfully');
            }
            fetchSchools();
        } catch (error) {
            toast.error(editingSchool ? 'Failed to update school' : 'Failed to create school');
            console.error(error);
            throw error;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
                    <p className="text-gray-600">Manage schools within organizations</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New School
                </button>
            </div>

            <div className="card">
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search schools..."
                            className="input pl-10 w-full"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-200">
                                    <th className="pb-3 px-4 font-semibold text-gray-600">School</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Organization</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Board/Medium</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Stats</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Status</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schools.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            No schools found
                                        </td>
                                    </tr>
                                )}
                                {schools.map((school) => (
                                    <tr key={school.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary-50 p-2 rounded-lg">
                                                    <SchoolIcon className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{school.name}</div>
                                                    <div className="text-xs text-gray-500">{school.city}, {school.state}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-600">
                                                {school.organization_name || '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm">
                                                <div>{school.board}</div>
                                                <div className="text-xs text-gray-500">{school.medium}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-xs text-gray-500">
                                                <div>{school.total_students || 0} Students</div>
                                                <div>{school.total_teachers || 0} Teachers</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${school.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {school.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(school)}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(school.id)}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <SchoolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingSchool}
            />
        </div>
    );
}
