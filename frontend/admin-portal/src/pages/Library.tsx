import { useState, useEffect } from 'react';
import { Book, Search, Plus, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import { libraryService } from '../services/academicServices';
import toast from 'react-hot-toast';

export default function Library() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchBooks();
    }, [search]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await libraryService.getBooks({ search });
            setBooks(response.results || response);
        } catch (error) {
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
                    <p className="text-gray-600 mt-1">Manage books and student borrowings</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary flex items-center gap-2">
                        View Borrowings
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add New Book
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, author, category or ISBN..."
                            className="input pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <div key={book.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${book.available_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {book.available_quantity > 0 ? 'Available' : 'Out of Stock'}
                                </span>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                    <Book className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                                    <p className="text-sm text-gray-600">{book.author}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{book.category}</span>
                                        <span className="text-[11px] text-gray-400">ISBN: {book.isbn || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400">Location</p>
                                    <p className="text-sm font-medium text-gray-700">{book.location || 'Not Specified'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Copies</p>
                                    <p className="text-sm font-bold text-primary-600">{book.available_quantity} / {book.quantity}</p>
                                </div>
                            </div>

                            <button className="w-full mt-4 btn btn-secondary text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                Issue Book
                            </button>
                        </div>
                    ))}

                    {books.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center text-gray-500 italic">
                            No books found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
