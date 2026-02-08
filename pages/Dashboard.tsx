
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Award, BarChart3, Users, Activity, Sparkles, Star, MessageSquare } from 'lucide-react';
import { User, Complaint, ComplaintStatus, UserRole, Priority } from '../types';
import { MOCK_USERS } from '../services/mockService';

interface DashboardProps {
  user: User;
  complaints: Complaint[];
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, complaints, isDarkMode }) => {
  // --- Styling Variables ---
  const cardClass = isDarkMode
    ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm'
    : 'bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 backdrop-blur-sm';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  // Premium container wrapper with glow effect
  const PremiumCard = ({ children, className = '', glowColor = 'blue' }: any) => {
    const glowColors: Record<string, string> = {
      blue: isDarkMode ? 'hover:shadow-blue-500/5' : 'hover:shadow-blue-500/10',
      red: isDarkMode ? 'hover:shadow-red-500/5' : 'hover:shadow-red-500/10',
      green: isDarkMode ? 'hover:shadow-green-500/5' : 'hover:shadow-green-500/10',
      purple: isDarkMode ? 'hover:shadow-purple-500/5' : 'hover:shadow-purple-500/10',
    };
    return (
      <div className={`
        relative overflow-hidden rounded-3xl p-6 shadow-xl border transition-all duration-300
        ${cardClass} ${glowColors[glowColor]} hover:shadow-2xl hover:-translate-y-1
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none
        ${className}
      `}>
        {children}
      </div>
    );
  };

  // --- Admin Logic ---
  const totalComplaints = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length;
  const criticalCount = complaints.filter(c => c.priority === Priority.CRITICAL && c.status !== ComplaintStatus.RESOLVED).length;
  const inProgressCount = complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length;

  // Data for Status Pie Chart
  const statusData = [
    { name: 'New', value: complaints.filter(c => c.status === ComplaintStatus.NEW).length },
    { name: 'In Progress', value: inProgressCount },
    { name: 'Resolved', value: resolvedCount },
    { name: 'Assigned', value: complaints.filter(c => c.status === ComplaintStatus.ASSIGNED).length },
  ];

  // SLA Trend Data - Use shorter date labels (Feb 1, Feb 2, etc.)
  const today = new Date();
  const slaTrendData = Array.from({ length: 15 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (14 - i));
    return {
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      breaches: Math.floor(Math.random() * 5)
    };
  });

  // GitHub-style Heatmap Data Generation (52 weeks x 7 days, but we'll show 12 weeks)
  const generateGitHubHeatmapData = () => {
    const weeks = 12;
    const data = [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7));

    for (let w = 0; w < weeks; w++) {
      const weekData = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * 7) + d);
        weekData.push({
          date: currentDate,
          value: Math.floor(Math.random() * 10),
          day: d
        });
      }
      data.push(weekData);
    }
    return data;
  };

  const heatmapData = generateGitHubHeatmapData();
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Get heatmap color based on value (GitHub-style green)
  const getHeatmapColor = (value: number) => {
    if (value === 0) return isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100';
    if (value <= 2) return isDarkMode ? 'bg-emerald-900/60' : 'bg-emerald-100';
    if (value <= 4) return isDarkMode ? 'bg-emerald-700/70' : 'bg-emerald-300';
    if (value <= 6) return isDarkMode ? 'bg-emerald-600/80' : 'bg-emerald-400';
    return isDarkMode ? 'bg-emerald-500' : 'bg-emerald-500';
  };

  // Top Performers Logic (Top 5 Staff by Resolved Count)
  const topPerformers = MOCK_USERS
    .filter(u => u.role === UserRole.STAFF)
    .map(staff => {
      const resolvedCount = complaints.filter(c => c.assignedTo === staff.id && c.status === ComplaintStatus.RESOLVED).length;
      return { ...staff, score: resolvedCount };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const COLORS = ['#94a3b8', '#fbbf24', '#4ade80', '#60a5fa'];

  // --- Render Functions ---

  const StatCard = ({ title, value, icon: Icon, gradient, trend, subtext }: any) => (
    <div className={`relative overflow-hidden rounded-3xl p-6 shadow-xl text-white ${gradient} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group`}>
      {/* Decorative elements */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
        <Icon size={100} strokeWidth={1} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
            <Icon size={22} className="text-white" />
          </div>
          {trend && (
            <span className="text-xs font-bold bg-white/25 px-3 py-1.5 rounded-xl flex items-center backdrop-blur-sm">
              <TrendingUp size={12} className="mr-1" /> {trend}
            </span>
          )}
        </div>
        <p className="text-sm font-medium opacity-90 tracking-wide">{title}</p>
        <h3 className="text-4xl font-extrabold mt-1 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs mt-3 opacity-75 flex items-center"><Sparkles size={12} className="mr-1" /> {subtext}</p>}
      </div>
    </div>
  );

  const AdminDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={totalComplaints}
          icon={BarChart3}
          gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
          trend="+12%"
          subtext="Last 30 days"
        />
        <StatCard
          title="Critical Pending"
          value={criticalCount}
          icon={AlertCircle}
          gradient="bg-gradient-to-br from-red-500 via-rose-500 to-pink-600"
          subtext="Requires immediate attention"
        />
        <StatCard
          title="Resolved Today"
          value={resolvedCount}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600"
          trend="+5%"
        />
        <StatCard
          title="Avg Resolution"
          value="4.2h"
          icon={Clock}
          gradient="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600"
          subtext="Target: < 5h"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Breach Trend */}
        <PremiumCard className="lg:col-span-2" glowColor="red">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`text-lg font-bold flex items-center ${textPrimary}`}>
                <div className="p-2 rounded-xl bg-red-500/10 mr-3">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                SLA Breach Trend
              </h3>
              <p className={`text-sm mt-1 ${textSecondary}`}>Missed deadlines over last 15 days</p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
              Live Data
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={slaTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBreach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  interval={2}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    borderRadius: '16px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  cursor={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="breaches"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBreach)"
                  dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* Status Distribution */}
        <PremiumCard glowColor="blue">
          <h3 className={`text-lg font-bold mb-2 flex items-center ${textPrimary}`}>
            <div className="p-2 rounded-xl bg-blue-500/10 mr-3">
              <BarChart3 size={18} className="text-blue-500" />
            </div>
            Status Distribution
          </h3>
          <p className={`text-sm mb-4 ${textSecondary}`}>Current workload breakdown</p>
          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-3xl font-extrabold ${textPrimary}`}>{totalComplaints}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {statusData.map((item, idx) => (
              <div key={idx} className={`flex items-center p-2 rounded-xl ${isDarkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className={`text-xs font-medium ${textSecondary}`}>{item.name}</span>
                <span className={`ml-auto text-sm font-bold ${textPrimary}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Row 3: GitHub-style Heatmap & Staff Perf */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub-style Activity Heatmap */}
        <PremiumCard glowColor="green">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-bold flex items-center ${textPrimary}`}>
              <div className="p-2 rounded-xl bg-emerald-500/10 mr-3">
                <Activity size={18} className="text-emerald-500" />
              </div>
              Activity Heatmap
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Less</span>
              <div className={`w-3 h-3 rounded-sm ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}></div>
              <div className={`w-3 h-3 rounded-sm ${isDarkMode ? 'bg-emerald-900/60' : 'bg-emerald-100'}`}></div>
              <div className={`w-3 h-3 rounded-sm ${isDarkMode ? 'bg-emerald-700/70' : 'bg-emerald-300'}`}></div>
              <div className={`w-3 h-3 rounded-sm ${isDarkMode ? 'bg-emerald-600/80' : 'bg-emerald-400'}`}></div>
              <div className={`w-3 h-3 rounded-sm ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-500'}`}></div>
              <span>More</span>
            </div>
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-around pr-2 text-[10px] text-slate-400 font-medium" style={{ height: 'calc(7 * 14px + 6 * 3px)' }}>
              {dayLabels.map((label, i) => (
                <span key={i} className="h-3.5 flex items-center">{label}</span>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-[3px]">
                {heatmapData.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`w-3.5 h-3.5 rounded-sm ${getHeatmapColor(day.value)} transition-all hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-emerald-400 cursor-pointer`}
                        title={`${day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${day.value} activities`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Month labels */}
              <div className="flex mt-2 text-[10px] text-slate-400">
                {['', '', '', 'Jan', '', '', '', 'Feb', '', '', '', '']}
              </div>
            </div>
          </div>

          <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex justify-between items-center">
              <p className={`text-sm ${textSecondary}`}>
                <span className="font-bold text-emerald-500">{complaints.length}</span> activities in the last 12 weeks
              </p>
              <span className={`text-xs px-2 py-1 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                Peak: Mon 2pm
              </span>
            </div>
          </div>
        </PremiumCard>

        {/* Top Performers List */}
        <PremiumCard glowColor="purple">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-bold flex items-center ${textPrimary}`}>
              <div className="p-2 rounded-xl bg-amber-500/10 mr-3">
                <Award size={18} className="text-amber-500" />
              </div>
              Top Performers
            </h3>
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>This Week</span>
          </div>
          <div className="space-y-3">
            {topPerformers.map((staff, index) => (
              <div
                key={staff.id}
                className={`
                         flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 cursor-pointer
                         ${index === 0
                    ? (isDarkMode ? 'bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20' : 'bg-gradient-to-r from-amber-50 to-transparent border border-amber-100')
                    : (isDarkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-50/50 hover:bg-slate-100')
                  }
                         hover:scale-[1.02] hover:shadow-lg
                       `}
              >
                <div className="flex items-center space-x-4">
                  <div className={`font-bold w-7 h-7 flex items-center justify-center rounded-lg text-sm ${index === 0 ? 'bg-amber-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                      index === 2 ? 'bg-amber-700 text-white' :
                        (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500')
                    }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </div>
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className={`w-10 h-10 rounded-xl border-2 shadow-sm object-cover ${index === 0 ? 'border-amber-400' : (isDarkMode ? 'border-slate-600' : 'border-white')
                      }`}
                  />
                  <div>
                    <p className={`text-sm font-bold ${textPrimary}`}>{staff.name}</p>
                    <p className={`text-xs ${textSecondary}`}>{staff.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`block text-lg font-extrabold ${index === 0 ? 'text-amber-500' : 'text-blue-500'}`}>{staff.score}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Resolved</span>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Recent Feedback Section */}
      <PremiumCard className="col-span-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold flex items-center ${textPrimary}`}>
            <MessageSquare size={20} className="mr-2 text-purple-500" /> Recent Feedback
          </h3>
          <span className={`text-xs font-bold ${textSecondary}`}>From Resolved Complaints</span>
        </div>

        {complaints.filter(c => c.feedback).length === 0 ? (
          <p className={`text-center py-8 ${textSecondary}`}>No feedback received yet</p>
        ) : (
          <div className="space-y-4">
            {complaints
              .filter(c => c.feedback)
              .slice(0, 5)
              .map(c => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-bold ${textPrimary}`}>{c.id}</span>
                        <span className={`text-xs ${textSecondary}`}>•</span>
                        <span className={`text-xs ${textSecondary}`}>{c.customerName}</span>
                      </div>
                      <p className={`text-sm mb-2 ${textSecondary}`}>{c.title}</p>
                      {c.feedback?.comment && (
                        <p className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          "{c.feedback.comment}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= (c.feedback?.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${textSecondary}`}>
                    Submitted: {c.feedback?.submittedAt ? new Date(c.feedback.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              ))}
          </div>
        )}
      </PremiumCard>
    </div>
  );

  const StaffDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-emerald-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse animation-delay-4000"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img src={user.avatar} className="w-20 h-20 rounded-2xl border-4 border-slate-700 shadow-xl object-cover" alt="Profile" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle size={12} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, {user.name}</h2>
              <p className="text-blue-200 mt-1 flex items-center">
                <Users size={16} className="mr-2" />
                You have <span className="font-bold text-white mx-1 px-2 py-0.5 bg-white/10 rounded-lg">{complaints.filter(c => c.assignedTo === user.id && c.status !== ComplaintStatus.RESOLVED).length}</span> active complaints assigned.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-800/50 p-5 rounded-2xl backdrop-blur-sm border border-slate-700/50 shadow-xl">
            <div className="text-center px-5 border-r border-slate-600">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Rank</p>
              <p className="text-3xl font-extrabold text-amber-400">#4</p>
            </div>
            <div className="text-center px-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Score</p>
              <p className="text-3xl font-extrabold text-white">{user.points}</p>
            </div>
          </div>
        </div>
      </div>

      <PremiumCard>
        <h3 className={`font-bold ${textPrimary}`}>Assigned Tasks</h3>
        <p className={textSecondary}>You have {complaints.filter(c => c.assignedTo === user.id).length} assigned complaints.</p>
      </PremiumCard>
    </div>
  );

  if (user.role === UserRole.STAFF) return <StaffDashboard />;
  return <AdminDashboard />;
};

export default Dashboard;
