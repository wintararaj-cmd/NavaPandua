import React, { useState, useEffect } from 'react';
import { 
    Package, Boxes, ArrowRightLeft, ClipboardList, 
    Plus, Search, Filter, ArrowUpRight, ArrowDownLeft,
    AlertTriangle, CheckCircle2, MoreVertical,
    History, LayoutGrid, List
} from 'lucide-react';
import { inventoryService, type InventoryItem, type InventoryCategory, type InventoryIssue } from '../services/inventoryService';
import { teacherService } from '../services/teacherService';
import toast from 'react-hot-toast';


/* ─────────────────────────────────────────────────────────
   Dashboard Cards
 ───────────────────────────────────────────────────────── */
function StatCard({ title, value, sub, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">{sub}</p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Main Inventory Page
 ───────────────────────────────────────────────────────── */
export default function Inventory() {
    const [activeTab, setActiveTab] = useState<'items' | 'stock' | 'issues' | 'transactions'>('items');
    const [loading, setLoading] = useState(true);
    
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [issues, setIssues] = useState<InventoryIssue[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    
    const [searchQuery, setSearchQuery] = useState('');

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);



    useEffect(() => {

        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'items') {
                const [itemsData, catsData] = await Promise.all([
                    inventoryService.getItems({ search: searchQuery }),
                    inventoryService.getCategories()
                ]);
                setItems(itemsData.results || []);
                setCategories(catsData.results || []);
            } else if (activeTab === 'issues') {
                const data = await inventoryService.getIssues();
                setIssues(data.results || []);
            } else if (activeTab === 'transactions') {
                const data = await inventoryService.getTransactions();
                setTransactions(data.results || []);
            }
        } catch (error) {
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (issueId: number) => {
        try {
            await inventoryService.returnItem(issueId);
            toast.success('Item returned successfully');
            fetchData();
        } catch (error) {
            toast.error('Return failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory & Assets</h1>
                    <p className="text-sm font-bold text-gray-400 mt-1">Manage school resources, equipment, and stock levels.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl text-sm font-black hover:bg-gray-50 transition shadow-sm"
                    >
                        <LayoutGrid className="w-4 h-4" /> Categories
                    </button>
                    <button 
                        onClick={() => { setSelectedItem(null); setIsItemModalOpen(true); }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Add New Item
                    </button>
                </div>

            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Items" 
                    value={items.length} 
                    sub={`${categories.length} Categories`} 
                    icon={Package} 
                    color="bg-indigo-500" 
                />
                <StatCard 
                    title="Currently Issued" 
                    value={issues.filter(i => i.status === 'ISSUED').length} 
                    sub="Items with Staff/Rooms" 
                    icon={ArrowRightLeft} 
                    color="bg-amber-500" 
                />
                <StatCard 
                    title="Low Stock" 
                    value={items.filter(i => i.stock_quantity <= i.reorder_level).length} 
                    sub="Items need reorder" 
                    icon={AlertTriangle} 
                    color="bg-red-500" 
                />
                <StatCard 
                    title="Total Assets" 
                    value={items.filter(i => i.is_asset).length} 
                    sub="Fixed Assets tracked" 
                    icon={Boxes} 
                    color="bg-emerald-500" 
                />
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-2">
                <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1">
                    {[
                        { id: 'items', label: 'Item Directory', icon: LayoutGrid },
                        { id: 'issues', label: 'Issued Items', icon: ArrowRightLeft },
                        { id: 'transactions', label: 'Transactions', icon: ClipboardList }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all ${activeTab === t.id
                                ? 'bg-white text-indigo-600 shadow-xl'
                                : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <t.icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                {activeTab === 'items' && (
                    <table className="min-w-full divide-y divide-gray-50">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Info</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold">Loading records...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold">No items found.</td></tr>
                            ) : items.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                <Package className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{item.name}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">{item.item_code || 'No Code'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-tight">
                                            {item.category_name}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {item.is_asset ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Fixed Asset
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-[10px] font-black uppercase">Consumable</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-black ${item.stock_quantity <= item.reorder_level ? 'text-red-500' : 'text-gray-900'}`}>
                                                {item.stock_quantity} {item.unit}
                                            </p>
                                            {item.stock_quantity <= item.reorder_level && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setSelectedItem(item); setIsStockModalOpen(true); }}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="Add Stock"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedItem(item); setIsIssueModalOpen(true); }}
                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition" title="Issue Item"
                                            >
                                                <ArrowRightLeft className="w-5 h-5" />
                                            </button>


                                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'issues' && (
                    <table className="min-w-full divide-y divide-gray-50">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Issued To</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date / Due</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold">Loading issues...</td></tr>
                            ) : issues.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold">No active issues.</td></tr>
                            ) : issues.map(issue => (
                                <tr key={issue.id} className="hover:bg-gray-50/50 transition group">
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-black text-gray-900">{issue.item_name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Qty: {issue.quantity}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{issue.staff_name || issue.issued_to_room}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">{issue.staff_name ? 'Staff' : 'Room/Lab'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-bold text-gray-600">{issue.issue_date}</p>
                                        {issue.due_date && <p className="text-[10px] font-black text-red-400 uppercase mt-1 italic">Due: {issue.due_date}</p>}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                            issue.status === 'ISSUED' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                            'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {issue.status === 'ISSUED' && (
                                            <button 
                                                onClick={() => handleReturn(issue.id)}
                                                className="px-6 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-50"
                                            >
                                                Mark Returned
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'transactions' && (
                    <table className="min-w-full divide-y divide-gray-50">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Item / Detail</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold">Loading...</td></tr>
                            ) : transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-8 py-5 text-xs font-bold text-gray-500">
                                        {new Date(tx.transaction_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            {tx.quantity > 0 ? <ArrowDownLeft className="w-4 h-4 text-emerald-500" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{tx.transaction_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-black text-gray-900">{tx.item_name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase truncate max-w-xs">{tx.remarks}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-sm font-black ${tx.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-bold text-gray-500">
                                        {tx.performed_by_name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isItemModalOpen && (
                <AddItemModal 
                    categories={categories} 
                    onClose={() => setIsItemModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}

            {isStockModalOpen && selectedItem && (
                <AddStockModal 
                    item={selectedItem} 
                    onClose={() => setIsStockModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}

            {isIssueModalOpen && selectedItem && (
                <IssueModal 
                    item={selectedItem} 
                    onClose={() => setIsIssueModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}

            {isCategoryModalOpen && (
                <CategoryModal 
                    onClose={() => setIsCategoryModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}
        </div>
    );
}



/* ─────────────────────────────────────────────────────────
   AddItemModal
 ───────────────────────────────────────────────────────── */
function AddItemModal({ categories, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: '', category: '', item_code: '', unit: 'PCS', 
        reorder_level: 5, is_asset: true, description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await inventoryService.createItem(formData);
            toast.success('Item created');
            onSuccess();
            onClose();
        } catch { toast.error('Creation failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">New Inventory Item</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Name *</label>
                            <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category *</label>
                            <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option value="">Select Category</option>
                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Code</label>
                            <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={formData.item_code} onChange={e => setFormData({...formData, item_code: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unit</label>
                            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                                <option value="PCS">Pieces</option>
                                <option value="BOX">Box</option>
                                <option value="SET">Set</option>
                                <option value="KG">Kilogram</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reorder Level</label>
                            <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={formData.reorder_level} onChange={e => setFormData({...formData, reorder_level: parseInt(e.target.value)})} />
                        </div>
                        <div className="col-span-2 flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl">
                            <input type="checkbox" className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500" checked={formData.is_asset} onChange={e => setFormData({...formData, is_asset: e.target.checked})} />
                            <div>
                                <p className="text-sm font-black text-indigo-900">Track as Fixed Asset</p>
                                <p className="text-[10px] text-indigo-600 font-bold">Assets like computers or furniture are tracked individually.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-xl transition active:scale-95 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   AddStockModal
 ───────────────────────────────────────────────────────── */
function AddStockModal({ item, onClose, onSuccess }: any) {
    const [quantity, setQuantity] = useState(0);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await inventoryService.addStock(item.id, { quantity, remarks });
            toast.success('Stock added');
            onSuccess();
            onClose();
        } catch { toast.error('Update failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-indigo-600 text-white">
                    <h3 className="text-xl font-black tracking-tight">Add Stock</h3>
                    <p className="text-xs font-bold opacity-80 mt-1">{item.name}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity to Add</label>
                        <input required type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-black" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Remarks / Ref No</label>
                        <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none resize-none" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-xl transition active:scale-95 disabled:opacity-50">
                            {loading ? 'Updating...' : 'Add to Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   IssueModal
 ───────────────────────────────────────────────────────── */
function IssueModal({ item, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        item: item.id,
        issued_to_staff: '',
        issued_to_room: '',
        quantity: 1,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        remarks: ''
    });
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        teacherService.getAll().then(res => setStaff(res.results || []));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.issued_to_staff && !formData.issued_to_room) {
            toast.error('Please specify who/where to issue');
            return;
        }
        try {
            setLoading(true);
            await inventoryService.issueItem(formData as any);
            toast.success('Item issued successfully');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.[0] || 'Issue failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-amber-500 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Issue Item</h3>
                        <p className="text-xs font-bold opacity-80 mt-1">{item.name}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:opacity-70 transition">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue To (Choose One)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <select 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                    value={formData.issued_to_staff}
                                    onChange={e => setFormData({...formData, issued_to_staff: e.target.value, issued_to_room: ''})}
                                >
                                    <option value="">Select Staff</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.user.first_name} {s.user.last_name}</option>)}
                                </select>
                                <input 
                                    placeholder="OR Room/Lab Name"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                    value={formData.issued_to_room}
                                    onChange={e => setFormData({...formData, issued_to_room: e.target.value, issued_to_staff: ''})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                            <input required type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Date</label>
                            <input required type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={formData.issue_date} onChange={e => setFormData({...formData, issue_date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Due Date (Optional)</label>
                            <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Remarks</label>
                            <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none resize-none" rows={2} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-[2] py-4 bg-amber-500 text-white text-sm font-black rounded-2xl hover:bg-amber-600 shadow-xl transition active:scale-95 disabled:opacity-50">
                            {loading ? 'Processing...' : 'Confirm Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}




/* ─────────────────────────────────────────────────────────
   CategoryModal
 ───────────────────────────────────────────────────────── */
function CategoryModal({ onClose, onSuccess }: any) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await inventoryService.createCategory({ name, description });
            toast.success('Category created');
            onSuccess();
            onClose();
        } catch { toast.error('Creation failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Manage Categories</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                        <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none resize-none" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-xl transition active:scale-95 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
