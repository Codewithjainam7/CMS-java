
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ComplaintList from './pages/ComplaintList';
import ComplaintDetail from './pages/ComplaintDetail';
import CreateComplaint from './pages/CreateComplaint';
import JavaSourceViewer from './pages/JavaSourceViewer';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { User, UserRole, Complaint, ComplaintStatus, Notification } from './types';
import { MOCK_COMPLAINTS, calculateSLA } from './services/mockService';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [currentPage, setCurrentPage] = useState('dashboard');
    const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', message: 'New complaint "Internet Failure" registered.', read: false, time: '2 mins ago', type: 'info' },
        { id: '2', message: 'SLA Breach imminent for Ticket #204.', read: false, time: '1 hour ago', type: 'alert' }
    ]);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
        // Ensure we start fresh
        setSelectedComplaintId(null);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    const addNotification = (msg: string, type: 'info' | 'alert' | 'success' = 'info') => {
        const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            message: msg,
            read: false,
            time: 'Just now',
            type
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const handleMarkRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleNavigate = (page: string) => {
        setCurrentPage(page);
        setSelectedComplaintId(null);
    };

    const handleSelectComplaint = (id: string) => {
        setSelectedComplaintId(id);
    };

    const handleSubmitComplaint = (data: any) => {
        const newId = `CMP-2024-${(complaints.length + 1).toString().padStart(5, '0')}`;
        const newComplaint: Complaint = {
            id: newId,
            ...data,
            status: ComplaintStatus.NEW,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            slaDeadline: calculateSLA(data.priority),
            customerId: currentUser?.id || 'unknown',
            customerName: currentUser?.name || 'Unknown'
        };
        setComplaints([newComplaint, ...complaints]);
        addNotification(`New Complaint Created: ${newId}`, 'info');
        handleNavigate('complaints');
    };

    const handleStatusChange = (id: string, newStatus: ComplaintStatus) => {
        setComplaints(complaints.map(c =>
            c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
        ));
        if (newStatus === ComplaintStatus.RESOLVED) {
            addNotification(`Complaint ${id} marked as RESOLVED`, 'success');
        }
    };

    if (!isAuthenticated || !currentUser) {
        return <Login onLogin={handleLogin} />;
    }

    const renderContent = () => {
        if (selectedComplaintId) {
            const complaint = complaints.find(c => c.id === selectedComplaintId);
            if (complaint) return (
                <ComplaintDetail
                    complaint={complaint}
                    currentUser={currentUser}
                    onBack={() => setSelectedComplaintId(null)}
                    onStatusChange={handleStatusChange}
                    isDarkMode={isDarkMode}
                />
            );
        }

        switch (currentPage) {
            case 'dashboard': return <Dashboard user={currentUser} complaints={complaints} isDarkMode={isDarkMode} />;
            case 'reports': return <Reports complaints={complaints} isDarkMode={isDarkMode} />;
            case 'profile': return <Profile user={currentUser} isDarkMode={isDarkMode} />;
            case 'complaints': return (
                <div className="relative">
                    {currentUser.role !== UserRole.STUDENT && (
                        <ComplaintList
                            complaints={complaints}
                            onSelect={handleSelectComplaint}
                            isAdmin={currentUser.role === UserRole.ADMIN}
                            isDarkMode={isDarkMode}
                        />
                    )}
                    {currentUser.role === UserRole.STUDENT && (
                        <div className={`text-center py-20 rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Need to raise an issue?</h2>
                            <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>We are here to help you resolve your problems quickly.</p>
                            <button onClick={() => setCurrentPage('create-complaint')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all">Submit New Complaint</button>
                        </div>
                    )}
                </div>
            );
            case 'my-complaints':
                const myComplaints = complaints.filter(c => c.customerId === currentUser.id);
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-600/20">
                            <div>
                                <h2 className="text-xl font-bold">My Complaints</h2>
                                <p className="text-blue-100 text-sm">Track the status of your reported issues</p>
                            </div>
                            <button
                                onClick={() => handleNavigate('create-complaint')}
                                className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition"
                            >
                                + New Complaint
                            </button>
                        </div>
                        {myComplaints.length > 0 ? (
                            <ComplaintList
                                complaints={myComplaints}
                                onSelect={handleSelectComplaint}
                                isAdmin={false}
                                isDarkMode={isDarkMode}
                            />
                        ) : (
                            <div className="text-center py-20 text-slate-400">You haven't submitted any complaints yet.</div>
                        )}
                    </div>
                );
            case 'create-complaint': return <CreateComplaint onSubmit={handleSubmitComplaint} onCancel={() => handleNavigate('dashboard')} />;
            case 'java-source': return <JavaSourceViewer />;
            default: return <div>Page not found</div>;
        }
    };

    return (
        <Layout
            user={currentUser}
            onLogout={handleLogout}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            notifications={notifications}
            onMarkRead={handleMarkRead}
            addNotification={addNotification}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        >
            {renderContent()}
        </Layout>
    );
};

export default App;
