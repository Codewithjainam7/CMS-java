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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50 dark:border-gray-700/50">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertCircle size={120} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 relative z-10">New Complaint</h2>
                    <p className="text-blue-100 relative z-10">We're here to help. Please realize that your detailed input helps us resolve issues faster.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Personal Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Student/Employee ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="ID Number"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g. Computer Science"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Contact Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="tel"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                placeholder="Mobile Number"
                            />
                        </div>
                    </div>

                    {/* Incident Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Date of Incident <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="date"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100"
                                value={incidentDate}
                                onChange={(e) => setIncidentDate(e.target.value)}
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Location of Incident <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={incidentLocation}
                                onChange={(e) => setIncidentLocation(e.target.value)}
                                placeholder="e.g. Library, Canteen, etc."
                            />
                        </div>
                    </div>

                    {/* Main Input Section */}
                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                                Subject / Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., WiFi Connectivity Issue in Library"
                            />
                        </div>

                        <div className="group relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                                Issue Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={5}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please describe the incident or issue in detail..."
                            />

                            {/* AI Analysis Floating Badge */}
                            <div className="absolute top-10 right-3">
                                {isAnalyzing ? (
                                    <div className="flex items-center space-x-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-blue-100 dark:border-blue-900 text-xs text-blue-600 dark:text-blue-300">
                                        <Loader2 size={12} className="animate-spin" />
                                        <span>Analyzing...</span>
                                    </div>
                                ) : (
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full shadow-sm text-xs font-bold transition-all duration-500 ${detectedSentiment === 'ANGRY' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-800' :
                                        detectedSentiment === 'FRUSTRATED' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border border-orange-100 dark:border-orange-800' :
                                            'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 border border-green-100 dark:border-green-800'
                                        }`}>
                                        <span>{detectedSentiment}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suggested Category Badge */}
                        {suggestedCat && !isAnalyzing && (
                            <div className="flex items-center animate-fadeIn">
                                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Suggested Category:</span>
                                <button
                                    type="button"
                                    onClick={() => setCategory(suggestedCat)}
                                    className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-sm font-medium border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center"
                                >
                                    ✨ {suggestedCat}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer text-gray-800 dark:text-gray-100"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="" className="dark:bg-gray-800">Select a Category</option>
                                    <option value="Sexual Harassment" className="dark:bg-gray-800">Sexual Harassment</option>
                                    <option value="Ragging" className="dark:bg-gray-800">Ragging</option>
                                    <option value="Academic Issues" className="dark:bg-gray-800">Academic Issues</option>
                                    <option value="Infrastructure" className="dark:bg-gray-800">Infrastructure</option>
                                    <option value="Canteen/Hygiene" className="dark:bg-gray-800">Canteen/Hygiene</option>
                                    <option value="Student Affairs" className="dark:bg-gray-800">Student Affairs</option>
                                    <option value="Discrimination" className="dark:bg-gray-800">Discrimination</option>
                                    <option value="Other" className="dark:bg-gray-800">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority Level</label>
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                {Object.values(Priority).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${priority === p
                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Attachments (Video, Image, PDF)</label>
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ease-in-out text-center cursor-pointer ${isDragging
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
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

                            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">MP4, PNG, JPG or PDF (Max 50MB)</p>
                        </div>

                        {/* File Preview List */}
                        {files.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 group hover:border-blue-200 dark:hover:border-blue-600 transition-colors">
                                        <div className="mr-3">
                                            {getFileIcon(file.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5 transition-all flex items-center"
                        >
                            <Send size={18} className="mr-2" />
                            Submit Complaint
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateComplaint;