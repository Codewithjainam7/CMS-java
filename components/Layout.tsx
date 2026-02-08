
import React, { useState } from 'react';
import { LayoutDashboard, List, FileText, Settings, LogOut, Code, Bell, Menu, X, Check, Search, User, Moon, Sun } from 'lucide-react';
import { User as UserType, UserRole, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  addNotification: (msg: string, type: 'info' | 'alert' | 'success') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
    children, user, onLogout, currentPage, onNavigate, 
    notifications, onMarkRead, addNotification, isDarkMode, toggleDarkMode 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER] },
    { id: 'complaints', label: 'All Complaints', icon: List, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'my-complaints', label: 'My Complaints', icon: List, roles: [UserRole.CUSTOMER] },
    { id: 'reports', label: 'Analytics & Reports', icon: FileText, roles: [UserRole.ADMIN] },
    { id: 'java-source', label: 'Backend Source', icon: Code, roles: [UserRole.ADMIN, UserRole.STAFF] },
  ];

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  const handleSettingsAction = (action: string) => {
    if (action === 'Profile') {
        onNavigate('profile');
    } else {
        addNotification(`${action} settings opened (Demo)`, 'info');
    }
    setShowSettings(false);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-800'}`}>
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300 z-50 flex-shrink-0 relative border-r border-slate-800`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800/50 h-20">
          <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20 shrink-0">
              E
            </div>
            {isSidebarOpen && <span className="text-lg font-bold tracking-tight whitespace-nowrap animate-in fade-in duration-200">Enterprise CMS</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-3 w-full p-3.5 rounded-xl transition-all duration-200 group relative ${
                currentPage === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} className={currentPage === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              {isSidebarOpen && <span className="font-medium text-sm animate-in fade-in duration-200">{item.label}</span>}
              {!isSidebarOpen && currentPage === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-blue-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div 
             className={`flex items-center space-x-3 mb-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition ${!isSidebarOpen && 'justify-center'}`}
             onClick={() => onNavigate('profile')} 
          >
            <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-600 object-cover" />
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                <p className="text-xs text-blue-400 uppercase font-bold tracking-wider">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogoutClick}
            className={`flex items-center space-x-2 text-slate-400 hover:text-red-400 w-full p-2 transition-colors rounded-lg hover:bg-red-400/10 ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        {/* Top Header */}
        <header className={`h-20 backdrop-blur-md border-b flex items-center justify-between px-8 z-40 sticky top-0 w-full ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-gray-200/50'}`}>
          <div className="flex items-center">
            <h2 className={`text-2xl font-bold capitalize tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {currentPage.replace('-', ' ')}
            </h2>
            {/* Search Bar - Hidden on mobile */}
            <div className={`ml-12 hidden md:flex items-center rounded-full px-4 py-2 w-64 border transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus-within:border-blue-500' : 'bg-gray-100 border-transparent focus-within:bg-white focus-within:border-blue-300'}`}>
                <Search size={18} className="text-gray-400 mr-2"/>
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="bg-transparent border-none focus:outline-none text-sm w-full placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
             {/* Gamification Badge for Staff */}
            {user.role === UserRole.STAFF && (
              <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border shadow-sm cursor-help ${isDarkMode ? 'bg-amber-900/30 border-amber-800 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-700'}`} title="Your current points">
                 <span className="font-bold text-sm">🏆 {user.points} pts</span>
              </div>
            )}
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
                className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-gray-100'}`}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 mt-4 w-80 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                  <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700 bg-slate-700/50' : 'border-gray-100 bg-gray-50/50'}`}>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Notifications</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-50 hover:bg-gray-50'} ${!n.read ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50/30') : ''}`}>
                           <div className="flex justify-between items-start mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                n.type === 'alert' ? 'bg-red-100 text-red-600' : 
                                n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {n.type.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-gray-400">{n.time}</span>
                           </div>
                           <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{n.message}</p>
                           {!n.read && (
                             <button 
                               onClick={() => onMarkRead(n.id)}
                               className="text-xs text-blue-500 hover:underline flex items-center"
                             >
                               <Check size={12} className="mr-1"/> Mark as read
                             </button>
                           )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative">
                <button 
                    onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
                    className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-blue-50 text-blue-600' : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-gray-100'}`}
                >
                   <Settings size={24} />
                </button>
                
                {showSettings && (
                    <div className={`absolute right-0 mt-4 w-64 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700 bg-slate-700/50' : 'border-gray-100 bg-gray-50/50'}`}>
                            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Quick Settings</h3>
                        </div>
                        <div className="p-2">
                            <button 
                                onClick={() => handleSettingsAction('Profile')}
                                className={`w-full text-left px-4 py-3 text-sm rounded-lg flex items-center transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-gray-50'}`}
                            >
                                <User size={16} className="mr-3 text-slate-400"/> Profile
                            </button>
                            <button 
                                onClick={() => handleSettingsAction('Notification')}
                                className={`w-full text-left px-4 py-3 text-sm rounded-lg flex items-center transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-gray-50'}`}
                            >
                                <Bell size={16} className="mr-3 text-slate-400"/> Notification Prefs
                            </button>
                            <div className={`h-px my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}></div>
                            <div 
                                onClick={() => { toggleDarkMode(); setShowSettings(false); }}
                                className={`px-4 py-2 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`flex items-center text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {isDarkMode ? <Moon size={16} className="mr-3 text-blue-500"/> : <Sun size={16} className="mr-3 text-amber-500"/>}
                                    Dark Mode
                                </div>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-0 transform transition-transform ${isDarkMode ? 'left-4' : 'left-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-0 custom-scrollbar">
           <div className="max-w-7xl mx-auto space-y-8 pb-12">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
