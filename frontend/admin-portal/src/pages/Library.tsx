
import { useState, useEffect } from 'react';
import { 
    Book as BookIcon, Search, Plus, ArrowUpRight, CheckCircle, 
    Clock, BookOpen, User, Calendar, Trash2, X, Filter, BarChart2,
    Hash, Tag, MapPin, Layers
} from 'lucide-react';
import { libraryService } from '../services/academicServices';
import { studentService } from '../services/studentService';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────
   Borrowings History Table component
───────────────────────────────────────────────────────── */
function BorrowingsTable({ onReturn }: { onReturn: () => void }) {
    const [borrowings, setBorrowings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchBorrowings(); }, []);

    const fetchBorrowings = async () => {
        try {
            setLoading(true);
            const response = await libraryService.getBorrowings();
            setBorrowings(response.results || response);
        } catch { toast.error('Failed to load borrowings'); }
        finally { setLoading(false); }
    };

    const handleReturn = async (id: string) => {
        try {
            await libraryService.returnBook(id);
            toast.success('Book returned successfully');
            fetchBorrowings();
            onReturn();
        } catch { toast.error('Failed to return book'); }
    };

    if (loading) return <div className="py-10 text-center text-gray-500">Loading borrowings...</div>;

    return (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {['Book', 'Borrower', 'Issued Date', 'Due Date', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {borrowings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{b.book_name || 'Unknown Book'}</div>
                                <div className="text-xs text-gray-400">ID: {b.book}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">
                                        {b.borrower_name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{b.borrower_name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.issue_date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.due_date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    b.status === 'RETURNED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    b.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' : 
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {b.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {b.status === 'ISSUED' && (
                                    <button 
                                        onClick={() => handleReturn(b.id)}
                                        className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100 transition"
                                    >
                                        Return
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {borrowings.length === 0 && (
                        <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">No borrowings found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Book Modal
───────────────────────────────────────────────────────── */
function BookModal({ isOpen, onClose, onSuccess, book }: any) {
    const [form, setForm] = useState({
        title: '', author: '', isbn: '', category: '', publisher: '', 
        quantity: 1, location: ''
    });

    useEffect(() => {
        if (book) setForm(book);
        else setForm({ title: '', author: '', isbn: '', category: '', publisher: '', quantity: 1, location: '' });
    }, [book, isOpen]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (book) await libraryService.updateBook(book.id, form);
            else await libraryService.createBook(form);
            toast.success(book ? 'Book updated' : 'Book added');
            onSuccess();
            onClose();
        } catch { toast.error('Check your inputs'); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">{book ? 'Edit Book' : 'Add New Book'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                            <input required type="text" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Author</label>
                            <input required type="text" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">ISBN</label>
                            <input type="text" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <input type="text" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Publisher</label>
                            <input type="text" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                            <input required type="number" min="1" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Location (Shelf)</label>
                            <input type="text" className="w-full mt-1 px-3 py-2 border rounded-lg" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                        </div>
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition">
                        {book ? 'Update' : 'Add Book'}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Issue Book Modal
───────────────────────────────────────────────────────── */
function IssueBookModal({ isOpen, onClose, onSuccess, book }: any) {
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            studentService.getStudents().then(res => setStudents(res.results || []));
            const defaultDue = new Date();
            defaultDue.setDate(defaultDue.getDate() + 14);
            setDueDate(defaultDue.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await libraryService.issueBook({ book: book.id, borrower: selectedStudent, due_date: dueDate });
            toast.success('Book issued!');
            onSuccess();
            onClose();
        } catch { toast.error('Failed to issue book'); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Issue Book</h3>
                    <p className="text-sm text-gray-500 mt-1">{book?.title}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Select Student</label>
                        <select required className="w-full mt-1 px-3 py-2 border rounded-lg" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                            <option value="">Select a student...</option>
                            {students.map(s => <option key={s.id} value={s.user.id}>{s.user.first_name} {s.user.last_name} ({s.roll_number})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
                        <input required type="date" className="w-full mt-1 px-3 py-2 border rounded-lg" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition">
                        Confirm Issue
                    </button>
                    <button type="button" onClick={onClose} className="w-full text-gray-500 py-1 hover:underline text-sm">Cancel</button>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Main Library Page
───────────────────────────────────────────────────────── */
export default function Library() {
    const [view, setView] = useState<'books' | 'borrowings'>('books');
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

    useEffect(() => {
        if (view === 'books') fetchBooks();
    }, [search, view]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await libraryService.getBooks({ search });
            setBooks(response.results || response);
        } catch { toast.error('Failed to load books'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this book?')) {
            try {
                await libraryService.deleteBook(id);
                toast.success('Book deleted');
                fetchBooks();
            } catch { toast.error('Failed to delete'); }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
                    <p className="text-gray-600 mt-1">Catalog and circulation tracking</p>
                </div>
                <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 gap-1">
                    <button onClick={() => setView('books')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'books' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                        Books
                    </button>
                    <button onClick={() => setView('borrowings')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'borrowings' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                        Borrowings
                    </button>
                </div>
            </div>

            {view === 'books' ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" placeholder="Title, Author, ISBN..." className="w-full pl-10 pr-4 py-2 text-sm border-gray-200 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={search} onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button onClick={() => { setSelectedBook(null); setIsBookModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-sm transition">
                            <Plus className="w-4 h-4" /> Add Book
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map(book => (
                            <div key={book.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
                                <div className={`h-1.5 w-full ${book.available_quantity > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-14 bg-gray-50 rounded flex items-center justify-center text-gray-300 border border-gray-100">
                                            <BookIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedBook(book); setIsBookModalOpen(true); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><ArrowUpRight className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(book.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-4">{book.author}</p>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Tag className="w-3 h-3" /> {book.category}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" /> Shelf: {book.location || '—'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="text-[10px] uppercase font-black text-gray-400">Inventory</div>
                                    <div className="text-sm font-black text-indigo-600">{book.available_quantity} / {book.quantity}</div>
                                </div>
                                <div className="p-2 bg-white">
                                    <button 
                                        disabled={book.available_quantity <= 0}
                                        onClick={() => { setSelectedBook(book); setIsIssueModalOpen(true); }}
                                        className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        ISSUE BOOK
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Borrowing History</h2>
                    </div>
                    <BorrowingsTable onReturn={fetchBooks} />
                </div>
            )}

            <BookModal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} onSuccess={fetchBooks} book={selectedBook} />
            <IssueBookModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} onSuccess={fetchBooks} book={selectedBook} />
        </div>
    );
}
