
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
    const cardClass = isDarkMode ? 'bg-slate-800/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white/80 border-slate-200/50 backdrop-blur-xl';
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
            <div className={`rounded-3xl shadow-lg border p-6 md:p-8 relative overflow-hidden ${cardClass}`}>
                {/* Gradient Background Effect */}
                <div className={`absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button onClick={onBack} className={`group flex items-center text-sm font-bold mb-4 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
                            <div className={`p-1.5 rounded-lg mr-2 transition-colors ${isDarkMode ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
                                <ArrowLeft size={16} />
                            </div>
                            Back to Complaints
                        </button>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${textPrimary}`}>{complaint.title}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-slate-700/50 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                #{complaint.id}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                            <span className={`flex items-center ${textSecondary}`}>
                                <Calendar size={14} className="mr-1.5 opacity-70" />
                                {new Date(complaint.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            {/* Status Badge */}
                            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${complaint.status === ComplaintStatus.RESOLVED
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                }`}>
                                <span className={`w-2 h-2 rounded-full mr-2 ${complaint.status === ComplaintStatus.RESOLVED ? 'bg-emerald-500' : 'bg-blue-500'
                                    }`}></span>
                                {complaint.status.replace('_', ' ')}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
                        {currentUser.role !== UserRole.STUDENT && complaint.status !== ComplaintStatus.RESOLVED && (
                            <button
                                onClick={() => onStatusChange(complaint.id, ComplaintStatus.RESOLVED)}
                                className="flex-1 md:flex-none justify-center bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center transform hover:-translate-y-0.5"
                            >
                                <CheckCircle size={18} className="mr-2" /> Mark Resolved
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Details & Timeline */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Detailed Information & Attachments */}
                    <div className={`rounded-3xl shadow-sm border p-6 md:p-8 ${cardClass}`}>
                        <h3 className={`text-lg font-bold mb-6 flex items-center ${textPrimary}`}>
                            <FileText size={20} className="mr-2 text-blue-500" />
                            Issue Details
                        </h3>

                        {/* Contextual Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 rounded-2xl border border-dashed bg-opacity-50 ${isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-50'}">
                            {complaint.studentId && (
                                <div className="flex items-start">
                                    <div className={`p-2 rounded-lg mr-3 ${isDarkMode ? 'bg-slate-700 text-blue-400' : 'bg-white text-blue-500 shadow-sm'}`}>
                                        <BadgeCheck size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${textSecondary}`}>Reference ID</p>
                                        <p className={`font-semibold ${textPrimary}`}>{complaint.studentId}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.department && (
                                <div className="flex items-start">
                                    <div className={`p-2 rounded-lg mr-3 ${isDarkMode ? 'bg-slate-700 text-purple-400' : 'bg-white text-purple-500 shadow-sm'}`}>
                                        <Building size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${textSecondary}`}>Department</p>
                                        <p className={`font-semibold ${textPrimary}`}>{complaint.department}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.incidentLocation && (
                                <div className="flex items-start">
                                    <div className={`p-2 rounded-lg mr-3 ${isDarkMode ? 'bg-slate-700 text-orange-400' : 'bg-white text-orange-500 shadow-sm'}`}>
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${textSecondary}`}>Location</p>
                                        <p className={`font-semibold ${textPrimary}`}>{complaint.incidentLocation}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.contactNumber && (
                                <div className="flex items-start">
                                    <div className={`p-2 rounded-lg mr-3 ${isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-emerald-500 shadow-sm'}`}>
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${textSecondary}`}>Contact</p>
                                        <p className={`font-semibold ${textPrimary}`}>{complaint.contactNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className={`prose max-w-none mb-8 ${isDarkMode ? 'prose-invert' : 'prose-slate'}`}>
                            <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${textSecondary}`}>Description</h4>
                            <p className={`leading-relaxed text-base ${textPrimary} whitespace-pre-wrap`}>
                                {complaint.description}
                            </p>
                        </div>

                        {/* Attachments */}
                        <div>
                            <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${textSecondary}`}>
                                <Paperclip size={14} className="mr-2" /> Attachments
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                {/* Mock attachment since file object isn't persisted in mock */}
                                <div
                                    className={`group flex items-center p-3 pr-4 border rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${isDarkMode ? 'bg-slate-700/50 border-slate-600 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-400'}`}
                                    onClick={() => alert("Downloading attachment...")}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mr-3 ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="mr-4">
                                        <p className={`text-sm font-bold group-hover:text-blue-500 transition-colors ${textPrimary}`}>Report_Evidence.pdf</p>
                                        <p className="text-xs text-slate-400">2.4 MB</p>
                                    </div>
                                    <Download size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity text-blue-500`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Workflow Timeline */}
                    <div className={`rounded-3xl shadow-sm border p-6 md:p-8 ${cardClass}`}>
                        <h3 className={`text-lg font-bold mb-8 ${textPrimary}`}>Resolution Timeline</h3>

                        {/* Mobile Layout (Vertical) if needed, but horizontal works well with scroll/responsive handling */}
                        {/* We'll use a responsive horizontal layout that wraps or scrolls properly is hard, stick to robust horizontal with care */}
                        <div className="relative pt-4 pb-14">
                            {/* Connecting Line - Constrained and centered with circles */}
                            <div className="absolute top-[calc(1rem+1.25rem)] md:top-[calc(1rem+1.5rem)] left-[12.5%] right-[12.5%] h-1.5 -translate-y-1/2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-1000 ease-out rounded-full"
                                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                ></div>
                            </div>

                            <div className="relative flex justify-between w-full">
                                {steps.map((step, idx) => {
                                    const isCompleted = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;

                                    return (
                                        <div key={step} className="flex flex-col items-center group relative z-10 w-1/4">
                                            <div className={`
                                            w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 transform
                                            ${isCompleted
                                                    ? 'bg-blue-500 border-white dark:border-slate-800 text-white shadow-lg shadow-blue-500/40 scale-110'
                                                    : isDarkMode
                                                        ? 'bg-slate-800 border-slate-600 text-slate-600'
                                                        : 'bg-white border-slate-200 text-slate-300'
                                                }
                                        `}>
                                                {isCompleted ? <CheckCircle size={20} strokeWidth={3} /> : <div className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full" />}
                                            </div>
                                            <span className={`
                                            absolute -bottom-8 md:-bottom-10 text-[10px] md:text-sm font-bold whitespace-nowrap transition-all duration-300 uppercase tracking-wider
                                            ${isCurrent
                                                    ? 'text-blue-500 translate-y-0 opacity-100'
                                                    : isCompleted
                                                        ? (isDarkMode ? 'text-slate-300' : 'text-slate-600')
                                                        : 'text-slate-400 opacity-70'
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
                        <div className={`rounded-3xl shadow-sm border p-6 ${cardClass} relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>

                            <h3 className={`text-xs font-bold uppercase tracking-wider mb-6 flex items-center ${textSecondary}`}>
                                <BadgeCheck size={14} className="mr-2 text-purple-500" /> AI Analysis
                            </h3>

                            <div className="space-y-6 relative z-10">
                                {/* Sentiment */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-sm font-semibold ${textPrimary}`}>Sentiment Score</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${complaint.sentiment === 'ANGRY' ? 'bg-red-100 text-red-600' :
                                            complaint.sentiment === 'FRUSTRATED' ? 'bg-orange-100 text-orange-600' :
                                                complaint.sentiment === 'SATISFIED' ? 'bg-green-100 text-green-600' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {complaint.sentiment}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${complaint.sentiment === 'ANGRY' ? 'bg-red-500 w-[85%]' :
                                            complaint.sentiment === 'FRUSTRATED' ? 'bg-orange-500 w-[60%]' :
                                                complaint.sentiment === 'NEUTRAL' ? 'bg-blue-400 w-[40%]' : 'bg-emerald-500 w-[20%]'
                                            }`}></div>
                                    </div>
                                </div>

                                {/* SLA Status */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-sm font-semibold ${textPrimary}`}>SLA Deadline</span>
                                        {isSlaBreached && (
                                            <span className="flex items-center text-xs font-bold text-red-500 animate-pulse">
                                                <AlertTriangle size={12} className="mr-1" /> BREACHED
                                            </span>
                                        )}
                                    </div>
                                    <div className={`flex items-center p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className={`p-2 rounded-lg mr-3 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-500 shadow-sm'}`}>
                                            <Timer size={18} />
                                        </div>
                                        <div>
                                            <p className={`text-xs text-slate-400 font-bold uppercase`}>Time Remaining</p>
                                            <p className={`font-mono font-bold ${isSlaBreached ? 'text-red-500' : textPrimary}`}>{timeLeft}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat / Discussion */}
                    <div className={`rounded-3xl shadow-sm border flex flex-col overflow-hidden h-[500px] ${cardClass}`}>
                        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-100'}`}>
                            <h3 className={`font-bold flex items-center text-sm ${textPrimary}`}>
                                <MessageSquare size={16} className="mr-2 text-blue-500" /> Discussion
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800 flex items-center">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span> Live
                            </span>
                        </div>

                        <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
                            {comments.map(comment => {
                                const isMe = comment.userId === currentUser.id;
                                return (
                                    <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slideIn`}>
                                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm relative group ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : isDarkMode
                                                ? 'bg-slate-700 text-slate-200 border border-slate-600 rounded-bl-none'
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                                            }`}>
                                            {comment.content}
                                            <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-1.5' : '-left-1.5'}`}></div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1.5 font-medium px-1 opacity-70">
                                            {isMe ? 'You' : comment.userName} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`p-3 border-t shrink-0 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'}`}>
                            <div className={`flex items-center space-x-2 p-1.5 rounded-full border focus-within:ring-2 focus-within:ring-blue-500/50 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
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
                                    className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 transform active:scale-95"
                                >
                                    <Send size={16} className={commentText.trim() ? "translate-x-0.5" : ""} />
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
