
import React from 'react';
import { User, UserRole } from '../types';
import { Mail, Shield, Award, Calendar, Phone, MapPin, Edit2 } from 'lucide-react';

interface ProfileProps {
    user: User;
    isDarkMode: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, isDarkMode }) => {
    const cardClass = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Cover */}
            <div className={`rounded-3xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-white/30 transition">
                        <Edit2 size={16} className="mr-2" /> Edit Cover
                    </button>
                </div>
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} px-8 pb-8`}>
                    <div className="flex flex-col md:flex-row justify-between items-end -mt-16 mb-6">
                        <div className="flex items-end">
                            <img
                                src={user.avatar}
                                alt="Profile"
                                className={`w-32 h-32 rounded-3xl border-4 ${isDarkMode ? 'border-slate-800' : 'border-white'} shadow-xl object-cover`}
                            />
                            <div className="ml-6 mb-2">
                                <h1 className={`text-3xl font-bold ${textPrimary}`}>{user.name}</h1>
                                <p className={textSecondary}>{user.email}</p>
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-4 md:mt-0">
                            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-200/20">
                        <div className="flex items-center text-sm font-medium text-slate-400">
                            <Shield size={16} className="mr-2 text-blue-500" />
                            Role: <span className={`ml-1 ${textPrimary} capitalize`}>{user.role.toLowerCase()}</span>
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-400">
                            <Mail size={16} className="mr-2 text-blue-500" />
                            {user.email}
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-400">
                            <Phone size={16} className="mr-2 text-blue-500" />
                            +1 (555) 000-0000
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-400">
                            <MapPin size={16} className="mr-2 text-blue-500" />
                            New York, USA
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-400">
                            <Calendar size={16} className="mr-2 text-blue-500" />
                            Joined: Jan 2026
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col - Stats/Badges */}
                <div className="space-y-6">
                    {user.role === UserRole.STAFF && (
                        <div className={`p-6 rounded-2xl shadow-sm border ${cardClass}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`font-bold ${textPrimary}`}>Gamification</h3>
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {user.points} XP
                                </span>
                            </div>
                            <div className="space-y-4">
                                {user.badges?.map((badge, idx) => (
                                    <div key={idx} className={`flex items-center p-3 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                        <Award size={24} className="text-amber-500 mr-3" />
                                        <div>
                                            <p className={`text-sm font-bold ${textPrimary}`}>{badge}</p>
                                            <p className="text-xs text-slate-500">Earned recently</p>
                                        </div>
                                    </div>
                                ))}
                                {(!user.badges || user.badges.length === 0) && (
                                    <p className="text-sm text-slate-500">No badges yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Middle/Right Col - Activity */}
                <div className="md:col-span-2 space-y-6">
                    <div className={`p-6 rounded-2xl shadow-sm border ${cardClass}`}>
                        <h3 className={`font-bold mb-6 ${textPrimary}`}>Account Settings</h3>
                        <div className="space-y-4">
                            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                <div>
                                    <p className={`font-bold text-sm ${textPrimary}`}>Two-Factor Authentication</p>
                                    <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${true ? 'bg-green-500' : 'bg-slate-300'}`}>
                                    <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-6"></div>
                                </div>
                            </div>
                            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                <div>
                                    <p className={`font-bold text-sm ${textPrimary}`}>Email Notifications</p>
                                    <p className="text-xs text-slate-500">Receive daily summaries and alerts</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${true ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                    <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-6"></div>
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
