
import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, Comment, User, UserRole } from '../types';
import { Send, Paperclip, CheckCircle, Timer, MessageSquare, ArrowLeft, MoreHorizontal, FileText, Download } from 'lucide-react';

interface ComplaintDetailProps {
  complaint: Complaint;
  currentUser: User;
  onBack: () => void;
  onStatusChange: (id: string, status: ComplaintStatus) => void;
  isDarkMode: boolean;
}

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({ complaint, currentUser, onBack, onStatusChange, isDarkMode }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', complaintId: complaint.id, userId: complaint.customerId, userName: complaint.customerName, content: 'When can I expect a resolution?', isInternal: false, createdAt: new Date(Date.now() - 3600000).toISOString() }
  ]);
  const [timeLeft, setTimeLeft] = useState('');

  const cardClass = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  // SLA Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const due = new Date(complaint.slaDeadline).getTime();
      const now = new Date().getTime();
      const diff = due - now;

      if (diff <= 0) {
        setTimeLeft('BREACHED');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [complaint.slaDeadline]);

  const handleAddComment = () => {
    if(!commentText.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      complaintId: complaint.id,
      userId: currentUser.id,
      userName: currentUser.name,
      content: commentText,
      isInternal: false,
      createdAt: new Date().toISOString()
    };
    setComments([...comments, newComment]);
    setCommentText('');
  };

  const isSlaBreached = new Date(complaint.slaDeadline) < new Date() && complaint.status !== ComplaintStatus.RESOLVED;

  // Render Timeline
  const steps = [ComplaintStatus.NEW, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED];
  const currentStepIndex = steps.indexOf(complaint.status);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
      {/* Left: Details (2 Columns) */}
      <div className="xl:col-span-2 flex flex-col space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-8">
        {/* Header Card */}
        <div className={`p-8 rounded-3xl shadow-sm border ${cardClass}`}>
           <div className="flex justify-between items-start mb-6">
             <button onClick={onBack} className={`flex items-center text-sm font-bold transition-colors px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-50 text-slate-500 hover:text-blue-600'}`}>
                <ArrowLeft size={16} className="mr-2" /> Back
             </button>
             <div className="flex space-x-3">
                {currentUser.role !== UserRole.CUSTOMER && complaint.status !== ComplaintStatus.RESOLVED && (
                    <button 
                        onClick={() => onStatusChange(complaint.id, ComplaintStatus.RESOLVED)}
                        className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center"
                    >
                        <CheckCircle size={18} className="mr-2" /> Mark Resolved
                    </button>
                )}
                <button 
                    onClick={() => alert("More options menu clicked (Demo)")}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    <MoreHorizontal size={20} />
                </button>
             </div>
           </div>
           
           <h1 className={`text-3xl font-extrabold mb-3 tracking-tight ${textPrimary}`}>{complaint.title}</h1>
           
           <div className="flex flex-wrap gap-3 mb-8">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold uppercase tracking-wider border border-blue-100">
                {complaint.category}
              </span>
              <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border flex items-center ${isSlaBreached ? 'bg-red-50 text-red-700 border-red-100' : isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <Timer size={14} className="mr-1.5" /> SLA: {timeLeft}
              </span>
              <span className={`px-3 py-1 rounded-md text-xs font-bold border ${isDarkMode ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  ID: {complaint.id}
              </span>
           </div>

           <div className="prose prose-slate max-w-none">
             <p className={`leading-relaxed text-base ${textSecondary}`}>{complaint.description}</p>
           </div>
           
           {/* Attachments Mock */}
           <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center"><Paperclip size={14} className="mr-2"/> Attached Files (1)</h4>
              <div className="flex gap-4">
                  <div 
                    onClick={() => alert("Downloading file...")}
                    className={`group flex items-center p-3 border rounded-xl cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 hover:border-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}
                  >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mr-3 ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-500'}`}>
                          <FileText size={20} />
                      </div>
                      <div>
                          <p className={`text-sm font-bold group-hover:text-blue-500 ${textPrimary}`}>error_log.txt</p>
                          <p className="text-xs text-slate-400">12 KB</p>
                      </div>
                      <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download size={16} className="text-slate-400" />
                      </div>
                  </div>
              </div>
           </div>
        </div>

        {/* Workflow Timeline */}
        <div className={`p-8 rounded-3xl shadow-sm border ${cardClass}`}>
            <h3 className={`text-lg font-bold mb-8 ${textPrimary}`}>Status Progress</h3>
            <div className="relative flex justify-between">
                 {/* Connecting Line */}
                <div className={`absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 rounded-full -z-0 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                <div className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full -z-0 transition-all duration-500" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>

                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    
                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                isCompleted 
                                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                                : isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-600' : 'bg-white border-slate-200 text-slate-300'
                            }`}>
                                {isCompleted ? <CheckCircle size={18} className="fill-current" /> : <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                            </div>
                            <span className={`absolute -bottom-8 text-xs font-bold whitespace-nowrap transition-colors ${
                                isCurrent ? 'text-blue-600' : isCompleted ? (isDarkMode ? 'text-slate-300' : 'text-slate-700') : 'text-slate-400'
                            }`}>
                                {step.replace('_', ' ')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Right: Actions & Chat */}
      <div className="flex flex-col space-y-6 h-full overflow-hidden">
         {/* Sentiment & QR Card */}
         <div className={`p-6 rounded-3xl shadow-sm border shrink-0 ${cardClass}`}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">AI Insight</h3>
            
            <div className={`rounded-2xl p-4 mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Sentiment Score</span>
                    {complaint.sentiment === 'ANGRY' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Negative</span>}
                    {complaint.sentiment === 'NEUTRAL' && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">Neutral</span>}
                    {complaint.sentiment === 'SATISFIED' && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Positive</span>}
                </div>
                <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                    <div className={`h-full rounded-full transition-all duration-500 ${
                        complaint.sentiment === 'ANGRY' ? 'bg-red-500 w-[20%]' : 
                        complaint.sentiment === 'FRUSTRATED' ? 'bg-orange-500 w-[40%]' :
                        complaint.sentiment === 'NEUTRAL' ? 'bg-slate-400 w-[60%]' : 'bg-emerald-500 w-[90%]'
                    }`}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Based on description text analysis.
                </p>
            </div>
            
            <div className={`pt-4 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="text-xs text-slate-500">
                    <p className={`font-bold ${textPrimary}`}>Tracking Code</p>
                    <p>Scan to view on mobile</p>
                </div>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://cms.app/track/${complaint.id}`} 
                  alt="QR" 
                  className={`w-16 h-16 rounded-lg border p-1 bg-white ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}
                />
            </div>
         </div>

         {/* Chat System */}
         <div className={`rounded-3xl shadow-sm border flex flex-col overflow-hidden flex-1 min-h-0 ${cardClass}`}>
             <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                <h3 className={`font-bold flex items-center text-sm ${textPrimary}`}><MessageSquare size={16} className="mr-2 text-blue-500"/> Discussion</h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span> Live
                </span>
             </div>
             
             <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-slate-900/20' : 'bg-slate-50/30'}`}>
                {comments.map(comment => (
                    <div key={comment.id} className={`flex flex-col ${comment.userId === currentUser.id ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                            comment.userId === currentUser.id 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : isDarkMode 
                                ? 'bg-slate-700 text-slate-200 border border-slate-600 rounded-bl-none'
                                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                        }`}>
                            {comment.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1.5 font-medium px-1">
                            {comment.userName} • {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                ))}
             </div>

             <div className={`p-3 border-t shrink-0 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'}`}>
                 <div className={`flex items-center space-x-2 p-1.5 rounded-full border focus-within:ring-2 focus-within:ring-blue-500/50 transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                     <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Type your message..."
                        className={`flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-slate-400 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                     />
                     <button 
                        onClick={handleAddComment} 
                        disabled={!commentText.trim()}
                        className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
                     >
                         <Send size={16} className={commentText.trim() ? "ml-0.5" : ""} />
                     </button>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
