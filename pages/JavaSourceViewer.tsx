import React, { useState } from 'react';
import {
  JAVA_COMPLAINT_ENTITY, JAVA_USER_ENTITY,
  JAVA_COMPLAINT_REPOSITORY,
  JAVA_SENTIMENT_LOGIC, JAVA_SLA_SCHEDULER, JAVA_GAMIFICATION, JAVA_QR_GENERATION,
  JAVA_CONTROLLER, JAVA_AUTH_CONTROLLER,
  JAVA_SECURITY, JAVA_JWT_PROVIDER,
  JAVA_APPLICATION
} from '../utils/javaCodeSnippets';
import { Code2, Database, Shield, Zap, Server, Trophy, QrCode, Layout } from 'lucide-react';

interface CodeBlockProps {
  title: string;
  code: string;
  icon?: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, code, icon }) => (
  <div className="mb-6 bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700">
    <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center space-x-3">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      {icon && <span className="ml-2 text-gray-400">{icon}</span>}
      <span className="text-sm text-gray-300 font-mono font-medium">{title}</span>
    </div>
    <div className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
      <pre className="text-sm font-mono text-green-400 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  </div>
);

interface TabProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`}
  >
    {icon}
    {label}
  </button>
);

type TabKey = 'models' | 'repos' | 'services' | 'controllers' | 'security';

const JavaSourceViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('services');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'models', label: 'Models', icon: <Database size={16} /> },
    { key: 'repos', label: 'Repositories', icon: <Server size={16} /> },
    { key: 'services', label: 'Services', icon: <Zap size={16} /> },
    { key: 'controllers', label: 'Controllers', icon: <Layout size={16} /> },
    { key: 'security', label: 'Security', icon: <Shield size={16} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'models':
        return (
          <>
            <CodeBlock title="Complaint.java" code={JAVA_COMPLAINT_ENTITY} icon={<Database size={14} />} />
            <CodeBlock title="User.java" code={JAVA_USER_ENTITY} icon={<Database size={14} />} />
          </>
        );
      case 'repos':
        return (
          <CodeBlock title="ComplaintRepository.java" code={JAVA_COMPLAINT_REPOSITORY} icon={<Server size={14} />} />
        );
      case 'services':
        return (
          <>
            <CodeBlock title="SentimentAnalysisService.java" code={JAVA_SENTIMENT_LOGIC} icon={<Zap size={14} />} />
            <CodeBlock title="SLAService.java" code={JAVA_SLA_SCHEDULER} icon={<Zap size={14} />} />
            <CodeBlock title="GamificationService.java" code={JAVA_GAMIFICATION} icon={<Trophy size={14} />} />
            <CodeBlock title="QRCodeService.java" code={JAVA_QR_GENERATION} icon={<QrCode size={14} />} />
          </>
        );
      case 'controllers':
        return (
          <>
            <CodeBlock title="ComplaintController.java" code={JAVA_CONTROLLER} icon={<Layout size={14} />} />
            <CodeBlock title="AuthController.java" code={JAVA_AUTH_CONTROLLER} icon={<Layout size={14} />} />
          </>
        );
      case 'security':
        return (
          <>
            <CodeBlock title="SecurityConfig.java" code={JAVA_SECURITY} icon={<Shield size={14} />} />
            <CodeBlock title="JwtTokenProvider.java" code={JAVA_JWT_PROVIDER} icon={<Shield size={14} />} />
            <CodeBlock title="CmsApplication.java" code={JAVA_APPLICATION} icon={<Code2 size={14} />} />
          </>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Code2 className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-white">Backend Architecture</h1>
        </div>
        <p className="text-slate-400">
          Spring Boot backend implementation for the Enterprise Complaint Management System.
          Complete with JWT authentication, SLA monitoring, gamification, and more.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium">Java 17+</span>
          <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium">Spring Boot 3</span>
          <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium">Spring Security</span>
          <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-xs font-medium">JPA/Hibernate</span>
          <span className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-xs font-medium">JWT</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-800/50 rounded-xl">
        {tabs.map(tab => (
          <Tab
            key={tab.key}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700 text-center">
        <p className="text-sm text-slate-500">
          View complete source files in the <code className="text-blue-400">/java</code> directory
        </p>
      </div>
    </div>
  );
};

export default JavaSourceViewer;