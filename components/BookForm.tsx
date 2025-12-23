import React, { useState } from 'react';
import { Book, BookStatus, Chapter } from '../types';
import { fetchBookDetails } from '../services/geminiService';
import { Wand2, Loader2, Upload, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface BookFormProps {
  onSave: (book: Book) => void;
  onCancel: () => void;
  allCategories: string[];
}

export const BookForm: React.FC<BookFormProps> = ({ onSave, onCancel, allCategories }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    subtitle: '',
    author: '',
    pageCount: 0,
    categories: [],
    chapters: [],
    status: BookStatus.UNREAD,
    currentPage: 0,
    currentReadCount: 0,
    readings: [],
    isFavorite: false
  });
  const [newChapter, setNewChapter] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleGeminiFetch = async () => {
    if (!formData.title) return;
    setLoading(true);
    try {
      const details = await fetchBookDetails(formData.title);
      setFormData(prev => ({
        ...prev,
        ...details,
        // Convert API chapters string[] to Chapter objects
        chapters: details.chapters ? details.chapters.map((t: string) => ({ id: uuidv4(), title: t, isCompleted: false })) : []
      }));
    } catch (e) {
      alert("Erro ao buscar detalhes. Tente novamente ou preencha manualmente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.pageCount) {
        alert("Título e número de páginas são obrigatórios.");
        return;
    }

    const book: Book = {
      id: uuidv4(),
      title: formData.title || 'Sem título',
      subtitle: formData.subtitle,
      author: formData.author || 'Desconhecido',
      pageCount: Number(formData.pageCount),
      status: formData.status || BookStatus.UNREAD,
      categories: formData.categories || [],
      chapters: formData.chapters || [],
      currentPage: 0,
      currentReadCount: 0,
      readings: [],
      isFavorite: false,
      addedAt: new Date().toISOString(),
      publisher: formData.publisher,
      isbn: formData.isbn,
      // Create a fake object URL for demo if file uploaded
      coverUrl: coverFile ? URL.createObjectURL(coverFile) : (formData.coverUrl || undefined)
    };
    onSave(book);
  };

  const addChapter = () => {
    if (newChapter.trim()) {
      setFormData(prev => ({
        ...prev,
        chapters: [...(prev.chapters || []), { id: uuidv4(), title: newChapter, isCompleted: false }]
      }));
      setNewChapter('');
    }
  };

  const toggleCategory = (cat: string) => {
    const current = formData.categories || [];
    if (current.includes(cat)) {
        setFormData({...formData, categories: current.filter(c => c !== cat)});
    } else {
        setFormData({...formData, categories: [...current, cat]});
    }
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      const cat = newCategory.trim();
      const current = formData.categories || [];
      if (!current.includes(cat)) {
          setFormData(prev => ({ ...prev, categories: [...current, cat] }));
      }
      setNewCategory('');
    }
  };

  // Combine known categories with any custom ones added to the form
  const displayCategories = Array.from(new Set([...allCategories, ...(formData.categories || [])]));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Adicionar Novo Livro</h2>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Digite o título para preenchimento automático..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
        <button
          onClick={handleGeminiFetch}
          disabled={loading || !formData.title}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          IA Mágica
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input required type="text" className="w-full border rounded-lg p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Autor</label>
            <input required type="text" className="w-full border rounded-lg p-2" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Páginas</label>
             <input required type="number" className="w-full border rounded-lg p-2" value={formData.pageCount || ''} onChange={e => setFormData({...formData, pageCount: parseInt(e.target.value)})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Editora</label>
             <input type="text" className="w-full border rounded-lg p-2" value={formData.publisher || ''} onChange={e => setFormData({...formData, publisher: e.target.value})} />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Capa do Livro</label>
            <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-slate-700 transition">
                    <Upload size={18} />
                    Escolher Imagem
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                {coverFile && <span className="text-sm text-green-600">{coverFile.name} selected</span>}
                {formData.coverUrl && !coverFile && <span className="text-sm text-blue-600">URL Detected</span>}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categorias</label>
            <div className="flex flex-wrap gap-2 mb-3">
                {displayCategories.map(cat => (
                    <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition ${formData.categories?.includes(cat) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Adicionar nova categoria..." 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                />
                <button type="button" onClick={addCategory} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition" title="Adicionar Categoria"><Plus size={18} /></button>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Capítulos</label>
            <div className="flex gap-2 mb-2">
                <input type="text" className="flex-1 border rounded-lg p-2 text-sm" placeholder="Nome do capítulo" value={newChapter} onChange={e => setNewChapter(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChapter())} />
                <button type="button" onClick={addChapter} className="p-2 bg-slate-800 text-white rounded-lg"><Plus size={18} /></button>
            </div>
            <ul className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                {formData.chapters?.map((ch, idx) => (
                    <li key={ch.id} className="p-2 text-sm flex justify-between items-center bg-slate-50">
                        <span>{idx + 1}. {ch.title}</span>
                        <button type="button" onClick={() => setFormData({...formData, chapters: formData.chapters?.filter(c => c.id !== ch.id)})} className="text-red-500"><X size={14}/></button>
                    </li>
                ))}
            </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Salvar Livro</button>
        </div>
      </form>
    </div>
  );
};