
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockService';
import { Shield, Users, User as UserIcon, Lock, ArrowRight, Mail, Key, AlertCircle, Apple, Chrome, Smartphone, Globe } from 'lucide-react';

interface LoginProps {
    onLogin: (user: User) => void;
}

type LoginTab = 'admin' | 'staff' | 'student';
type AuthMode = 'signin' | 'signup';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState<LoginTab>('admin');
    const [authMode, setAuthMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
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
            // Mock Sign Up Logic
            if (authMode === 'signup' && activeTab === 'student') {
                // In a real app, this would create a user
                // For now, we simulate success and log them in as a generic student
                const mockNewUser: User = {
                    id: `new-${Date.now()}`,
                    name: name || 'New Student',
                    email: email,
                    role: UserRole.STUDENT,
                    avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
                };
                onLogin(mockNewUser);
                setIsLoading(false);
                return;
            }

            // Login Logic
            const creds = credentials[activeTab];
            if (email === creds.email && password === creds.password) {
                const user = MOCK_USERS.find(u => u.role === creds.role);
                if (user) {
                    onLogin(user);
                }
            } else {
                // Fallback for demo: allow login if it matches the mock user email even if password differs in mock
                // But for strictness let's keep it simple
                const user = MOCK_USERS.find(u => u.email === email && u.role === (activeTab === 'student' ? UserRole.STUDENT : activeTab === 'staff' ? UserRole.STAFF : UserRole.ADMIN));
                if (user && password === 'demo') { // Secret demo password
                    onLogin(user);
                } else {
                    setError('Invalid credentials. Please use demo account.');
                }
            }
            setIsLoading(false);
        }, 1500); // Slower for effect
    };

    const fillCredentials = () => {
        const creds = credentials[activeTab];
        setEmail(creds.email);
        setPassword(creds.password);
        setError('');
        setAuthMode('signin');
    };

    const tabConfig = {
        admin: { icon: Shield, label: 'Admin', color: 'bg-blue-500/20 text-blue-300' },
        staff: { icon: Users, label: 'Staff', color: 'bg-purple-500/20 text-purple-300' },
        student: { icon: UserIcon, label: 'Student', color: 'bg-emerald-500/20 text-emerald-300' }
    };

    // iOS 26 Theme - Glassmorphism & Animations
    // Using inline styles for complex mesh gradients and keyframes not in Tailwind config

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-white/30">

            {/* iOS 26 Animated Mesh Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/30 rounded-full blur-[100px] animate-pulse mix-blend-screen" style={{ animationDuration: '10s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-purple-600/20 rounded-full blur-[120px] animate-pulse mix-blend-screen" style={{ animationDuration: '15s', animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full blur-[80px] animate-bounce mix-blend-screen" style={{ animationDuration: '20s' }} />
                <style>{`
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .glass-panel {
                background: rgba(25, 25, 35, 0.4);
                backdrop-filter: blur(40px) saturate(180%);
                -webkit-backdrop-filter: blur(40px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .input-glass {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .input-glass:focus {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
            }
            .btn-glow:hover {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
            }
        `}</style>
            </div>

            <div className="glass-panel w-full max-w-[420px] rounded-[32px] p-8 z-10 relative overflow-hidden transition-all duration-500 transform hover:scale-[1.005]">

                {/* Top Indicator */}
                <div className="mx-auto w-12 h-1.5 bg-white/20 rounded-full mb-8"></div>

                {/* Dynamic Header */}
                <div className="text-center mb-8 relative">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${tabConfig[activeTab].color} backdrop-blur-md shadow-2xl ring-1 ring-white/10`}>
                        {React.createElement(tabConfig[activeTab].icon, { size: 32, strokeWidth: 1.5 })}
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-white/40 font-medium">
                        {activeTab === 'student' ? 'Student & Victim Support Portal' : 'Secure Enterprise Access'}
                    </p>
                </div>

                {/* Role Selector (Segmented Control) */}
                <div className="bg-black/20 p-1 rounded-2xl flex mb-8 relative border border-white/5 mx-auto max-w-[320px]">
                    {(['admin', 'staff', 'student'] as LoginTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setAuthMode('signin'); setError(''); }}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300 relative z-10 ${activeTab === tab ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && (
                                <div className="absolute inset-0 bg-white/10 rounded-xl z-[-1] backdrop-blur-sm shadow-sm border border-white/5 animate-in fade-in zoom-in-95 duration-200" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Sign In / Sign Up Form */}
                <form onSubmit={handleSubmit} className="space-y-5 relative">

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Student Sign Up Name Field */}
                    {activeTab === 'student' && authMode === 'signup' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="relative group">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-white" size={20} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full Name"
                                    className="input-glass w-full rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none text-[15px] font-medium"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-white" size={20} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={activeTab === 'student' ? "University Email" : "Enterprise ID"}
                            className="input-glass w-full rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none text-[15px] font-medium"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-white" size={20} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="input-glass w-full rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none text-[15px] font-medium"
                            required
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black py-4 rounded-2xl font-bold text-[15px] shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 transform active:scale-[0.98] btn-glow flex items-center justify-center gap-2 relative overflow-hidden"
                        >
                            {isLoading && <div className="absolute inset-0 bg-white/50 animate-pulse z-10" />}
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        {/* Google Auth Button (Students Only) */}
                        {activeTab === 'student' && (
                            <button
                                type="button"
                                className="w-full bg-white/5 hover:bg-white/10 input-glass text-white py-4 rounded-2xl font-medium text-[15px] transition-all duration-300 flex items-center justify-center gap-3 group"
                            >
                                <Globe className="text-white/60 group-hover:text-white transition-colors" size={20} />
                                Continue with Google
                            </button>
                        )}

                        <div className="flex justify-between items-center text-xs text-white/40 pt-2 px-2">
                            <button type="button" onClick={fillCredentials} className="hover:text-white transition-colors">
                                Use Demo Credentials
                            </button>
                            {activeTab === 'student' && (
                                <button
                                    type="button"
                                    onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                                    className="hover:text-white transition-colors"
                                >
                                    {authMode === 'signin' ? 'No account? Sign up' : 'Already have an account?'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Bottom Texture */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-b-[32px]" />
            </div>

            <div className="fixed bottom-6 text-white/20 text-xs tracking-wider">
                iOS 26 GLASSMORPHIC THEME • v3.0
            </div>
        </div>
    );
};

export default Login;
