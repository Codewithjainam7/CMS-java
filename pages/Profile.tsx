
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Mail, Shield, Award, Calendar, Phone, MapPin, Edit2, Camera, Save, X, Eye } from 'lucide-react';

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

    const cardClass = 'glass-card text-white hover:bg-slate-800/50 transition-colors';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const inputClass = `w-full px-4 py-3 rounded-2xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500' : 'bg-slate-50/50 border-slate-200/50 text-slate-800'}`;

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
            <div className={`rounded-[40px] shadow-2xl overflow-hidden border relative group glass-panel border-white/10`}>
                {/* Cover Image */}
                <div className={`h-72 ${COVERS[coverIndex]} relative transition-all duration-700 ease-in-out`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:bg-black/30 transition-colors" />
                    <button
                        onClick={handleEditCover}
                        className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-xl text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center hover:bg-white/20 transition-all border border-white/20 shadow-xl hover:scale-105 active:scale-95"
                    >
                        <Camera size={18} className="mr-2" /> Change Cover
                    </button>
                </div>

                {/* Profile Info Section */}
                <div className={`px-10 pb-10 relative -mt-5`}>
                    <div className="flex flex-col md:flex-row justify-between items-end -mt-24 mb-8">
                        <div className="flex items-end relative">
                            <div className="relative group/avatar">
                                <img
                                    src={user.avatar}
                                    style={{ viewTransitionName: 'profile-avatar' }}
                                    alt="Profile"
                                    className={`w-44 h-44 rounded-[2.5rem] border-[8px] ${isDarkMode ? 'border-slate-900' : 'border-slate-50'} shadow-2xl object-cover bg-slate-800`}
                                />
                                <button className="absolute bottom-3 right-3 p-3 bg-blue-600 rounded-2xl text-white shadow-xl opacity-0 group-hover/avatar:opacity-100 transition-all hover:scale-110 hover:-translate-y-1">
                                    <Camera size={18} />
                                </button>
                            </div>

                            <div className="ml-8 mb-4">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`${inputClass} text-3xl font-bold w-full md:w-96 bg-black/20 border-white/10 text-white`}
                                        />
                                        <p className="text-slate-400 font-medium">{user.email}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow-md`}>{formData.name}</h1>
                                        <p className={`font-medium text-lg text-slate-300 flex items-center`}>
                                            <Mail size={16} className="mr-2 opacity-70" /> {user.email}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-4 mt-8 md:mt-0">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className={`px-8 py-3 rounded-2xl font-bold transition-all border border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all flex items-center"
                                    >
                                        <Save size={20} className="mr-2" /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center bg-white/10 text-white hover:bg-white/20 shadow-lg backdrop-blur-md border border-white/10`}
                                >
                                    <Edit2 size={20} className="mr-2" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 border-t border-white/5">
                        <div className="flex items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className={`p-3 rounded-xl mr-4 transition-colors bg-blue-500/20 text-blue-400 group-hover:scale-110`}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] opacity-60 uppercase tracking-wider font-bold text-slate-400">Role</p>
                                <p className={`text-white capitalize font-bold text-lg`}>{user.role.toLowerCase()}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className={`p-3 rounded-xl mr-4 transition-colors bg-purple-500/20 text-purple-400 group-hover:scale-110`}>
                                <Phone size={20} />
                            </div>
                            <div className="w-full">
                                <p className="text-[10px] opacity-60 uppercase tracking-wider font-bold text-slate-400">Phone</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`mt-1 text-sm py-1 px-2 ${inputClass} h-8 bg-transparent border-none p-0 focus:ring-0`}
                                    />
                                ) : (
                                    <p className={`text-white font-bold`}>{formData.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className={`p-3 rounded-xl mr-4 transition-colors bg-orange-500/20 text-orange-400 group-hover:scale-110`}>
                                <MapPin size={20} />
                            </div>
                            <div className="w-full">
                                <p className="text-[10px] opacity-60 uppercase tracking-wider font-bold text-slate-400">Location</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={`mt-1 text-sm py-1 px-2 ${inputClass} h-8 bg-transparent border-none p-0 focus:ring-0`}
                                    />
                                ) : (
                                    <p className={`text-white font-bold`}>{formData.location}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                            <div className={`p-3 rounded-xl mr-4 transition-colors bg-emerald-500/20 text-emerald-400 group-hover:scale-110`}>
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] opacity-60 uppercase tracking-wider font-bold text-slate-400">Joined</p>
                                <p className={`text-white font-bold`}>Jan 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col - Stats/Bio */}
                <div className="space-y-8">
                    {/* Bio Card */}
                    <div className={`p-8 rounded-[32px] glass-card border border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors"></div>
                        <h3 className={`font-bold text-xl mb-6 ${textPrimary} flex items-center relative z-10`}>
                            About Me
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={6}
                                className={`${inputClass} resize-none bg-black/10 border-white/10`}
                            />
                        ) : (
                            <p className={`${textSecondary} leading-relaxed relative z-10`}>
                                {formData.bio}
                            </p>
                        )}
                    </div>

                    {user.role === UserRole.STAFF && (
                        <div className={`p-8 rounded-[32px] glass-card border border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors"></div>
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h3 className={`font-bold text-xl ${textPrimary}`}>Gamification</h3>
                                <span className="bg-amber-500/20 text-amber-500 px-4 py-1.5 rounded-xl text-sm font-black border border-amber-500/20 shadow-lg shadow-amber-500/10">
                                    {user.points} XP
                                </span>
                            </div>
                            <div className="space-y-4 relative z-10">
                                {user.badges?.map((badge, idx) => (
                                    <div key={idx} className={`flex items-center p-4 rounded-2xl transition-all border border-transparent hover:border-white/10 ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800/60' : 'bg-white/40 hover:bg-white/60'}`}>
                                        <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mr-4 shadow-lg shadow-orange-500/20 text-white">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-lg ${textPrimary}`}>{badge}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Earned recently</p>
                                        </div>
                                    </div>
                                ))}
                                {(!user.badges || user.badges.length === 0) && (
                                    <p className="text-sm text-slate-500 text-center py-6 bg-black/5 rounded-2xl border border-dashed border-slate-600">No badges yet. Start solving complaints!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Middle/Right Col - Account Settings */}
                <div className="md:col-span-2 space-y-8">
                    <div className={`p-10 rounded-[40px] glass-card border border-white/10 relative overflow-hidden`}>
                        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                        <h3 className={`font-black text-2xl mb-8 ${textPrimary} flex items-center`}>Account Settings</h3>
                        <div className="space-y-5">
                            <div className={`flex items-center justify-between p-6 rounded-3xl border border-white/5 transition-all hover:bg-white/5 bg-white/5 backdrop-blur-sm group`}>
                                <div className="flex items-center">
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 mr-6 group-hover:scale-110 transition-transform">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-lg ${textPrimary}`}>Two-Factor Authentication</p>
                                        <p className="text-sm text-slate-400 mt-1">Add an extra layer of security to your account</p>
                                    </div>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${true ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-700'}`}>
                                    <div className="w-6 h-6 bg-white rounded-full shadow-md transform translate-x-6"></div>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between p-6 rounded-3xl border border-white/5 transition-all hover:bg-white/5 bg-white/5 backdrop-blur-sm group`}>
                                <div className="flex items-center">
                                    <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 mr-6 group-hover:scale-110 transition-transform">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-lg ${textPrimary}`}>Email Notifications</p>
                                        <p className="text-sm text-slate-400 mt-1">Receive daily summaries and alerts</p>
                                    </div>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${true ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-700'}`}>
                                    <div className="w-6 h-6 bg-white rounded-full shadow-md transform translate-x-6"></div>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between p-6 rounded-3xl border border-white/5 transition-all hover:bg-white/5 bg-white/5 backdrop-blur-sm group`}>
                                <div className="flex items-center">
                                    <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 mr-6 group-hover:scale-110 transition-transform">
                                        <Eye size={24} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-lg ${textPrimary}`}>Public Profile</p>
                                        <p className="text-sm text-slate-400 mt-1">Allow others to see your gamification stats</p>
                                    </div>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${false ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-800'}`}>
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
