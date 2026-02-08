import React, { useState, useEffect, useRef } from 'react';
import { Priority, Sentiment } from '../types';
import { analyzeSentiment, suggestCategory } from '../services/mockService';
import { analyzeComplaintWithGroq } from '../services/groqService';
import { UploadCloud, X, FileVideo, FileText, Image as ImageIcon, Loader2, Send, AlertCircle } from 'lucide-react';

interface CreateComplaintProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const CreateComplaint: React.FC<CreateComplaintProps> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
    const [category, setCategory] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [department, setDepartment] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [incidentDate, setIncidentDate] = useState('');
    const [incidentLocation, setIncidentLocation] = useState('');

    // AI Preview States
    const [detectedSentiment, setDetectedSentiment] = useState<Sentiment>(Sentiment.NEUTRAL);
    const [suggestedCat, setSuggestedCat] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Real-time AI analysis
    useEffect(() => {
        const timeout = setTimeout(async () => {
            const combinedText = description + ' ' + title;
            if (combinedText.length > 5) {
                setIsAnalyzing(true);
                try {
                    const groqResult = await analyzeComplaintWithGroq(combinedText);
                    if (groqResult) {
                        setDetectedSentiment(groqResult.sentiment);
                        if (groqResult.category) setSuggestedCat(groqResult.category);
                    } else {
                        setDetectedSentiment(analyzeSentiment(combinedText));
                        setSuggestedCat(suggestCategory(combinedText));
                    }
                } finally {
                    setIsAnalyzing(false);
                }
            }
        }, 800);
        return () => clearTimeout(timeout);
    }, [description, title]);

    useEffect(() => {
        if (suggestedCat && !category) {
            setCategory(suggestedCat);
        }
    }, [suggestedCat]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(file => {
            const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
            if (!isValidSize) alert(`File ${file.name} is too large (Max 50MB)`);
            return isValidSize;
        });
        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            description,
            priority,
            category,
            sentiment: detectedSentiment,
            attachments: files, // Pass the actual files
            studentId,
            department,
            contactNumber,
            incidentDate,
            incidentLocation
        });
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('video/')) return <FileVideo className="text-purple-500" />;
        if (type.startsWith('image/')) return <ImageIcon className="text-blue-500" />;
        return <FileText className="text-gray-500" />;
    };

    // Glassmorphism Styles
    const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none font-medium text-white placeholder-slate-500 hover:bg-white/10";
    const labelClass = "block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400 ml-1";
    const cardClass = "glass-card border-white/10 relative overflow-hidden";

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
            <div className={`p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden ${cardClass}`}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10 mb-10 border-b border-white/10 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-lg shadow-blue-500/30">
                            <AlertCircle size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tight text-white mb-2">New Complaint</h2>
                            <p className="text-slate-400 font-medium text-lg">We're here to help. Detailed input helps us resolve issues faster.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

                    {/* Personal Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group">
                            <label className={labelClass}>
                                Student/Employee ID <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className={inputClass}
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="ID Number"
                            />
                        </div>
                        <div className="group">
                            <label className={labelClass}>
                                Department <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className={inputClass}
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g. Computer Science"
                            />
                        </div>
                        <div className="group">
                            <label className={labelClass}>
                                Contact Number <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="tel"
                                className={inputClass}
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                placeholder="Mobile Number"
                            />
                        </div>
                    </div>

                    {/* Incident Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className={labelClass}>
                                Date of Incident <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="date"
                                className={inputClass}
                                value={incidentDate}
                                onChange={(e) => setIncidentDate(e.target.value)}
                            />
                        </div>
                        <div className="group">
                            <label className={labelClass}>
                                Location of Incident <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className={inputClass}
                                value={incidentLocation}
                                onChange={(e) => setIncidentLocation(e.target.value)}
                                placeholder="e.g. Library, Canteen, etc."
                            />
                        </div>
                    </div>

                    {/* Main Input Section */}
                    <div className="space-y-6">
                        <div className="group">
                            <label className={labelClass}>
                                Subject / Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className={`${inputClass} text-lg font-bold`}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., WiFi Connectivity Issue in Library"
                            />
                        </div>

                        <div className="group relative">
                            <label className={labelClass}>
                                Issue Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                required
                                rows={5}
                                className={`${inputClass} resize-none leading-relaxed min-h-[160px]`}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please describe the incident or issue in detail..."
                            />

                            {/* AI Analysis Floating Badge */}
                            <div className="absolute top-12 right-4">
                                {isAnalyzing ? (
                                    <div className="flex items-center space-x-2 bg-blue-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-500/30 text-xs text-blue-300 font-bold shadow-lg">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Analyzing...</span>
                                    </div>
                                ) : (
                                    <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full shadow-lg border backdrop-blur-md text-xs font-bold transition-all duration-500 ${detectedSentiment === 'ANGRY' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        detectedSentiment === 'FRUSTRATED' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        }`}>
                                        <span className="uppercase tracking-wider">{detectedSentiment}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suggested Category Badge */}
                        {suggestedCat && !isAnalyzing && (
                            <div className="flex items-center animate-fadeIn pl-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-3">Suggested Category:</span>
                                <button
                                    type="button"
                                    onClick={() => setCategory(suggestedCat)}
                                    className="px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold border border-blue-500/30 hover:bg-blue-500/30 transition-all flex items-center shadow-lg shadow-blue-500/10"
                                >
                                    ✨ {suggestedCat}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>Category <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <select
                                    required
                                    className={`${inputClass} appearance-none cursor-pointer bg-black/20`}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="" className="bg-slate-900 text-slate-400">Select a Category</option>
                                    <option value="Sexual Harassment" className="bg-slate-900">Sexual Harassment</option>
                                    <option value="Ragging" className="bg-slate-900">Ragging</option>
                                    <option value="Academic Issues" className="bg-slate-900">Academic Issues</option>
                                    <option value="Infrastructure" className="bg-slate-900">Infrastructure</option>
                                    <option value="Canteen/Hygiene" className="bg-slate-900">Canteen/Hygiene</option>
                                    <option value="Student Affairs" className="bg-slate-900">Student Affairs</option>
                                    <option value="Discrimination" className="bg-slate-900">Discrimination</option>
                                    <option value="Other" className="bg-slate-900">Other</option>
                                </select>
                                <div className="absolute right-5 top-5 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Priority Level</label>
                            <div className="flex bg-black/20 p-1.5 rounded-2xl border border-white/5">
                                {Object.values(Priority).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${priority === p
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modern File Upload */}
                    <div>
                        <label className={labelClass}>Attachments (Video, Image, PDF)</label>
                        <div
                            className={`border-2 border-dashed rounded-3xl p-10 transition-all duration-200 ease-in-out text-center cursor-pointer group ${isDragging
                                ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                                : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'
                                }`}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                accept="image/*,video/*,application/pdf"
                                onChange={handleFileChange}
                            />

                            <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-white font-bold text-lg mb-2">Click to upload or drag and drop</p>
                            <p className="text-slate-500 text-sm font-medium">MP4, PNG, JPG or PDF (Max 50MB)</p>
                        </div>

                        {/* File Preview List */}
                        {files.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
                                        <div className="mr-4 p-3 bg-black/20 rounded-xl">
                                            {getFileIcon(file.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                            className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-8 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-3.5 text-slate-300 font-bold hover:bg-white/10 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center"
                        >
                            <Send size={20} className="mr-2" />
                            Submit Complaint
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateComplaint;