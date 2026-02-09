
import React, { useState } from 'react';
import { Complaint, ComplaintStatus, UserRole, Priority } from '../types';
import { MOCK_USERS } from '../services/mockService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import {
    Download, FileText, Filter, Calendar, TrendingUp, AlertTriangle,
    CheckCircle, Users, Clock, ArrowUpRight, ArrowDownRight, Printer, ChevronDown
} from 'lucide-react';

interface ReportsProps {
    complaints: Complaint[];
    isDarkMode: boolean;
}

const Reports: React.FC<ReportsProps> = ({ complaints, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'sla'>('overview');
    const [timeFilter, setTimeFilter] = useState('This Month');
    const [staffFilter, setStaffFilter] = useState('All Staff');
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [showStaffDropdown, setShowStaffDropdown] = useState(false);

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
    const cardClass = 'glass-card border-white/10';
    const textPrimary = 'text-white';
    const textSecondary = 'text-slate-400';
    const gridColor = '#334155';
    const tooltipStyle = {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        padding: '12px 16px',
        color: '#fff'
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
        <div className={`relative overflow-hidden p-6 rounded-[32px] shadow-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${cardClass}`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${textSecondary}`}>{label}</p>
            <div className="flex items-end justify-between relative z-10">
                <h3 className={`text-4xl font-black tracking-tight ${textPrimary}`}>{value}</h3>
                {trend && (
                    <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md border ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className={`text-xs mt-4 font-medium ${textSecondary}`}>{subtext}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className={`relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 p-10 rounded-[40px] shadow-2xl ${cardClass}`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className={`text-4xl font-black tracking-tight ${textPrimary} mb-2`}>Analytics & Reports</h1>
                    <p className={`text-lg font-medium ${textSecondary}`}>Comprehensive insights into system performance and compliance.</p>
                </div>
                <div className="flex flex-wrap gap-3 relative z-10">
                    <ExportButton
                        icon={Printer}
                        label="Print"
                        color="bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md"
                        type="Print"
                    />
                    <ExportButton
                        icon={FileText}
                        label="PDF"
                        color="bg-blue-600/80 text-white hover:bg-blue-500 hover:shadow-blue-500/30 border border-blue-400/30 backdrop-blur-md"
                        type="PDF"
                    />
                    <ExportButton
                        icon={Download}
                        label="CSV"
                        color="bg-emerald-600/80 text-white hover:bg-emerald-500 hover:shadow-emerald-500/30 border border-emerald-400/30 backdrop-blur-md"
                        type="CSV"
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <div className={`relative z-30 p-4 rounded-3xl shadow-lg border flex flex-wrap gap-4 items-center bg-slate-50/90 dark:bg-black/30 border-slate-200/50 dark:border-white/10 backdrop-blur-xl`}>
                <div className={`flex items-center gap-2 px-4 text-slate-600 dark:text-slate-400`}>
                    <Filter size={20} />
                    <span className="font-bold text-xs uppercase tracking-wider">Filters</span>
                </div>
                <div className="h-8 w-px mx-2 bg-slate-300 dark:bg-white/10"></div>

                {/* Time Filter Dropdown */}
                <div className="relative z-50">
                    <button
                        onClick={() => { setShowTimeDropdown(!showTimeDropdown); setShowStaffDropdown(false); }}
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer group"
                    >
                        <Calendar size={16} className="text-blue-400" />
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{timeFilter}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showTimeDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showTimeDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {['This Month', 'Last Quarter', 'Year to Date', 'Last 7 Days', 'Custom Range'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => { setTimeFilter(option); setShowTimeDropdown(false); }}
                                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-3 ${timeFilter === option ? 'text-blue-400 bg-blue-500/10' : 'text-white'}`}
                                >
                                    {timeFilter === option && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
                                    <span className={timeFilter === option ? '' : 'ml-4'}>{option}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Staff Filter Dropdown */}
                <div className="relative z-50">
                    <button
                        onClick={() => { setShowStaffDropdown(!showStaffDropdown); setShowTimeDropdown(false); }}
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer group"
                    >
                        <Users size={16} className="text-purple-400" />
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{staffFilter}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showStaffDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showStaffDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {['All Staff', 'Technical Team', 'Billing Team', 'Customer Support', 'Management'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => { setStaffFilter(option); setShowStaffDropdown(false); }}
                                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-3 ${staffFilter === option ? 'text-purple-400 bg-purple-500/10' : 'text-white'}`}
                                >
                                    {staffFilter === option && <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>}
                                    <span className={staffFilter === option ? '' : 'ml-4'}>{option}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs - iOS 26 Style */}
            <div className="flex gap-2 p-2 rounded-[24px] w-fit bg-slate-100/90 dark:bg-black/30 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl">
                {[{ key: 'overview', label: 'Overview' }, { key: 'staff', label: 'Staff Performance' }, { key: 'sla', label: 'SLA Compliance' }].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`relative px-6 py-3 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === tab.key
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content with Animation */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Complaints" value={total} subtext="Total tickets received" trend={12.5} />
                        <StatCard label="Resolved Rate" value={`${Math.round((resolved / total) * 100)}%`} subtext="Complaints closed successfully" trend={5.2} />
                        <StatCard label="Avg Response Time" value="2.4h" subtext="Time to first response" trend={-1.4} />
                        <StatCard label="Customer Satisfaction" value="4.8/5" subtext="Average feedback rating" trend={0.8} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Status Distribution */}
                        <div className={`relative overflow-hidden p-8 rounded-[32px] shadow-2xl ${cardClass}`}>
                            <h3 className={`font-bold mb-8 text-xl ${textPrimary}`}>Status Distribution</h3>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-black text-4xl fill-white">
                                            {total}
                                        </text>
                                        <text x="50%" y="50%" dy={30} textAnchor="middle" dominantBaseline="middle" className="text-sm font-bold fill-slate-400 uppercase tracking-wider">
                                            Total
                                        </text>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Priority Breakdown */}
                        <div className={`p-8 rounded-[32px] shadow-2xl ${cardClass}`}>
                            <h3 className={`font-bold mb-8 text-xl ${textPrimary}`}>Complaints by Priority</h3>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={priorityData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} strokeOpacity={0.1} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontWeight: 'bold', fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={tooltipStyle} />
                                        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
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
                        <div className={`p-8 rounded-[32px] shadow-2xl ${cardClass}`}>
                            <h3 className={`font-bold mb-8 text-xl ${textPrimary}`}>Volume by Category</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.1} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={tooltipStyle} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Avg Resolution Time */}
                        <div className={`p-8 rounded-[32px] shadow-2xl ${cardClass}`}>
                            <h3 className={`font-bold mb-8 text-xl ${textPrimary}`}>Avg Resolution Time (Hours)</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={avgResolutionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.1} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={tooltipStyle} />
                                        <Bar dataKey="hours" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className={`rounded-[32px] shadow-2xl overflow-hidden ${cardClass} animate-in fade-in slide-in-from-right-4 duration-500`}>
                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className={`font-bold text-xl ${textPrimary}`}>Staff Performance Leaderboard</h3>
                        <button className="text-blue-400 text-sm font-bold hover:text-blue-300 transition-colors">View All Staff</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-xs uppercase tracking-wider font-bold bg-black/20 text-slate-400">
                                <tr>
                                    <th className="px-8 py-5 text-left">Staff Member</th>
                                    <th className="px-6 py-5 text-left">Role</th>
                                    <th className="px-6 py-5 text-center">Assigned</th>
                                    <th className="px-6 py-5 text-center">Resolved</th>
                                    <th className="px-6 py-5 text-center">Avg Time</th>
                                    <th className="px-6 py-5 text-center">Rating</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {staffList.map((staff, idx) => (
                                    <tr key={staff.id} className="transition-colors hover:bg-white/5">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <span className="font-mono mr-4 text-slate-500 font-bold">#{idx + 1}</span>
                                                <div className="relative mr-4">
                                                    <img src={staff.avatar} className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-white/10" alt="" />
                                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg shadow-emerald-500/50"></div>
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${textPrimary}`}>{staff.name}</p>
                                                    <p className={`text-xs ${textSecondary}`}>{staff.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-300">
                                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Support Agent</span>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-slate-300">{staff.assignedCount}</td>
                                        <td className="px-6 py-5 text-center font-bold text-emerald-400">{staff.resolvedCount}</td>
                                        <td className="px-6 py-5 text-center text-sm text-slate-300">{staff.avgTime}h</td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center text-amber-400 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 w-fit mx-auto">
                                                ⭐ {staff.rating}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className={`p-8 rounded-[32px] shadow-2xl lg:col-span-1 ${cardClass}`}>
                        <h3 className={`font-bold mb-2 text-xl ${textPrimary}`}>Overall Compliance</h3>
                        <p className={`text-sm mb-8 font-medium ${textSecondary}`}>Percentage of tickets resolved within deadline</p>

                        <div className="relative h-72 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Met SLA', value: slaMet },
                                            { name: 'Breached', value: slaBreached }
                                        ]}
                                        innerRadius={80}
                                        outerRadius={100}
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
                                <span className={`text-5xl font-black ${textPrimary} drop-shadow-2xl`}>{Math.round((slaMet / total) * 100)}%</span>
                                <span className={`text-xs font-bold uppercase tracking-wider mt-2 ${textSecondary}`}>Compliance</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-8 mt-6">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-sm font-bold text-slate-300">Met ({slaMet})</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                <span className="text-sm font-bold text-slate-300">Breached ({slaBreached})</span>
                            </div>
                        </div>
                    </div>

                    <div className={`p-8 rounded-[32px] shadow-2xl lg:col-span-2 ${cardClass}`}>
                        <h3 className={`font-bold mb-8 text-xl ${textPrimary}`}>Recent SLA Breaches</h3>
                        <div className="space-y-4">
                            {complaints.filter(c => new Date(c.slaDeadline) < new Date() && c.status !== ComplaintStatus.RESOLVED).slice(0, 4).map(c => (
                                <div key={c.id} className="flex items-center p-5 border rounded-2xl transition-all bg-red-500/5 border-red-500/10 hover:bg-red-500/10 group">
                                    <div className="p-3 rounded-xl border mr-5 bg-red-500/10 border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1.5">
                                            <h4 className={`font-bold text-lg ${textPrimary}`}>{c.title}</h4>
                                            <span className="text-[10px] font-black tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg uppercase">{c.priority}</span>
                                        </div>
                                        <p className={`text-sm mb-2 line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{c.description}</p>
                                        <div className="flex items-center text-xs text-red-400 font-bold bg-red-500/5 w-fit px-2 py-1 rounded-lg">
                                            <Clock size={12} className="mr-1.5" />
                                            Deadline missed: {new Date(c.slaDeadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button className="ml-6 px-5 py-2.5 border text-xs font-bold rounded-xl transition-all bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20">
                                        Escalate
                                    </button>
                                </div>
                            ))}
                            {slaBreached === 0 && (
                                <div className="text-center py-16 flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                        <CheckCircle size={40} className="text-emerald-400" />
                                    </div>
                                    <p className={`font-bold text-xl ${textPrimary} mb-1`}>No active SLA breaches.</p>
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
