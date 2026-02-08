
import React, { useState } from 'react';
import { Complaint, ComplaintStatus, UserRole, Priority } from '../types';
import { MOCK_USERS } from '../services/mockService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import {
    Download, FileText, Filter, Calendar, TrendingUp, AlertTriangle,
    CheckCircle, Users, Clock, ArrowUpRight, ArrowDownRight, Printer
} from 'lucide-react';

interface ReportsProps {
    complaints: Complaint[];
    isDarkMode: boolean;
}

const Reports: React.FC<ReportsProps> = ({ complaints, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'sla'>('overview');

    // --- Data Calculation Logic ---
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length;
    const slaBreached = complaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== ComplaintStatus.RESOLVED).length;
    const slaMet = total - slaBreached; // Simplified logic

    // Chart Data Construction
    const categoryData = ['Technical', 'Billing', 'Product', 'Service'].map(cat => ({
        name: cat,
        count: complaints.filter(c => c.category === cat).length
    }));

    const statusData = Object.values(ComplaintStatus).map(status => ({
        name: status,
        value: complaints.filter(c => c.status === status).length
    }));

    const priorityData = Object.values(Priority).map(p => ({
        name: p,
        count: complaints.filter(c => c.priority === p).length
    }));

    // Mock Avg Resolution Time (in hours) by Category
    const avgResolutionData = categoryData.map(c => ({
        name: c.name,
        hours: Math.floor(Math.random() * 12) + 2
    }));

    const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ef4444'];
    const PRIORITY_COLORS = ['#94a3b8', '#3b82f6', '#f97316', '#ef4444']; // Low, Medium, High, Critical

    // Staff Data Construction (Mocking some performance metrics based on assignedTo)
    const staffList = MOCK_USERS.filter(u => u.role === UserRole.STAFF).map(staff => {
        const assigned = complaints.filter(c => c.assignedTo === staff.id);
        const resolvedCount = assigned.filter(c => c.status === ComplaintStatus.RESOLVED).length;
        const avgTime = Math.floor(Math.random() * 5) + 1; // Mock random hours
        const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1); // Mock random rating
        return {
            ...staff,
            assignedCount: assigned.length,
            resolvedCount,
            avgTime,
            rating
        };
    });

    const handleExport = (type: string) => {
        alert(`Initiating ${type} download... (Demo Functionality)`);
    };

    // --- Styling Variables ---
    const cardClass = isDarkMode
        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm'
        : 'bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 backdrop-blur-sm shadow-xl';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
    const tooltipStyle = {
        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
        borderRadius: '16px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        padding: '12px 16px',
        color: isDarkMode ? '#fff' : '#000'
    };

    const ExportButton = ({ icon: Icon, label, color, type }: any) => (
        <button
            onClick={() => handleExport(type)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 ${color}`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );

    const StatCard = ({ label, value, subtext, trend }: any) => (
        <div className={`relative overflow-hidden p-6 rounded-3xl shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${cardClass}`}>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl" />
            <p className={`text-sm font-medium mb-2 ${textSecondary}`}>{label}</p>
            <div className="flex items-end justify-between">
                <h3 className={`text-3xl font-extrabold tracking-tight ${textPrimary}`}>{value}</h3>
                {trend && (
                    <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm ${trend > 0 ? 'bg-green-500/10 text-green-500 ring-1 ring-green-500/20' : 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className={`text-xs mt-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{subtext}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className={`relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl shadow-xl border ${cardClass}`}>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
                <div>
                    <h1 className={`text-3xl font-extrabold tracking-tight ${textPrimary}`}>Analytics & Reports</h1>
                    <p className={`mt-2 text-lg ${textSecondary}`}>Comprehensive insights into system performance and compliance.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <ExportButton
                        icon={Printer}
                        label="Print Report"
                        color={isDarkMode ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}
                        type="Print"
                    />
                    <ExportButton
                        icon={FileText}
                        label="Export PDF"
                        color={isDarkMode ? "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}
                        type="PDF"
                    />
                    <ExportButton
                        icon={Download}
                        label="Export CSV"
                        color="bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                        type="CSV"
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <div className={`p-4 rounded-2xl shadow-lg border flex flex-wrap gap-4 items-center ${cardClass}`}>
                <div className={`flex items-center gap-2 px-2 ${textSecondary}`}>
                    <Filter size={20} />
                    <span className="font-bold text-sm uppercase tracking-wider">Filters</span>
                </div>
                <div className={`h-8 w-px mx-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                <div className={`flex items-center gap-2 border px-3 py-2 rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <Calendar size={16} className={textSecondary} />
                    <select className={`bg-transparent text-sm focus:outline-none font-medium ${textPrimary}`}>
                        <option>This Month</option>
                        <option>Last Quarter</option>
                        <option>Year to Date</option>
                    </select>
                </div>
                <div className={`flex items-center gap-2 border px-3 py-2 rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <Users size={16} className={textSecondary} />
                    <select className={`bg-transparent text-sm focus:outline-none font-medium ${textPrimary}`}>
                        <option>All Staff</option>
                        <option>Technical Team</option>
                        <option>Billing Team</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className={`flex space-x-1 p-1.5 rounded-2xl w-fit shadow-lg ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm' : 'bg-white border border-slate-200/50'}`}>
                {['overview', 'staff', 'sla'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${activeTab === tab
                                ? (isDarkMode ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                                : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50')
                            }`}
                    >
                        {tab === 'sla' ? 'SLA Compliance' : tab === 'staff' ? 'Staff Performance' : 'Overview'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Complaints" value={total} subtext="Total tickets received" trend={12.5} />
                        <StatCard label="Resolved Rate" value={`${Math.round((resolved / total) * 100)}%`} subtext="Complaints closed successfully" trend={5.2} />
                        <StatCard label="Avg Response Time" value="2.4h" subtext="Time to first response" trend={-1.4} />
                        <StatCard label="Customer Satisfaction" value="4.8/5" subtext="Average feedback rating" trend={0.8} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Status Distribution */}
                        <div className={`relative overflow-hidden p-6 rounded-3xl shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none ${cardClass}`}>
                            <h3 className={`font-bold mb-6 ${textPrimary}`}>Status Distribution</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={`font-bold text-2xl ${isDarkMode ? 'fill-white' : 'fill-slate-700'}`}>
                                            {total}
                                        </text>
                                        <text x="50%" y="50%" dy={20} textAnchor="middle" dominantBaseline="middle" className={`text-sm font-medium ${isDarkMode ? 'fill-slate-400' : 'fill-slate-400'}`}>
                                            Total
                                        </text>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Priority Breakdown */}
                        <div className={`p-6 rounded-3xl shadow-sm border ${cardClass}`}>
                            <h3 className={`font-bold mb-6 ${textPrimary}`}>Complaints by Priority</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={priorityData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontWeight: 'bold', fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                                        <Tooltip cursor={{ fill: isDarkMode ? '#334155' : '#f8fafc' }} contentStyle={tooltipStyle} />
                                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={30}>
                                            {priorityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Volume by Category */}
                        <div className={`p-6 rounded-3xl shadow-sm border ${cardClass}`}>
                            <h3 className={`font-bold mb-6 ${textPrimary}`}>Volume by Category</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                                        <Tooltip cursor={{ fill: isDarkMode ? '#334155' : '#f8fafc' }} contentStyle={tooltipStyle} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Avg Resolution Time */}
                        <div className={`p-6 rounded-3xl shadow-sm border ${cardClass}`}>
                            <h3 className={`font-bold mb-6 ${textPrimary}`}>Avg Resolution Time (Hours)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={avgResolutionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                                        <Tooltip cursor={{ fill: isDarkMode ? '#334155' : '#f8fafc' }} contentStyle={tooltipStyle} />
                                        <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className={`rounded-3xl shadow-sm border overflow-hidden ${cardClass}`}>
                    <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                        <h3 className={`font-bold text-lg ${textPrimary}`}>Staff Performance Leaderboard</h3>
                        <button className="text-blue-600 text-sm font-bold hover:underline">View All Staff</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                <tr>
                                    <th className="px-6 py-4 text-left">Staff Member</th>
                                    <th className="px-6 py-4 text-left">Role</th>
                                    <th className="px-6 py-4 text-center">Assigned</th>
                                    <th className="px-6 py-4 text-center">Resolved</th>
                                    <th className="px-6 py-4 text-center">Avg Time</th>
                                    <th className="px-6 py-4 text-center">Rating</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                {staffList.map((staff, idx) => (
                                    <tr key={staff.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className={`font-mono mr-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>#{idx + 1}</span>
                                                <img src={staff.avatar} className={`w-10 h-10 rounded-full border mr-3 ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`} alt="" />
                                                <div>
                                                    <p className={`font-bold ${textPrimary}`}>{staff.name}</p>
                                                    <p className={`text-xs ${textSecondary}`}>{staff.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">Support Agent</span>
                                        </td>
                                        <td className={`px-6 py-4 text-center font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{staff.assignedCount}</td>
                                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{staff.resolvedCount}</td>
                                        <td className={`px-6 py-4 text-center text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{staff.avgTime}h</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center text-amber-500 font-bold text-sm">
                                                ⭐ {staff.rating}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'sla' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`p-6 rounded-3xl shadow-sm border lg:col-span-1 ${cardClass}`}>
                        <h3 className={`font-bold mb-2 ${textPrimary}`}>Overall Compliance</h3>
                        <p className={`text-sm mb-6 ${textSecondary}`}>Percentage of tickets resolved within deadline</p>

                        <div className="relative h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Met SLA', value: slaMet },
                                            { name: 'Breached', value: slaBreached }
                                        ]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-extrabold ${textPrimary}`}>{Math.round((slaMet / total) * 100)}%</span>
                                <span className={`text-xs font-bold uppercase ${textSecondary}`}>Compliance</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Met ({slaMet})</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Breached ({slaBreached})</span>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-3xl shadow-sm border lg:col-span-2 ${cardClass}`}>
                        <h3 className={`font-bold mb-6 ${textPrimary}`}>Recent SLA Breaches</h3>
                        <div className="space-y-4">
                            {complaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== ComplaintStatus.RESOLVED).slice(0, 4).map(c => (
                                <div key={c.id} className={`flex items-center p-4 border rounded-xl transition-colors ${isDarkMode ? 'bg-red-900/10 border-red-900/30 hover:bg-red-900/20' : 'bg-red-50/50 border-red-100 hover:bg-red-50'}`}>
                                    <div className={`p-3 rounded-lg border mr-4 ${isDarkMode ? 'bg-slate-800 border-red-900/30' : 'bg-white border-red-100'}`}>
                                        <AlertTriangle className="text-red-500" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <h4 className={`font-bold ${textPrimary}`}>{c.title}</h4>
                                            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded uppercase">{c.priority}</span>
                                        </div>
                                        <p className={`text-sm mb-1 line-clamp-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{c.description}</p>
                                        <div className="flex items-center text-xs text-red-500 font-medium">
                                            <Clock size={12} className="mr-1" />
                                            Deadline missed: {new Date(c.slaDeadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button className={`ml-4 px-4 py-2 border text-xs font-bold rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-red-900/30' : 'bg-white border-red-200 text-red-600 hover:bg-red-600 hover:text-white'}`}>
                                        Escalate
                                    </button>
                                </div>
                            ))}
                            {slaBreached === 0 && (
                                <div className="text-center py-12">
                                    <CheckCircle size={48} className="mx-auto text-emerald-400 mb-2" />
                                    <p className={`font-medium ${textPrimary}`}>No active SLA breaches.</p>
                                    <p className={`text-sm ${textSecondary}`}>Great job keeping up with deadlines!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
