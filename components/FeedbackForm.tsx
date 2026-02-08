import React, { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import { Feedback } from '../types';

interface FeedbackFormProps {
    complaintId: string;
    existingFeedback?: Feedback;
    onSubmit: (rating: number, comment: string) => void;
    isDarkMode: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ complaintId, existingFeedback, onSubmit, isDarkMode }) => {
    const [rating, setRating] = useState(existingFeedback?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState(existingFeedback?.comment || '');
    const [isSubmitted, setIsSubmitted] = useState(!!existingFeedback);

    const cardClass = isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        onSubmit(rating, comment);
        setIsSubmitted(true);
    };

    const ratingLabels = ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

    // Read-only view after submission
    if (isSubmitted || existingFeedback) {
        const displayRating = existingFeedback?.rating || rating;
        const displayComment = existingFeedback?.comment || comment;
        const submittedDate = existingFeedback?.submittedAt
            ? new Date(existingFeedback.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        return (
            <div className={`rounded-2xl border p-6 ${cardClass} backdrop-blur-xl`}>
                <div className="flex items-center mb-4">
                    <CheckCircle size={20} className="text-emerald-500 mr-2" />
                    <h3 className={`font-bold ${textPrimary}`}>Feedback Submitted</h3>
                </div>

                <div className="flex items-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={24}
                            className={star <= displayRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                        />
                    ))}
                    <span className={`ml-3 text-sm font-semibold ${textSecondary}`}>
                        {ratingLabels[displayRating]}
                    </span>
                </div>

                {displayComment && (
                    <p className={`text-sm ${textSecondary} bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg`}>
                        "{displayComment}"
                    </p>
                )}

                <p className={`text-xs ${textSecondary} mt-3`}>
                    Submitted on {submittedDate}
                </p>
            </div>
        );
    }

    // Editable form
    return (
        <div className={`rounded-2xl border p-6 ${cardClass} backdrop-blur-xl`}>
            <h3 className={`font-bold mb-4 ${textPrimary}`}>
                How was your experience?
            </h3>
            <p className={`text-sm mb-6 ${textSecondary}`}>
                Your feedback helps us improve our services.
            </p>

            <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className="mb-6">
                    <label className={`block text-sm font-semibold mb-3 ${textSecondary}`}>
                        Rate your satisfaction <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    size={32}
                                    className={`transition-colors ${star <= (hoveredRating || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : isDarkMode ? 'text-slate-600' : 'text-slate-300'
                                        }`}
                                />
                            </button>
                        ))}
                        {(hoveredRating || rating) > 0 && (
                            <span className={`ml-3 text-sm font-semibold ${(hoveredRating || rating) <= 2 ? 'text-red-500' :
                                    (hoveredRating || rating) === 3 ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                {ratingLabels[hoveredRating || rating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                    <label className={`block text-sm font-semibold mb-2 ${textSecondary}`}>
                        Additional comments (optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about the resolution..."
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none ${isDarkMode
                                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                : 'bg-gray-50 border-gray-200 text-slate-800 placeholder-gray-400'
                            }`}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={rating === 0}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${rating === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5'
                        }`}
                >
                    <Send size={18} />
                    Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
