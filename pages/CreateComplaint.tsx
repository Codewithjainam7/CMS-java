import React, { useState, useEffect } from 'react';
import { Priority, Sentiment } from '../types';
import { analyzeSentiment, suggestCategory } from '../services/mockService';

interface CreateComplaintProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CreateComplaint: React.FC<CreateComplaintProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [category, setCategory] = useState('');
  
  // AI Preview States
  const [detectedSentiment, setDetectedSentiment] = useState<Sentiment>(Sentiment.NEUTRAL);
  const [suggestedCat, setSuggestedCat] = useState('');

  // Real-time AI analysis
  useEffect(() => {
    const timeout = setTimeout(() => {
        if(description.length > 10) {
            setDetectedSentiment(analyzeSentiment(description));
            setSuggestedCat(suggestCategory(description + ' ' + title));
        }
    }, 500);
    return () => clearTimeout(timeout);
  }, [description, title]);

  useEffect(() => {
      if(suggestedCat && !category) {
          setCategory(suggestedCat);
      }
  }, [suggestedCat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        title,
        description,
        priority,
        category,
        sentiment: detectedSentiment
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-primary">Create New Complaint</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input 
                required
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
                required
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation..."
            />
            {/* AI Preview Badge */}
            <div className="mt-2 flex items-center space-x-4 text-xs">
                <div className="flex items-center text-gray-500">
                    <span className="mr-2 uppercase font-bold tracking-wider">AI Analysis:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                        detectedSentiment === 'ANGRY' ? 'bg-red-100 text-red-700' : 
                        detectedSentiment === 'FRUSTRATED' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                        {detectedSentiment}
                    </span>
                </div>
                {suggestedCat && (
                    <div className="flex items-center text-gray-500">
                         <span className="mr-1">Suggested Category:</span>
                         <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => setCategory(suggestedCat)}>
                             {suggestedCat} (Click to apply)
                         </span>
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select Category</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Service">Service</option>
                    <option value="Product">Product</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer">
            <p>Drag & drop attachments here, or click to browse</p>
            <p className="text-xs mt-1">(Max 5MB, JPG/PNG/PDF)</p>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-blue-700 transition-colors">Submit Complaint</button>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;