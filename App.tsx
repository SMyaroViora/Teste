import React, { useState, useEffect } from 'react';
import { AppState, Book, ViewMode } from './types';
import { loadState, saveState } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { BookForm } from './components/BookForm';
import { BookDetail } from './components/BookDetail';
import { Layout, LayoutDashboard, Library as LibraryIcon, PlusCircle, Settings } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(loadState());
  const [view, setView] = useState<ViewMode>('DASHBOARD');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleAddBook = (newBook: Book) => {
    // Add new categories if any
    const uniqueCategories = Array.from(new Set([...state.categories, ...newBook.categories]));
    
    setState(prev => ({
      ...prev,
      books: [...prev.books, newBook],
      categories: uniqueCategories
    }));
    setView('LIBRARY');
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setState(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === updatedBook.id ? updatedBook : b)
    }));
  };

  const handleBookClick = (book: Book) => {
    setSelectedBookId(book.id);
    setView('BOOK_DETAIL');
  };

  const renderContent = () => {
    switch (view) {
      case 'DASHBOARD':
        return <Dashboard books={state.books} />;
      case 'LIBRARY':
        return <Library books={state.books} onBookClick={handleBookClick} categories={state.categories} />;
      case 'ADD_BOOK':
        return <BookForm onSave={handleAddBook} onCancel={() => setView('LIBRARY')} allCategories={state.categories} />;
      case 'BOOK_DETAIL':
        const book = state.books.find(b => b.id === selectedBookId);
        if (!book) return <div>Livro não encontrado</div>;
        return <BookDetail book={book} onUpdate={handleUpdateBook} onBack={() => setView('LIBRARY')} />;
      default:
        return <Dashboard books={state.books} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Layout className="text-blue-400" />
            Leitura Espaçada
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'DASHBOARD' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setView('LIBRARY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'LIBRARY' || view === 'BOOK_DETAIL' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <LibraryIcon size={20} /> Biblioteca
          </button>
          <button 
             onClick={() => setView('ADD_BOOK')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'ADD_BOOK' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <PlusCircle size={20} /> Adicionar Livro
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 text-sm text-slate-400 text-center">
            v1.0.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex justify-between items-center sticky top-0 z-10">
           <h1 className="font-bold text-lg">Leitura Espaçada</h1>
           <div className="flex gap-2">
               <button onClick={() => setView('DASHBOARD')} className="p-2"><LayoutDashboard/></button>
               <button onClick={() => setView('LIBRARY')} className="p-2"><LibraryIcon/></button>
               <button onClick={() => setView('ADD_BOOK')} className="p-2"><PlusCircle/></button>
           </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}