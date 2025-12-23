import React, { useState, useMemo } from 'react';
import { Book, BookStatus, Chapter } from '../types';
import { getNextInterval, SPACED_REPETITION_TABLE } from '../constants';
import { ArrowLeft, CheckCircle, Circle, Play, Calendar, Trophy, Lock, Save, BookOpen } from 'lucide-react';

interface BookDetailProps {
  book: Book;
  onUpdate: (updatedBook: Book) => void;
  onBack: () => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({ book, onUpdate, onBack }) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const [pageInput, setPageInput] = useState(book.currentPage.toString());

  // Check if book is currently in a waiting period (Spaced Repetition Lock)
  const lockoutState = useMemo(() => {
    if (book.status !== BookStatus.READ) return { isLocked: false, nextDate: null };

    const lastRead = book.readings[book.readings.length - 1];
    if (!lastRead || !lastRead.endDate) return { isLocked: false, nextDate: null };

    const daysInterval = getNextInterval(book.pageCount, book.currentReadCount);
    const endDate = new Date(lastRead.endDate);
    const nextDate = new Date(endDate);
    nextDate.setDate(endDate.getDate() + daysInterval);
    nextDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
        isLocked: today < nextDate,
        nextDate: nextDate
    };
  }, [book]);

  const toggleChapter = (chapterId: string) => {
    // Chapters are just a checklist now, independent of page progress
    const updatedChapters = book.chapters.map(c => 
      c.id === chapterId ? { ...c, isCompleted: !c.isCompleted } : c
    );
    onUpdate({ ...book, chapters: updatedChapters });
  };

  const handlePageUpdate = () => {
      let newPage = parseInt(pageInput);
      if (isNaN(newPage)) return;
      if (newPage < 0) newPage = 0;
      if (newPage > book.pageCount) newPage = book.pageCount;

      const isFinished = newPage === book.pageCount;

      onUpdate({
          ...book,
          currentPage: newPage,
          // If user manually sets to max pages, we don't auto-finish, 
          // we let them click the finish button to be explicit, unless it's just a correction.
      });
  };

  const startReading = () => {
    // When starting a NEW read cycle, reset pages to 0
    onUpdate({
      ...book,
      status: BookStatus.READING,
      readings: [...book.readings, {
          readCount: book.currentReadCount + 1,
          startDate: new Date().toISOString(),
          endDate: null,
          dueDate: null
      }],
      currentReadCount: book.currentReadCount + 1,
      currentPage: 0, // Reset progress for the new read
      chapters: book.chapters.map(c => ({...c, isCompleted: false})) // Reset checklist
    });
    setPageInput("0");
  };

  const finishCurrentReading = () => {
    const now = new Date();
    const currentLogIndex = book.readings.findIndex(r => r.readCount === book.currentReadCount);
    
    if (currentLogIndex === -1) return;

    const newReadings = [...book.readings];
    newReadings[currentLogIndex].endDate = now.toISOString();

    // If it was the 7th reading, master it
    const newStatus = book.currentReadCount >= 7 ? BookStatus.MASTERED : BookStatus.READ;

    onUpdate({
      ...book,
      status: newStatus,
      readings: newReadings,
      currentPage: book.pageCount // Ensure it's marked as full
    });
  };

  const progress = Math.round((book.currentPage / book.pageCount) * 100) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft size={20} className="mr-2" /> Voltar para Biblioteca
      </button>

      {/* Main Book Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Lock Overlay if in Spaced Repetition Wait Time */}
        {lockoutState.isLocked && (
            <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center">
                <Lock size={64} className="mb-4 text-blue-400" />
                <h2 className="text-3xl font-bold mb-2">Em Intervalo de Consolidação</h2>
                <p className="text-lg text-slate-300 max-w-md">
                    O método de leitura espaçada exige uma pausa para fixação do conteúdo.
                </p>
                <div className="mt-6 bg-white/10 px-6 py-3 rounded-lg border border-white/20">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Próxima Leitura Disponível em</p>
                    <p className="text-2xl font-bold text-blue-300">
                        {lockoutState.nextDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <button 
                    onClick={() => setShowTimeline(!showTimeline)} 
                    className="mt-8 text-sm text-slate-400 hover:text-white underline"
                >
                    Ver tabela de espaçamento
                </button>
            </div>
        )}

        <div className="md:w-1/3 bg-slate-100 p-6 flex flex-col items-center justify-start border-r border-slate-200">
           <div className="relative shadow-xl rounded-lg overflow-hidden group">
                {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-48 h-72 object-cover" />
                ) : (
                    <div className="w-48 h-72 bg-slate-300 flex items-center justify-center text-slate-500">Sem Capa</div>
                )}
           </div>
           
           <div className="mt-6 w-full space-y-4">
             <div>
                <div className="flex justify-between text-sm mb-1 text-slate-600">
                    <span>Progresso Real</span>
                    <span className="font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-center text-xs text-slate-500 mt-1">{book.currentPage} / {book.pageCount} páginas</p>
             </div>

             {/* Manual Page Update Control */}
             {!lockoutState.isLocked && book.status !== BookStatus.MASTERED && (
                 <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Atualizar Página</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-center font-mono font-bold text-slate-700"
                        />
                        <button 
                            onClick={handlePageUpdate}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                            title="Salvar progresso"
                        >
                            <Save size={18} />
                        </button>
                    </div>
                 </div>
             )}
           </div>
        </div>

        <div className="md:w-2/3 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${book.status === BookStatus.MASTERED ? 'bg-yellow-100 text-yellow-700' : book.status === BookStatus.READING ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {book.status}
                </span>
                <h1 className="text-3xl font-bold text-slate-900 mt-2 leading-tight">{book.title}</h1>
                <p className="text-lg text-slate-600 font-medium">{book.author}</p>
                {book.publisher && <p className="text-sm text-slate-400 mt-1">{book.publisher} • {book.categories.join(', ')}</p>}
             </div>
             {book.currentReadCount >= 7 && <Trophy size={40} className="text-yellow-500 drop-shadow-sm" />}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
             {/* Cycle Info */}
             <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                <Calendar className="text-blue-600 mt-1" size={20}/> 
                <div>
                    <h3 className="font-bold text-blue-900">
                        Ciclo de Leitura Espaçada
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Você está na leitura <strong>{book.currentReadCount + (book.status === BookStatus.READING ? 0 : 1)}º</strong> de 7.
                    </p>
                </div>
             </div>

             {/* Chapter Checklist */}
             <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="font-bold text-slate-700 mb-2 pb-2 border-b flex justify-between items-center">
                    <span>Checklist de Capítulos</span>
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded">Não afeta contagem de páginas</span>
                </h3>
                <ul className="space-y-1 overflow-y-auto pr-2 flex-1 max-h-[250px] custom-scrollbar">
                    {book.chapters.length > 0 ? book.chapters.map((chapter) => (
                        <li 
                            key={chapter.id} 
                            onClick={() => !lockoutState.isLocked && toggleChapter(chapter.id)}
                            className={`flex items-center gap-3 p-2 rounded transition ${
                                lockoutState.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                            }`}
                        >
                            {chapter.isCompleted ? <CheckCircle className="text-green-500 shrink-0" size={20} /> : <Circle className="text-slate-300 shrink-0" size={20} />}
                            <span className={`text-sm ${chapter.isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}>{chapter.title}</span>
                        </li>
                    )) : (
                        <li className="text-slate-400 text-sm italic py-4 text-center">Nenhum capítulo cadastrado.</li>
                    )}
                </ul>
             </div>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-between items-center">
             
             {/* Action Buttons */}
             {book.status === BookStatus.READING ? (
                 <button 
                    onClick={finishCurrentReading} 
                    className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold shadow-md hover:shadow-lg transition ${book.currentPage < book.pageCount ? 'opacity-70' : ''}`}
                 >
                     <CheckCircle size={20} /> 
                     {book.currentPage < book.pageCount ? 'Forçar Conclusão' : 'Concluir Leitura'}
                 </button>
             ) : book.status === BookStatus.MASTERED ? (
                 <div className="flex items-center gap-2 text-yellow-600 font-bold bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                    <Trophy size={20}/> Obra Dominada!
                 </div>
             ) : (
                // UNREAD or READ (Waiting for next slot)
                <button 
                    onClick={startReading} 
                    disabled={lockoutState.isLocked}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold shadow-md transition"
                >
                     <BookOpen size={20} /> 
                     {book.currentReadCount > 0 ? `Iniciar ${book.currentReadCount + 1}ª Leitura` : 'Iniciar Leitura'}
                 </button>
             )}
             
             <button onClick={() => setShowTimeline(!showTimeline)} className="text-blue-600 hover:underline text-sm font-medium">
                 Ver regras de espaçamento
             </button>
          </div>
        </div>
      </div>

      {showTimeline && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-slide-down">
              <h3 className="font-bold mb-4 text-slate-800">Linha do Tempo de Repetição Espaçada ({book.pageCount} pág.)</h3>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                 {[1,2,3,4,5,6,7].map(num => {
                     const range = SPACED_REPETITION_TABLE.find(r => book.pageCount >= r.min && book.pageCount <= r.max);
                     const days = num === 1 ? 1 : (range ? range.intervals[num-2] : 0);
                     const isDone = book.currentReadCount >= num;
                     const isNext = book.currentReadCount === num - 1;
                     
                     return (
                         <div key={num} className={`p-3 rounded-lg border flex flex-col justify-center items-center h-24 transition-all ${
                             isDone ? 'bg-green-100 border-green-300 text-green-800' : 
                             isNext ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200 scale-105 shadow-md' : 
                             'bg-slate-50 border-slate-200 opacity-60'
                         }`}>
                             <div className="font-bold text-lg mb-1">{num}ª</div>
                             <div className="text-xs uppercase font-semibold">{num === 1 ? 'Imediato' : `${days} Dias`}</div>
                             {isDone && <CheckCircle size={14} className="mt-1" />}
                         </div>
                     )
                 })}
              </div>
          </div>
      )}
    </div>
  );
};