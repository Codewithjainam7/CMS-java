
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Mail, Shield, Award, Calendar, Phone, MapPin, Edit2, Camera, Save, X } from 'lucide-react';

interface ProfileProps {
    user: User;
    isDarkMode: boolean;
}

const COVERS = [
    'bg-gradient-to-r from-blue-600 to-indigo-700',
    'bg-gradient-to-r from-emerald-500 to-teal-600',
    'bg-gradient-to-r from-orange-400 to-rose-500',
    'bg-gradient-to-r from-purple-600 to-blue-500',
    'bg-[url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=2000")] bg-cover bg-center',
    'bg-[url("https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000")] bg-cover bg-center',
];

const Profile: React.FC<ProfileProps> = ({ user, isDarkMode }) => {
    const [coverIndex, setCoverIndex] = useState(4); // Default to a nice image
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        bio: 'Passionate about building great software and helping others. Always learning new things!'
    });

    const cardClass = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const inputClass = `w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`;

    const handleEditCover = () => {
        setCoverIndex((prev) => (prev + 1) % COVERS.length);
    };

    const handleSave = () => {
        setIsEditing(false);
        // Here you would typically make an API call to save the user data
        console.log('Saved profile:', formData);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header Cover */}
            <div className={`rounded-3xl shadow-2xl overflow-hidden border relative group ${isDarkMode ? 'border-slate-700' : 'border-white'}`}>
                {/* Cover Image */}
                <div className={`h-64 ${COVERS[coverIndex]} relative transition-all duration-700 ease-in-out`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <button
                        onClick={handleEditCover}
                        className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold flex items-center hover:bg-white/30 transition-all border border-white/30 shadow-lg hover:scale-105 active:scale-95"
                    >
                        <Camera size={16} className="mr-2" /> Change Cover
                    </button>
                </div>

                {/* Profile Info Section */}
                <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} px-8 pb-8 relative`}>
                    <div className="flex flex-col md:flex-row justify-between items-end -mt-20 mb-6">
                        <div className="flex items-end relative">
                            <div className="relative group/avatar">
                                <img
                                    src={user.avatar}
                                    style={{ viewTransitionName: 'profile-avatar' }}
                                    alt="Profile"
                                    className={`w-40 h-40 rounded-[2rem] border-[6px] ${isDarkMode ? 'border-slate-900' : 'border-white'} shadow-2xl object-cover bg-slate-800`}
                                />
                                <button className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full text-white shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-all hover:scale-110">
                                    <Camera size={16} />
                                </button>
                            </div>

                            <div className="ml-6 mb-3">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`${inputClass} text-2xl font-bold w-full md:w-80`}
                                        />
                                        <p className={textSecondary}>{user.email}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h1 className={`text-4xl font-extrabold tracking-tight ${textPrimary}`}>{formData.name}</h1>
                                        <p className={`font-medium ${textSecondary}`}>{user.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6 md:mt-0">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className={`px-6 py-2.5 rounded-xl font-bold transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all flex items-center"
                                    >
                                        <Save size={18} className="mr-2" /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'} shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                                >
                                    <Edit2 size={18} className="mr-2" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200/10">
                        <div className="flex items-center text-sm font-medium text-slate-400 group">
                            <div className={`p-2 rounded-lg mr-3 transition-colors ${isDarkMode ? 'bg-slate-800 group-hover:bg-blue-500/20' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                <Shield size={18} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider font-bold">Role</p>
                                <p className={`${textPrimary} capitalize font-semibold`}>{user.role.toLowerCase()}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-sm font-medium text-slate-400 group">
                            <div className={`p-2 rounded-lg mr-3 transition-colors ${isDarkMode ? 'bg-slate-800 group-hover:bg-blue-500/20' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                <Phone size={18} className="text-blue-500" />
                            </div>
                            <div className="w-full">
                                <p className="text-xs opacity-60 uppercase tracking-wider font-bold">Phone</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`mt-1 text-sm py-1 px-2 ${inputClass}`}
                                    />
                                ) : (
                                    <p className={`${textPrimary} font-semibold`}>{formData.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center text-sm font-medium text-slate-400 group">
                            <div className={`p-2 rounded-lg mr-3 transition-colors ${isDarkMode ? 'bg-slate-800 group-hover:bg-blue-500/20' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                <MapPin size={18} className="text-blue-500" />
                            </div>
                            <div className="w-full">
                                <p className="text-xs opacity-60 uppercase tracking-wider font-bold">Location</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={`mt-1 text-sm py-1 px-2 ${inputClass}`}
                                    />
                                ) : (
                                    <p className={`${textPrimary} font-semibold`}>{formData.location}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center text-sm font-medium text-slate-400 group">
                            <div className={`p-2 rounded-lg mr-3 transition-colors ${isDarkMode ? 'bg-slate-800 group-hover:bg-blue-500/20' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                <Calendar size={18} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider font-bold">Joined</p>
                                <p className={`${textPrimary} font-semibold`}>Jan 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col - Stats/Bio */}
                <div className="space-y-6">
                    {/* Bio Card */}
                    <div className={`p-6 rounded-3xl shadow-lg border ${cardClass}`}>
                        <h3 className={`font-bold mb-4 ${textPrimary} flex items-center`}>
                            Using Bio
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className={`${inputClass} resize-none`}
                            />
                        ) : (
                            <p className={`${textSecondary} leading-relaxed`}>
                                {formData.bio}
                            </p>
                        )}
                    </div>

                    {user.role === UserRole.STAFF && (
                        <div className={`p-6 rounded-3xl shadow-lg border ${cardClass}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`font-bold ${textPrimary}`}>Gamification</h3>
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                                    {user.points} XP
                                </span>
                            </div>
                            <div className="space-y-4">
                                {user.badges?.map((badge, idx) => (
                                    <div key={idx} className={`flex items-center p-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-blue-50'}`}>
                                        <div className="p-2 bg-amber-500/10 rounded-xl mr-3">
                                            <Award size={20} className="text-amber-500" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${textPrimary}`}>{badge}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Earned recently</p>
                                        </div>
                                    </div>
                                ))}
                                {(!user.badges || user.badges.length === 0) && (
                                    <p className="text-sm text-slate-500 text-center py-4">No badges yet. Start solving complaints!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Middle/Right Col - Account Settings */}
                <div className="md:col-span-2 space-y-6">
                    <div className={`p-8 rounded-3xl shadow-lg border ${cardClass}`}>
                        <h3 className={`font-bold text-xl mb-6 ${textPrimary}`}>Account Settings</h3>
                        <div className="space-y-4">
                            <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:bg-slate-500/5 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div>
                                    <p className={`font-bold ${textPrimary}`}>Two-Factor Authentication</p>
                                    <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account</p>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${true ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-300'}`}>
                                    <div className="w-6 h-6 bg-white rounded-full shadow-md transform translate-x-6"></div>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:bg-slate-500/5 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div>
                                    <p className={`font-bold ${textPrimary}`}>Email Notifications</p>
                                    <p className="text-sm text-slate-500 mt-1">Receive daily summaries and alerts</p>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${true ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-300'}`}>
                                    <div className="w-6 h-6 bg-white rounded-full shadow-md transform translate-x-6"></div>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:bg-slate-500/5 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div>
                                    <p className={`font-bold ${textPrimary}`}>Public Profile</p>
                                    <p className="text-sm text-slate-500 mt-1">Allow others to see your gamification stats</p>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${false ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-600'}`}>
                                    <div className="w-6 h-6 bg-white rounded-full shadow-md transform translate-x-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
