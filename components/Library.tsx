import React, { useState } from 'react';
import { Book, BookStatus } from '../types';
import { Search, Filter, Book as BookIcon } from 'lucide-react';
import { PLACEHOLDER_COVER } from '../constants';

interface LibraryProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  categories: string[];
}

export const Library: React.FC<LibraryProps> = ({ books, onBookClick, categories }) => {
  const [filter, setFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredBooks = books.filter(book => {
    const matchesStatus = filter === 'ALL' || 
      (filter === 'FAVORITES' ? book.isFavorite : book.status === filter);
    const matchesCategory = categoryFilter === 'ALL' || book.categories.includes(categoryFilter);
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                          book.author.toLowerCase().includes(search.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título ou autor..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
           <select className="px-3 py-2 bg-slate-50 border rounded-lg text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
               <option value="ALL">Todos os Status</option>
               <option value={BookStatus.READING}>Lendo</option>
               <option value={BookStatus.UNREAD}>Não Lidos</option>
               <option value={BookStatus.READ}>Lidos</option>
               <option value={BookStatus.MASTERED}>Dominados</option>
               <option value="FAVORITES">Favoritos</option>
           </select>

           <select className="px-3 py-2 bg-slate-50 border rounded-lg text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
               <option value="ALL">Todas Categorias</option>
               {categories.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredBooks.map(book => (
           <div 
             key={book.id} 
             onClick={() => onBookClick(book)}
             className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-slate-200 overflow-hidden flex flex-col group"
           >
             <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
                <img 
                  src={book.coverUrl || PLACEHOLDER_COVER} 
                  alt={book.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        book.status === BookStatus.READING ? 'bg-blue-500 text-white' : 
                        book.status === BookStatus.MASTERED ? 'bg-yellow-500 text-white' : 
                        'bg-slate-800/70 text-white backdrop-blur-sm'
                    }`}>
                        {book.status}
                    </span>
                </div>
             </div>
             <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{book.title}</h3>
                <p className="text-sm text-slate-500 mb-2">{book.author}</p>
                
                <div className="mt-auto">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{book.currentPage}/{book.pageCount} pág</span>
                        <span>{Math.round((book.currentPage/book.pageCount)*100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                           className={`h-1.5 rounded-full ${book.status === BookStatus.MASTERED ? 'bg-yellow-500' : 'bg-blue-500'}`} 
                           style={{ width: `${(book.currentPage/book.pageCount)*100}%` }}
                        ></div>
                    </div>
                </div>
             </div>
           </div>
        ))}
        
        {filteredBooks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <BookIcon size={48} className="mb-4 opacity-50" />
                <p>Nenhum livro encontrado com os filtros atuais.</p>
            </div>
        )}
      </div>
    </div>
  );
};