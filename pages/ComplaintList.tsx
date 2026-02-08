
import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, Priority, Sentiment } from '../types';
import { Filter, Search, AlertTriangle, Calendar, Zap, Frown, Smile, Meh, ArrowRight, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_USERS } from '../services/mockService';

interface ComplaintListProps {
  complaints: Complaint[];
  onSelect: (id: string) => void;
  isAdmin: boolean;
  isDarkMode: boolean;
}

const ITEMS_PER_PAGE = 10;

const ComplaintList: React.FC<ComplaintListProps> = ({ complaints, onSelect, isAdmin, isDarkMode }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSentiment, setFilterSentiment] = useState<string>('ALL');
  const [filterStaff, setFilterStaff] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = complaints.filter(c => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSentiment = filterSentiment === 'ALL' || c.sentiment === filterSentiment;
    const matchesStaff = filterStaff === 'ALL' || c.assignedTo === filterStaff;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch && matchesSentiment && matchesStaff;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterSentiment, filterStaff, searchTerm]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const cardClass = isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800';
  const inputClass = isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700';

  const getPriorityStyles = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-red-50 text-red-700 border-red-200';
      case Priority.HIGH: return 'bg-orange-50 text-orange-700 border-orange-200';
      case Priority.MEDIUM: return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSentimentIcon = (s: Sentiment) => {
    switch(s) {
      case Sentiment.ANGRY: return <Zap size={18} className="text-red-500 fill-red-500/20" />;
      case Sentiment.FRUSTRATED: return <Frown size={18} className="text-orange-500" />;
      case Sentiment.SATISFIED: return <Smile size={18} className="text-green-500" />;
      default: return <Meh size={18} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
      switch(status) {
          case ComplaintStatus.RESOLVED: return 'bg-emerald-500';
          case ComplaintStatus.NEW: return 'bg-blue-500';
          case ComplaintStatus.IN_PROGRESS: return 'bg-amber-500';
          case ComplaintStatus.CLOSED: return 'bg-slate-500';
          default: return 'bg-indigo-500';
      }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className={`flex flex-col xl:flex-row justify-between gap-4 p-4 rounded-2xl shadow-sm border sticky top-0 z-10 backdrop-blur-xl ${isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200/60'}`}>
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by ID or Subject..." 
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm ${inputClass}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center border rounded-xl px-3 py-2 ${inputClass}`}>
            <Filter size={16} className="text-slate-400 mr-2" />
            <select 
                className="bg-transparent text-sm focus:outline-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="ALL">All Status</option>
                {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          
          <div className={`flex items-center border rounded-xl px-3 py-2 ${inputClass}`}>
            <Smile size={16} className="text-slate-400 mr-2" />
            <select 
                className="bg-transparent text-sm focus:outline-none cursor-pointer"
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
            >
                <option value="ALL">All Sentiment</option>
                {Object.values(Sentiment).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {isAdmin && (
            <div className={`flex items-center border rounded-xl px-3 py-2 ${inputClass}`}>
                <User size={16} className="text-slate-400 mr-2" />
                <select 
                    className="bg-transparent text-sm focus:outline-none cursor-pointer max-w-[150px]"
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                >
                    <option value="ALL">All Staff</option>
                    {MOCK_USERS.filter(u => u.role === 'STAFF').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {paginatedComplaints.map(complaint => (
          <div 
            key={complaint.id}
            onClick={() => onSelect(complaint.id)}
            className={`group p-0 rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden ${cardClass} ${isDarkMode ? 'hover:border-blue-500' : 'hover:border-blue-300'}`}
          >
            {/* Left Status Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(complaint.status)}`}></div>

            <div className="p-6 pl-8">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <span className={`font-mono text-xs font-bold px-2 py-1 rounded-md border ${isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{complaint.id}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border ring-1 ring-inset ${getPriorityStyles(complaint.priority)}`}>
                            {complaint.priority}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={14} />
                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                     <h3 className={`text-lg font-bold group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{complaint.title}</h3>
                     <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                </div>
                
                <p className={`text-sm line-clamp-2 mb-5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{complaint.description}</p>

                <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center text-xs text-slate-500">
                             <span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span>
                             {complaint.category}
                        </div>
                        <div className="flex items-center gap-2" title={`Sentiment: ${complaint.sentiment}`}>
                             {getSentimentIcon(complaint.sentiment)}
                             <span className="text-xs font-medium text-slate-500 capitalize">{complaint.sentiment.toLowerCase()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         {new Date(complaint.slaDeadline) < new Date() && complaint.status !== ComplaintStatus.RESOLVED && (
                            <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
                                <AlertTriangle size={14} className="mr-1" /> Overdue
                            </div>
                         )}
                         <div className={`flex items-center text-xs font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(complaint.status)}`}></span>
                            {complaint.status.replace('_', ' ')}
                         </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className={`text-center py-20 rounded-2xl border border-dashed ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <Search size={24} className="text-slate-400" />
            </div>
            <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No complaints found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {filtered.length > 0 && (
          <div className={`flex flex-col sm:flex-row justify-between items-center pt-4 border-t ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
             <div className="text-sm mb-4 sm:mb-0">
                Showing <span className="font-bold">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-bold">{filtered.length}</span> results
             </div>
             <div className="flex space-x-2">
                <button
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={currentPage === 1}
                   className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors ${isDarkMode 
                      ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                >
                   <ChevronLeft size={16} className="mr-1" /> Previous
                </button>
                <div className="flex items-center space-x-1 px-2">
                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Simplified logic to show first few pages
                      // In a real app, complex logic for ... ellipses would be here
                      const p = i + 1;
                      return (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                currentPage === p 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                                : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {p}
                          </button>
                      );
                   })}
                   {totalPages > 5 && <span className="px-1">...</span>}
                </div>
                <button
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={currentPage === totalPages}
                   className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors ${isDarkMode 
                      ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                >
                   Next <ChevronRight size={16} className="ml-1" />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
