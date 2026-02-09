
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'complaints', label: 'All Complaints', icon: List, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'my-complaints', label: 'My Complaints', icon: List, roles: [UserRole.STUDENT, UserRole.VICTIM] },
    { id: 'create-complaint', label: 'New Complaint', icon: FileText, roles: [UserRole.STUDENT, UserRole.VICTIM] },
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
    <div className={`flex h-screen overflow-hidden font-sans relative ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* iOS 26 Global Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px] animate-pulse mix-blend-screen transition-opacity duration-700 ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-400/20'}`} style={{ animationDuration: '10s' }} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] animate-pulse mix-blend-screen transition-opacity duration-700 ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-400/20'}`} style={{ animationDuration: '15s', animationDelay: '2s' }} />
        <div className={`absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full blur-[80px] animate-bounce mix-blend-screen transition-opacity duration-700 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-400/20'}`} style={{ animationDuration: '20s' }} />
      </div>

      {/* Sidebar - iOS 26 Style */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-24'} m-4 rounded-[32px] flex flex-col transition-all duration-300 z-50 flex-shrink-0 relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 text-white border border-white/10' : 'bg-white/90 text-slate-800 border border-slate-200/50 shadow-xl'} backdrop-blur-xl`}
      >
        <div className={`p-6 flex items-center justify-between h-24 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200/50'}`}>
          <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0 transition-all duration-300 ${isSidebarOpen ? 'bg-blue-600 shadow-blue-600/30' : `bg-transparent border ${isDarkMode ? 'border-white/20' : 'border-slate-300'}`}`}>
              E
            </div>
            {isSidebarOpen && <span className="text-xl font-bold tracking-tight whitespace-nowrap animate-in fade-in duration-200 drop-shadow-sm">Enterprise</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2.5 rounded-[12px] transition-colors ${isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-3 w-full p-4 rounded-[20px] transition-all duration-300 group relative ${currentPage === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                : isDarkMode
                  ? 'text-white/60 hover:bg-white/10 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${!isSidebarOpen && 'justify-center'}`}
            >
              <item.icon size={22} className={currentPage === item.id ? 'text-white' : isDarkMode ? 'text-white/60 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'} />
              {isSidebarOpen && <span className="font-medium text-[15px] animate-in fade-in duration-200">{item.label}</span>}
              {!isSidebarOpen && currentPage === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-slate-200/50 bg-slate-50/50'} backdrop-blur-sm`}>
          <div
            className={`flex items-center space-x-3 mb-4 p-3 rounded-2xl border cursor-pointer transition ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/80 border-slate-200/50 hover:bg-slate-100'} ${!isSidebarOpen && 'justify-center'}`}
            onClick={() => onNavigate('profile')}
          >
            <img src={user.avatar} alt="User" className={`w-10 h-10 rounded-full border object-cover ${isDarkMode ? 'border-white/20' : 'border-slate-200'}`} />
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                <p className="text-xs text-blue-400 uppercase font-bold tracking-wider">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogoutClick}
            className={`flex items-center space-x-2 w-full p-3 transition-colors rounded-xl ${isDarkMode ? 'text-white/40 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'} ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0 z-10">
        {/* Glass Header */}
        <header className={`h-24 glass-header flex items-center justify-between px-8 z-40 sticky top-0 w-full transition-all duration-300`}>
          <div className="flex items-center">
            <h2 className={`text-3xl font-bold capitalize tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {currentPage.replace('-', ' ')}
            </h2>
            {/* Search Bar - Glass */}
            <div className={`ml-12 hidden md:flex items-center rounded-2xl px-5 py-3 w-72 border transition-all focus-within:ring-2 focus-within:ring-blue-500/50 ${isDarkMode ? 'glass input-glass border-white/10' : 'bg-slate-100/80 border-slate-200/50 hover:bg-slate-200/50'}`}>
              <Search size={18} className={isDarkMode ? 'text-white/40 mr-3' : 'text-slate-400 mr-3'} />
              <input
                type="text"
                placeholder="Quick search..."
                className={`bg-transparent border-none focus:outline-none text-sm w-full ${isDarkMode ? 'placeholder-white/30 text-white' : 'placeholder-slate-400 text-slate-900'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Gamification Badge for Staff */}
            {user.role === UserRole.STAFF && (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" title="Your current points">
                <span className="font-bold text-sm">🏆 {user.points} pts</span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
                className={`relative p-3 rounded-full transition-all duration-300 ${showNotifications ? 'bg-blue-500/20 text-blue-400' : isDarkMode ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className={`absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)] ${isDarkMode ? 'border-black' : 'border-white'}`}></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-6 w-96 rounded-[32px] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 glass-card">
                  <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Notifications</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/20">{unreadCount} New</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-white/40 text-sm">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 rounded-2xl mb-2 transition-all duration-200 ${!n.read ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${n.type === 'alert' ? 'bg-red-500/20 text-red-300' :
                              n.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                              }`}>
                              {n.type}
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">{n.time}</span>
                          </div>
                          <p className={`text-sm my-2 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{n.message}</p>
                          {!n.read && (
                            <button
                              onClick={() => onMarkRead(n.id)}
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center transition-colors"
                            >
                              <Check size={12} className="mr-1" /> Mark as read
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
                className={`p-3 rounded-full transition-all duration-300 ${showSettings ? 'bg-blue-500/20 text-blue-400' : isDarkMode ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Settings size={24} />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-6 w-72 rounded-[32px] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 glass-card">
                  <div className="p-5 border-b border-white/5 bg-white/5">
                    <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Quick Settings</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    <button
                      onClick={() => handleSettingsAction('Profile')}
                      className="w-full text-left px-4 py-3 text-sm rounded-xl flex items-center transition-colors text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <User size={18} className="mr-3 text-white/40" /> Profile
                    </button>
                    <button
                      onClick={() => handleSettingsAction('Notification')}
                      className="w-full text-left px-4 py-3 text-sm rounded-xl flex items-center transition-colors text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <Bell size={18} className="mr-3 text-white/40" /> Notification Prefs
                    </button>
                    <div className="h-px bg-white/10 my-2 mx-2"></div>
                    <div
                      onClick={() => { toggleDarkMode(); setShowSettings(false); }}
                      className="px-4 py-3 flex items-center justify-between cursor-pointer rounded-xl transition-colors hover:bg-white/10"
                    >
                      <div className="flex items-center text-sm text-white/70">
                        {isDarkMode ? <Moon size={18} className="mr-3 text-blue-400" /> : <Sun size={18} className="mr-3 text-amber-400" />}
                        Dark Mode
                      </div>
                      <div className={`w-10 h-6 rounded-full relative transition-colors border border-white/10 ${isDarkMode ? 'bg-blue-600' : 'bg-white/20'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-transform duration-300 ${isDarkMode ? 'left-5' : 'left-1'}`}></div>
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
