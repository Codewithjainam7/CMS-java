
import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, Comment, User, UserRole, Feedback } from '../types';
import { Send, Paperclip, CheckCircle, Timer, MessageSquare, ArrowLeft, MoreHorizontal, FileText, Download, Building, MapPin, Calendar, Phone, BadgeCheck, AlertTriangle } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';

interface ComplaintDetailProps {
    complaint: Complaint;
    currentUser: User;
    onBack: () => void;
    onStatusChange: (id: string, status: ComplaintStatus) => void;
    onFeedbackSubmit?: (complaintId: string, rating: number, comment: string) => void;
    isDarkMode: boolean;
}

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({ complaint, currentUser, onBack, onStatusChange, onFeedbackSubmit, isDarkMode }) => {
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<Comment[]>([
        { id: 'c1', complaintId: complaint.id, userId: complaint.customerId, userName: complaint.customerName, content: 'When can I expect a resolution?', isInternal: false, createdAt: new Date(Date.now() - 3600000).toISOString() }
    ]);
    const [timeLeft, setTimeLeft] = useState('');

    // Styling Variables
    const cardClass = 'glass-card text-white border-white/10 relative overflow-hidden transition-all duration-300 hover:shadow-2xl';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

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
        // Initial call
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
        return () => clearInterval(timer);
    }, [complaint.slaDeadline]);

    const handleAddComment = () => {
        if (!commentText.trim()) return;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">

            {/* Header Section */}
            <div className={`rounded-[32px] shadow-2xl border p-8 relative overflow-hidden ${cardClass}`}>
                {/* Gradient Background Effect */}
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}></div>
                <div className={`absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2`}></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button onClick={onBack} className={`group flex items-center text-sm font-bold mb-6 transition-colors text-slate-400 hover:text-white`}>
                            <div className={`p-2 rounded-xl mr-2 transition-colors bg-white/5 group-hover:bg-white/10`}>
                                <ArrowLeft size={16} />
                            </div>
                            Back to Complaints
                        </button>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm`}>{complaint.title}</h1>
                            <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border bg-white/5 text-slate-300 border-white/10`}>
                                #{complaint.id}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm mt-3">
                            <span className={`flex items-center text-slate-400 font-medium`}>
                                <Calendar size={16} className="mr-2 opacity-70" />
                                {new Date(complaint.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            {/* Status Badge */}
                            <div className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg ${complaint.status === ComplaintStatus.RESOLVED
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-blue-500/10'
                                }`}>
                                <span className={`w-2 h-2 rounded-full mr-2 ${complaint.status === ComplaintStatus.RESOLVED ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400 animate-pulse'
                                    }`}></span>
                                {complaint.status.replace('_', ' ')}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 md:mt-0 w-full md:w-auto">
                        {currentUser.role !== UserRole.STUDENT && complaint.status !== ComplaintStatus.RESOLVED && (
                            <button
                                onClick={() => onStatusChange(complaint.id, ComplaintStatus.RESOLVED)}
                                className="flex-1 md:flex-none justify-center bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center transform hover:-translate-y-1 active:scale-95"
                            >
                                <CheckCircle size={20} className="mr-2" /> Mark Resolved
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Details & Timeline */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Detailed Information & Attachments */}
                    <div className={`p-8 rounded-[32px] ${cardClass}`}>
                        <h3 className={`text-xl font-bold mb-8 flex items-center text-white`}>
                            <div className="p-2 bg-blue-500/20 rounded-xl mr-3 text-blue-400">
                                <FileText size={20} />
                            </div>
                            Issue Details
                        </h3>

                        {/* Contextual Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-sm">
                            {complaint.studentId && (
                                <div className="flex items-start">
                                    <div className={`p-2.5 rounded-xl mr-4 bg-blue-500/10 text-blue-400`}>
                                        <BadgeCheck size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-500`}>Reference ID</p>
                                        <p className={`font-bold text-white`}>{complaint.studentId}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.department && (
                                <div className="flex items-start">
                                    <div className={`p-2.5 rounded-xl mr-4 bg-purple-500/10 text-purple-400`}>
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-500`}>Department</p>
                                        <p className={`font-bold text-white`}>{complaint.department}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.incidentLocation && (
                                <div className="flex items-start">
                                    <div className={`p-2.5 rounded-xl mr-4 bg-orange-500/10 text-orange-400`}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-500`}>Location</p>
                                        <p className={`font-bold text-white`}>{complaint.incidentLocation}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.contactNumber && (
                                <div className="flex items-start">
                                    <div className={`p-2.5 rounded-xl mr-4 bg-emerald-500/10 text-emerald-400`}>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-500`}>Contact</p>
                                        <p className={`font-bold text-white`}>{complaint.contactNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className={`prose max-w-none mb-10 prose-invert`}>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 text-slate-400 flex items-center`}>Description</h4>
                            <p className={`leading-relaxed text-base text-slate-200 whitespace-pre-wrap`}>
                                {complaint.description}
                            </p>
                        </div>

                        {/* Attachments */}
                        <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 flex items-center text-slate-400`}>
                                <Paperclip size={14} className="mr-2" /> Attachments
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                {/* Mock attachment since file object isn't persisted in mock */}
                                <div
                                    className={`group flex items-center p-4 pr-6 border rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/30`}
                                    onClick={() => alert("Downloading attachment...")}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner mr-4 bg-black/20 text-blue-400`}>
                                        <FileText size={24} />
                                    </div>
                                    <div className="mr-6">
                                        <p className={`text-sm font-bold group-hover:text-blue-400 transition-colors text-white`}>Report_Evidence.pdf</p>
                                        <p className="text-xs text-slate-500 font-mono mt-1">2.4 MB</p>
                                    </div>
                                    <Download size={18} className={`opacity-0 group-hover:opacity-100 transition-all text-blue-400 transform translate-x-2 group-hover:translate-x-0`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Workflow Timeline */}
                    <div className={`p-8 rounded-[32px] ${cardClass}`}>
                        <h3 className={`text-xl font-bold mb-10 text-white flex items-center`}>
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></div>
                            Resolution Timeline
                        </h3>

                        <div className="relative pt-2 pb-8 px-4">
                            {/* 12-Segment Progress Bar */}
                            <div className="absolute top-[1.5rem] left-[5%] right-[5%] flex gap-1.5">
                                {Array.from({ length: 12 }).map((_, idx) => {
                                    const filledSegments = Math.floor((currentStepIndex / (steps.length - 1)) * 12);
                                    const isFilled = idx < filledSegments;
                                    const isPartial = idx === filledSegments && currentStepIndex < steps.length - 1;

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex-1 h-2 rounded-full transition-all duration-500 ease-out ${isFilled
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                                    : isPartial
                                                        ? 'bg-gradient-to-r from-blue-500/50 to-transparent'
                                                        : 'bg-white/10'
                                                }`}
                                            style={{
                                                animationDelay: `${idx * 50}ms`,
                                                transform: isFilled ? 'scaleY(1.2)' : 'scaleY(1)'
                                            }}
                                        />
                                    );
                                })}
                            </div>

                            <div className="relative flex justify-between w-full mt-8 pt-4">
                                {steps.map((step, idx) => {
                                    const isCompleted = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;

                                    return (
                                        <div key={step} className="flex flex-col items-center group relative z-10 w-1/4">
                                            <div className={`
                                                w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 transform
                                                ${isCompleted
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400/50 text-white shadow-xl shadow-blue-500/40 scale-100'
                                                    : 'bg-slate-800/80 border-slate-700 text-slate-500 scale-90'
                                                }
                                                ${isCurrent ? 'ring-4 ring-blue-500/20 scale-110' : ''}
                                            `}>
                                                {isCompleted ? <CheckCircle size={24} strokeWidth={2.5} /> : <div className="w-3 h-3 bg-slate-600 rounded-full" />}
                                            </div>
                                            <span className={`
                                                absolute -bottom-8 text-[10px] md:text-xs font-bold whitespace-nowrap transition-all duration-300 uppercase tracking-wider px-3 py-1.5 rounded-xl
                                                ${isCurrent
                                                    ? 'text-blue-400 bg-blue-500/20 border border-blue-500/20 translate-y-0 opacity-100'
                                                    : isCompleted
                                                        ? 'text-slate-300'
                                                        : 'text-slate-600 opacity-40'
                                                }
                                            `}>
                                                {step.replace('_', ' ')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: AI & Chat */}
                <div className="space-y-8">
                    {/* AI Intelligence Card - Admin Only */}
                    {currentUser.role === UserRole.ADMIN && (
                        <div className={`p-6 rounded-[32px] glass-card border border-white/10 relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110 blur-xl"></div>

                            <h3 className={`text-xs font-bold uppercase tracking-wider mb-6 flex items-center text-slate-400`}>
                                <BadgeCheck size={14} className="mr-2 text-purple-400" /> AI Analysis
                            </h3>

                            <div className="space-y-6 relative z-10">
                                {/* Sentiment */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`text-sm font-bold text-white`}>Sentiment Score</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm ${complaint.sentiment === 'ANGRY' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            complaint.sentiment === 'FRUSTRATED' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                complaint.sentiment === 'SATISFIED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            }`}>
                                            {complaint.sentiment}
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                                        <div className={`h-full rounded-full transition-all duration-1000 shadow-lg ${complaint.sentiment === 'ANGRY' ? 'bg-gradient-to-r from-red-600 to-red-400 w-[85%]' :
                                            complaint.sentiment === 'FRUSTRATED' ? 'bg-gradient-to-r from-orange-600 to-orange-400 w-[60%]' :
                                                complaint.sentiment === 'NEUTRAL' ? 'bg-gradient-to-r from-blue-500 to-blue-400 w-[40%]' : 'bg-gradient-to-r from-emerald-500 to-emerald-400 w-[20%]'
                                            }`}></div>
                                    </div>
                                </div>

                                {/* SLA Status */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`text-sm font-bold text-white`}>SLA Deadline</span>
                                        {isSlaBreached && (
                                            <span className="flex items-center text-[10px] font-bold text-red-400 animate-pulse bg-red-400/10 px-2 py-0.5 rounded-lg">
                                                <AlertTriangle size={12} className="mr-1" /> BREACHED
                                            </span>
                                        )}
                                    </div>
                                    <div className={`flex items-center p-4 rounded-2xl border bg-white/5 border-white/5`}>
                                        <div className={`p-2.5 rounded-xl mr-3 bg-black/20 text-slate-300`}>
                                            <Timer size={20} />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] text-slate-400 font-bold uppercase tracking-wider`}>Time Remaining</p>
                                            <p className={`font-mono font-bold text-lg ${isSlaBreached ? 'text-red-400' : 'text-white'}`}>{timeLeft}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat / Discussion */}
                    <div className={`rounded-[32px] glass-card border border-white/10 flex flex-col overflow-hidden h-[600px] shadow-2xl`}>
                        <div className={`p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5 backdrop-blur-md`}>
                            <h3 className={`font-bold flex items-center text-sm text-white`}>
                                <div className="p-1.5 bg-blue-500 rounded-lg mr-2 shadow-lg shadow-blue-500/30">
                                    <MessageSquare size={14} className="text-white" />
                                </div>
                                Discussion
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center shadow-inner">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> Live
                            </span>
                        </div>

                        <div className={`flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-black/20`}>
                            {comments.map(comment => {
                                const isMe = comment.userId === currentUser.id;
                                return (
                                    <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slideIn`}>
                                        <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm shadow-md relative group backdrop-blur-sm border ${isMe
                                            ? 'bg-blue-600/90 text-white rounded-br-none border-blue-500/50 shadow-blue-900/20'
                                            : 'bg-slate-800/80 text-slate-200 border-slate-700/50 rounded-bl-none shadow-black/20'
                                            }`}>
                                            {comment.content}
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-2 font-medium px-1">
                                            {isMe ? 'You' : comment.userName} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`p-4 border-t shrink-0 border-white/5 bg-white/5 backdrop-blur-md`}>
                            <div className={`flex items-center space-x-2 p-1.5 rounded-full border border-white/10 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all bg-black/20`}>
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Type your message..."
                                    className={`flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-slate-500 text-white`}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 transform active:scale-95 group"
                                >
                                    <Send size={16} className={`group-hover:translate-x-0.5 transition-transform ${commentText.trim() ? "" : "opacity-50"}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Form - For Students/Victims on Resolved Complaints */}
                    {(currentUser.role === UserRole.STUDENT || currentUser.role === UserRole.VICTIM) &&
                        (complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED) && (
                            <FeedbackForm
                                complaintId={complaint.id}
                                existingFeedback={complaint.feedback}
                                onSubmit={(rating, comment) => onFeedbackSubmit?.(complaint.id, rating, comment)}
                                isDarkMode={isDarkMode}
                            />
                        )}
                </div>
            </div>
        </div >
    );
};

export default ComplaintDetail;
