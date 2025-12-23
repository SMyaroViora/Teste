import React, { useMemo } from 'react';
import { Book, BookStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, CheckCircle, TrendingUp, Award } from 'lucide-react';

interface DashboardProps {
  books: Book[];
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ books }) => {
  
  const stats = useMemo(() => {
    const totalPagesRead = books.reduce((acc, book) => {
        if (book.status === BookStatus.READ || book.status === BookStatus.MASTERED) {
            return acc + book.pageCount;
        }
        return acc + book.currentPage;
    }, 0);

    const booksRead = books.filter(b => b.status === BookStatus.READ || b.status === BookStatus.MASTERED).length;
    const booksMastered = books.filter(b => b.status === BookStatus.MASTERED).length;
    
    // Category Data
    const categoryCounts: Record<string, number> = {};
    books.forEach(b => {
        if(b.status !== BookStatus.UNREAD) {
            b.categories.forEach(c => {
                categoryCounts[c] = (categoryCounts[c] || 0) + 1;
            });
        }
    });
    const categoryData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Monthly Reading Data (Mocked but structured for curve)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    // In a real app we would parse book.readings[].endDate or daily logs.
    // For now, generating a cumulative curve effect for demonstration.
    let cumulative = 0;
    const monthlyData = months.map(m => {
        cumulative += Math.floor(Math.random() * 100); 
        return { name: m, pages: cumulative };
    });

    return { totalPagesRead, booksRead, booksMastered, categoryData, monthlyData };
  }, [books]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard de Leitura</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Páginas Lidas (Total)</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalPagesRead}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Livros Lidos</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.booksRead}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Livros Dominados</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.booksMastered}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Categoria Top</p>
            <h3 className="text-lg font-bold text-slate-800 truncate max-w-[120px]">
                {stats.categoryData[0]?.name || '-'}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Curva de Evolução da Leitura</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthlyData}>
              <defs>
                <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ stroke: '#0ea5e9', strokeWidth: 1 }} contentStyle={{borderRadius: '8px'}} />
              <Area type="monotone" dataKey="pages" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPages)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Categorias Mais Lidas</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};