
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Award, BarChart3, Users, Activity } from 'lucide-react';
import { User, Complaint, ComplaintStatus, UserRole, Priority } from '../types';
import { MOCK_USERS } from '../services/mockService';

interface DashboardProps {
  user: User;
  complaints: Complaint[];
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, complaints, isDarkMode }) => {
  const cardClass = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

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

  // SLA Trend Data (Last 30 days breaches)
  const slaTrendData = Array.from({ length: 15 }).map((_, i) => ({
      day: `Day ${i+1}`,
      breaches: Math.floor(Math.random() * 5)
  }));

  // Heatmap Data Generation (7 days x 24 hours)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({length: 12}, (_, i) => i * 2); // Every 2 hours for simplified view
  const heatmapData = days.map(d => ({
      day: d,
      hours: hours.map(h => Math.floor(Math.random() * 10))
  }));

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
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg text-white ${gradient} transition-transform hover:scale-[1.02]`}>
      <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg flex items-center">
                    <TrendingUp size={12} className="mr-1"/> {trend}
                </span>
            )}
        </div>
        <p className="text-sm font-medium opacity-90">{title}</p>
        <h3 className="text-4xl font-bold mt-1 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs mt-2 opacity-75">{subtext}</p>}
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
            gradient="bg-gradient-to-br from-blue-500 to-blue-700" 
            trend="+12%"
            subtext="Last 30 days"
        />
        <StatCard 
            title="Critical Pending" 
            value={criticalCount} 
            icon={AlertCircle} 
            gradient="bg-gradient-to-br from-red-500 to-rose-600"
            subtext="Requires immediate attention"
        />
        <StatCard 
            title="Resolved Today" 
            value={resolvedCount} 
            icon={CheckCircle} 
            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            trend="+5%"
        />
        <StatCard 
            title="Avg Resolution" 
            value="4.2h" 
            icon={Clock} 
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            subtext="Target: < 5h"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Breach Trend */}
        <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${cardClass}`}>
          <div className="flex justify-between items-center mb-6">
              <div>
                  <h3 className={`text-lg font-bold flex items-center ${textPrimary}`}><AlertCircle size={20} className="mr-2 text-red-500"/> SLA Breach Trend</h3>
                  <p className={`text-sm ${textSecondary}`}>Missed deadlines over last 15 days</p>
              </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={slaTrendData}>
                <defs>
                  <linearGradient id="colorBreach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
                <Tooltip 
                    contentStyle={{backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', color: isDarkMode ? '#fff' : '#000'}}
                    cursor={{stroke: '#ef4444', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="breaches" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorBreach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className={`p-6 rounded-2xl shadow-sm border ${cardClass}`}>
          <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Status Distribution</h3>
          <p className={`text-sm mb-6 ${textSecondary}`}>Current workload breakdown</p>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-3xl font-bold ${textPrimary}`}>{totalComplaints}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
               {statusData.map((item, idx) => (
                   <div key={idx} className="flex items-center">
                       <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                       <span className={`text-sm ${textSecondary}`}>{item.name}</span>
                       <span className={`ml-auto font-bold ${textPrimary}`}>{item.value}</span>
                   </div>
               ))}
          </div>
        </div>
      </div>
      
      {/* Row 3: Heatmap & Staff Perf */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Activity Heatmap */}
           <div className={`p-6 rounded-2xl shadow-sm border ${cardClass}`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center ${textPrimary}`}><Activity size={20} className="mr-2 text-blue-500"/> Activity Heatmap</h3>
              <div className="flex flex-col gap-2">
                  <div className="flex text-xs text-slate-400 mb-2 pl-12 justify-between">
                     {hours.map(h => <span key={h}>{h}:00</span>)}
                  </div>
                  {heatmapData.map((d, rowIdx) => (
                      <div key={rowIdx} className="flex items-center">
                          <span className={`w-12 text-xs font-bold ${textSecondary}`}>{d.day}</span>
                          <div className="flex-1 flex gap-1 justify-between">
                              {d.hours.map((val, colIdx) => {
                                  let bg = isDarkMode ? 'bg-slate-700' : 'bg-slate-100';
                                  if(val > 7) bg = 'bg-blue-600';
                                  else if(val > 4) bg = 'bg-blue-400';
                                  else if(val > 0) bg = 'bg-blue-200';
                                  
                                  return (
                                      <div 
                                        key={colIdx} 
                                        className={`flex-1 h-8 rounded-sm ${bg} hover:opacity-80 transition cursor-pointer`}
                                        title={`${d.day} ${hours[colIdx]}:00 - ${val} tickets`}
                                      />
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
           </div>

           {/* Top Performers List */}
           <div className={`p-6 rounded-2xl shadow-sm border ${cardClass}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold flex items-center ${textPrimary}`}>
                    <Award size={20} className="mr-2 text-amber-500"/> Top Performers
                </h3>
              </div>
              <div className="space-y-4">
                  {topPerformers.map((staff, index) => (
                      <div key={staff.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}>
                          <div className="flex items-center space-x-4">
                              <div className={`font-bold w-6 text-center text-lg ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                              </div>
                              <img 
                                src={staff.avatar} 
                                alt={staff.name} 
                                className={`w-10 h-10 rounded-full border-2 shadow-sm object-cover ${isDarkMode ? 'border-slate-600' : 'border-white'}`} 
                              />
                              <div>
                                  <p className={`text-sm font-bold ${textPrimary}`}>{staff.name}</p>
                                  <p className={`text-xs ${textSecondary}`}>{staff.email}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">{staff.score}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Resolved</span>
                          </div>
                      </div>
                  ))}
              </div>
           </div>
      </div>
    </div>
  );

  const StaffDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-6">
                <img src={user.avatar} className="w-20 h-20 rounded-2xl border-4 border-slate-800 shadow-xl object-cover" alt="Profile" />
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h2>
                    <p className="text-blue-200 mt-1 flex items-center">
                        <Users size={16} className="mr-2"/>
                        You have <span className="font-bold text-white mx-1">{complaints.filter(c => c.assignedTo === user.id && c.status !== ComplaintStatus.RESOLVED).length}</span> active complaints assigned.
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-6 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700">
                <div className="text-center px-4 border-r border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rank</p>
                    <p className="text-2xl font-bold text-amber-400">#4</p>
                </div>
                <div className="text-center px-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Score</p>
                    <p className="text-3xl font-bold text-white">{user.points}</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className={`p-6 rounded-2xl shadow-sm border ${cardClass}`}>
         <h3 className={`font-bold ${textPrimary}`}>Assigned Tasks</h3>
         <p className={textSecondary}>You have {complaints.filter(c => c.assignedTo === user.id).length} assigned complaints.</p>
      </div>
    </div>
  );

  if (user.role === UserRole.STAFF) return <StaffDashboard />;
  return <AdminDashboard />;
};

export default Dashboard;
