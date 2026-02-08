
import React from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockService';
import { Shield, Users, User as UserIcon, Lock, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleRoleLogin = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl max-w-4xl w-full z-10 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side - Brand */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <Shield className="text-white" size={24} />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Enterprise CMS</h1>
            </div>
            <p className="text-blue-200 mb-8 text-lg">
                Streamline your complaint resolution workflow with AI-driven insights and real-time tracking.
            </p>
            <div className="space-y-4">
                <div className="flex items-center text-sm text-blue-100/80">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3"><Lock size={14}/></div>
                    Enterprise Grade Security
                </div>
                <div className="flex items-center text-sm text-blue-100/80">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3"><Users size={14}/></div>
                    Multi-Role Architecture
                </div>
            </div>
        </div>

        {/* Right Side - Login Options */}
        <div className="md:w-1/2 p-8 bg-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">Select Role to Login</h2>
            <div className="space-y-4">
                <button 
                    onClick={() => handleRoleLogin(UserRole.ADMIN)}
                    className="w-full group bg-white hover:bg-blue-50 p-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-between"
                >
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white mr-4 group-hover:bg-blue-600 transition-colors">
                            <Shield size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-800">Admin Portal</p>
                            <p className="text-xs text-slate-500">admin@cms.com</p>
                        </div>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                </button>

                <button 
                    onClick={() => handleRoleLogin(UserRole.STAFF)}
                    className="w-full group bg-white hover:bg-blue-50 p-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-between"
                >
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white mr-4">
                            <Users size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-800">Staff Dashboard</p>
                            <p className="text-xs text-slate-500">sarah.staff@cms.com</p>
                        </div>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" size={20} />
                </button>

                <button 
                    onClick={() => handleRoleLogin(UserRole.CUSTOMER)}
                    className="w-full group bg-white hover:bg-blue-50 p-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-between"
                >
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white mr-4">
                            <UserIcon size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-800">Customer View</p>
                            <p className="text-xs text-slate-500">john.doe@gmail.com</p>
                        </div>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" size={20} />
                </button>
            </div>
            <p className="text-xs text-center text-white/40 mt-8">
                &copy; 2024 Enterprise CMS. All rights reserved.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
