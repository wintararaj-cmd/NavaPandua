
import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Trash2, Edit } from 'lucide-react';
import { organizationService, type Organization } from '../services/organizationService';
import OrganizationModal from '../components/organizations/OrganizationModal';
import toast from 'react-hot-toast';

export default function Organizations() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const data = await organizationService.getOrganizations();
            setOrganizations(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            toast.error('Failed to fetch organizations');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingOrg(null);
        setIsModalOpen(true);
    };

    const handleEdit = (org: Organization) => {
        setEditingOrg(org);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this organization?')) return;
        try {
            await organizationService.deleteOrganization(id);
            toast.success('Organization deleted successfully');
            fetchOrganizations();
        } catch (error) {
            toast.error('Failed to delete organization');
            console.error(error);
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (editingOrg) {
                await organizationService.updateOrganization(editingOrg.id, data);
                toast.success('Organization updated successfully');
            } else {
                await organizationService.createOrganization(data);
                toast.success('Organization created successfully');
            }
            fetchOrganizations();
        } catch (error) {
            toast.error(editingOrg ? 'Failed to update organization' : 'Failed to create organization');
            console.error(error);
            throw error;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-gray-600">Manage multi-tenant organizations</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Organization
                </button>
            </div>

            <div className="card">
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search organizations..."
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
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Name</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Subdomain</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Plan</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Stats</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Status</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Start Date</th>
                                    <th className="pb-3 px-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            No organizations found
                                        </td>
                                    </tr>
                                )}
                                {organizations.map((org) => (
                                    <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary-50 p-2 rounded-lg">
                                                    <Building2 className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{org.name}</div>
                                                    <div className="text-xs text-gray-500">{org.city}, {org.country}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                                {org.subdomain}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.subscription_plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-800' :
                                                org.subscription_plan === 'PREMIUM' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {org.subscription_plan}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-xs text-gray-500">
                                                <div>{org.total_schools || 0} Schools</div>
                                                <div>{org.total_students || 0} Students</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {org.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(org.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(org)}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(org.id)}
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

            <OrganizationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingOrg}
            />
        </div>
    );
}
