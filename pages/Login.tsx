
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockService';
import { Shield, Users, User as UserIcon, Lock, ArrowRight, Mail, Key, AlertCircle } from 'lucide-react';

interface LoginProps {
    onLogin: (user: User) => void;
}

type LoginTab = 'admin' | 'staff' | 'student';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState<LoginTab>('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const credentials = {
        admin: { email: 'admin@cms.com', password: 'admin123', role: UserRole.ADMIN },
        staff: { email: 'sarah.staff@cms.com', password: 'staff123', role: UserRole.STAFF },
        student: { email: 'student@university.edu', password: 'student123', role: UserRole.STUDENT }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const creds = credentials[activeTab];
            if (email === creds.email && password === creds.password) {
                const user = MOCK_USERS.find(u => u.role === creds.role);
                if (user) {
                    onLogin(user);
                }
            } else {
                setError('Invalid email or password. Please try again.');
            }
            setIsLoading(false);
        }, 800);
    };

    const fillCredentials = () => {
        const creds = credentials[activeTab];
        setEmail(creds.email);
        setPassword(creds.password);
        setError('');
    };

    const tabConfig = {
        admin: {
            icon: Shield,
            label: 'Admin',
            color: 'blue',
            gradient: 'from-blue-600 to-blue-800'
        },
        staff: {
            icon: Users,
            label: 'Staff',
            color: 'purple',
            gradient: 'from-purple-600 to-purple-800'
        },
        student: {
            icon: UserIcon,
            label: 'Student / Victim',
            color: 'emerald',
            gradient: 'from-emerald-600 to-emerald-800'
        }
    };

    const currentTab = tabConfig[activeTab];
    const TabIcon = currentTab.icon;

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl max-w-md w-full z-10 overflow-hidden">

                {/* Header */}
                <div className={`bg-gradient-to-r ${currentTab.gradient} p-8 text-center`}>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                            <TabIcon className="text-white" size={24} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
                        {currentTab.label} Portal
                    </h1>
                    <p className="text-white/70 text-sm">
                        Complaint Management System
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    {(['admin', 'staff', 'student'] as LoginTab[]).map((tab) => {
                        const config = tabConfig[tab];
                        const Icon = config.icon;
                        return (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setEmail(''); setPassword(''); setError(''); }}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab
                                        ? 'bg-white/10 text-white border-b-2 border-white'
                                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="hidden sm:inline">{config.label.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm mb-2">Password</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-gradient-to-r ${currentTab.gradient} text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    {/* Demo credentials helper */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={fillCredentials}
                            className="text-white/50 text-sm hover:text-white/80 transition-colors underline"
                        >
                            Use demo credentials
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-white/40 text-xs mb-2">Demo Credentials:</p>
                        <p className="text-white/60 text-xs font-mono">
                            {credentials[activeTab].email}
                        </p>
                        <p className="text-white/40 text-xs font-mono">
                            Password: {credentials[activeTab].password}
                        </p>
                    </div>
                </form>

                <div className="px-8 pb-6">
                    <p className="text-xs text-center text-white/30">
                        &copy; 2026 Enterprise CMS. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
