import React, { useState, useRef, useEffect } from 'react';
import {
  JAVA_COMPLAINT_ENTITY, JAVA_USER_ENTITY,
  JAVA_COMPLAINT_REPOSITORY,
  JAVA_SENTIMENT_LOGIC, JAVA_SLA_SCHEDULER, JAVA_GAMIFICATION, JAVA_QR_GENERATION,
  JAVA_CONTROLLER, JAVA_AUTH_CONTROLLER,
  JAVA_SECURITY, JAVA_JWT_PROVIDER,
  JAVA_APPLICATION
} from '../utils/javaCodeSnippets';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'code';
  content: string;
  timestamp?: Date;
}

const CODE_MAP: Record<string, { name: string; code: string; description: string }> = {
  'complaint': { name: 'Complaint.java', code: JAVA_COMPLAINT_ENTITY, description: 'JPA Entity for complaints with validation and enums' },
  'user': { name: 'User.java', code: JAVA_USER_ENTITY, description: 'User entity with Spring Security integration' },
  'complaintrepo': { name: 'ComplaintRepository.java', code: JAVA_COMPLAINT_REPOSITORY, description: 'Spring Data JPA repository with custom queries' },
  'sentiment': { name: 'SentimentAnalysisService.java', code: JAVA_SENTIMENT_LOGIC, description: 'AI-powered sentiment analysis service' },
  'sla': { name: 'SLAService.java', code: JAVA_SLA_SCHEDULER, description: 'SLA monitoring with scheduled breach checking' },
  'gamification': { name: 'GamificationService.java', code: JAVA_GAMIFICATION, description: 'Points, badges, and leaderboard system' },
  'qrcode': { name: 'QRCodeService.java', code: JAVA_QR_GENERATION, description: 'QR code generation using ZXing' },
  'complaintcontroller': { name: 'ComplaintController.java', code: JAVA_CONTROLLER, description: 'REST API endpoints for complaints' },
  'authcontroller': { name: 'AuthController.java', code: JAVA_AUTH_CONTROLLER, description: 'JWT authentication endpoints' },
  'security': { name: 'SecurityConfig.java', code: JAVA_SECURITY, description: 'Spring Security configuration' },
  'jwt': { name: 'JwtTokenProvider.java', code: JAVA_JWT_PROVIDER, description: 'JWT token generation and validation' },
  'app': { name: 'CmsApplication.java', code: JAVA_APPLICATION, description: 'Main Spring Boot entry point' },
};

const CATEGORIES: Record<string, string[]> = {
  'models': ['complaint', 'user'],
  'repositories': ['complaintrepo'],
  'services': ['sentiment', 'sla', 'gamification', 'qrcode'],
  'controllers': ['complaintcontroller', 'authcontroller'],
  'security': ['security', 'jwt', 'app'],
};

const JavaSourceViewer: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const addLines = async (newLines: { type: TerminalLine['type']; content: string }[], delay = 30) => {
    setIsTyping(true);
    for (const line of newLines) {
      await new Promise(resolve => setTimeout(resolve, delay));
      addLine(line.type, line.content);
    }
    setIsTyping(false);
  };

  // Welcome message on mount
  useEffect(() => {
    const welcomeLines = [
      { type: 'info' as const, content: '╔══════════════════════════════════════════════════════════════════════════════╗' },
      { type: 'info' as const, content: '║                                                                              ║' },
      { type: 'success' as const, content: '║   🚀 Enterprise CMS - Backend Architecture Terminal                         ║' },
      { type: 'info' as const, content: '║                                                                              ║' },
      { type: 'info' as const, content: '║   Spring Boot 3 • Java 17+ • JWT Authentication • JPA/Hibernate             ║' },
      { type: 'info' as const, content: '║                                                                              ║' },
      { type: 'info' as const, content: '╚══════════════════════════════════════════════════════════════════════════════╝' },
      { type: 'output' as const, content: '' },
      { type: 'output' as const, content: 'Welcome to the CMS Backend Architecture Explorer!' },
      { type: 'output' as const, content: 'Type "help" to see available commands.' },
      { type: 'output' as const, content: '' },
    ];
    addLines(welcomeLines, 40);
  }, []);

  // Scroll to bottom when new lines added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const processCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const parts = trimmedCmd.split(' ');
    const command = parts[0];
    const arg = parts[1];

    addLine('input', `$ ${cmd}`);

    if (!command) return;

    switch (command) {
      case 'help':
        await addLines([
          { type: 'info', content: '' },
          { type: 'success', content: '📚 Available Commands:' },
          { type: 'info', content: '─────────────────────────────────────────' },
          { type: 'output', content: '  help                  Show this help message' },
          { type: 'output', content: '  list                  List all code categories' },
          { type: 'output', content: '  cat <category>        Show files in a category' },
          { type: 'output', content: '  show <file>           Display source code for a file' },
          { type: 'output', content: '  tree                  Show full project structure' },
          { type: 'output', content: '  clear                 Clear the terminal' },
          { type: 'output', content: '  about                 About this project' },
          { type: 'info', content: '' },
          { type: 'info', content: '💡 Examples:' },
          { type: 'output', content: '  $ list' },
          { type: 'output', content: '  $ cat services' },
          { type: 'output', content: '  $ show sentiment' },
          { type: 'info', content: '' },
        ], 20);
        break;

      case 'list':
        await addLines([
          { type: 'info', content: '' },
          { type: 'success', content: '📂 Backend Code Categories:' },
          { type: 'info', content: '─────────────────────────────────────────' },
          { type: 'output', content: '  📁 models        Entity/Model classes (JPA)' },
          { type: 'output', content: '  📁 repositories  Spring Data JPA repositories' },
          { type: 'output', content: '  📁 services      Business logic services' },
          { type: 'output', content: '  📁 controllers   REST API controllers' },
          { type: 'output', content: '  📁 security      Security & JWT configuration' },
          { type: 'info', content: '' },
          { type: 'info', content: '💡 Type "cat <category>" to explore files' },
          { type: 'info', content: '' },
        ], 25);
        break;

      case 'cat':
        if (!arg) {
          addLine('error', '❌ Error: Please specify a category. Usage: cat <category>');
          addLine('output', '   Try: cat models, cat services, cat controllers');
          return;
        }
        if (!CATEGORIES[arg]) {
          addLine('error', `❌ Error: Unknown category "${arg}"`);
          addLine('output', '   Available: models, repositories, services, controllers, security');
          return;
        }
        const files = CATEGORIES[arg];
        await addLines([
          { type: 'info', content: '' },
          { type: 'success', content: `📂 ${arg.toUpperCase()}/` },
          { type: 'info', content: '─────────────────────────────────────────' },
          ...files.map(f => ({
            type: 'output' as const,
            content: `  📄 ${CODE_MAP[f].name.padEnd(35)} ${CODE_MAP[f].description}`
          })),
          { type: 'info', content: '' },
          { type: 'info', content: `💡 Type "show <name>" to view code (e.g., show ${files[0]})` },
          { type: 'info', content: '' },
        ], 25);
        break;

      case 'show':
        if (!arg) {
          addLine('error', '❌ Error: Please specify a file. Usage: show <filename>');
          addLine('output', '   Try: show sentiment, show sla, show security');
          return;
        }
        if (!CODE_MAP[arg]) {
          addLine('error', `❌ Error: Unknown file "${arg}"`);
          addLine('output', '   Type "tree" to see all available files');
          return;
        }
        const file = CODE_MAP[arg];
        await addLines([
          { type: 'info', content: '' },
          { type: 'success', content: `📄 ${file.name}` },
          { type: 'output', content: `   ${file.description}` },
          { type: 'info', content: '═'.repeat(80) },
        ], 30);
        addLine('code', file.code);
        await addLines([
          { type: 'info', content: '═'.repeat(80) },
          { type: 'info', content: '' },
        ], 30);
        break;

      case 'tree':
        await addLines([
          { type: 'info', content: '' },
          { type: 'success', content: '🌳 Project Structure:' },
          { type: 'info', content: '' },
          { type: 'output', content: 'java/' },
          { type: 'output', content: '├── model/' },
          { type: 'output', content: '│   ├── Complaint.java      [show complaint]' },
          { type: 'output', content: '│   └── User.java           [show user]' },
          { type: 'output', content: '├── repository/' },
          { type: 'output', content: '│   └── ComplaintRepository.java  [show complaintrepo]' },
          { type: 'output', content: '├── service/' },
          { type: 'output', content: '│   ├── SentimentAnalysisService.java  [show sentiment]' },
          { type: 'output', content: '│   ├── SLAService.java              [show sla]' },
          { type: 'output', content: '│   ├── GamificationService.java     [show gamification]' },
          { type: 'output', content: '│   └── QRCodeService.java           [show qrcode]' },
          { type: 'output', content: '├── controller/' },
          { type: 'output', content: '│   ├── ComplaintController.java     [show complaintcontroller]' },
          { type: 'output', content: '│   └── AuthController.java          [show authcontroller]' },
          { type: 'output', content: '├── security/' },
          { type: 'output', content: '│   ├── SecurityConfig.java          [show security]' },
          { type: 'output', content: '│   └── JwtTokenProvider.java        [show jwt]' },
          { type: 'output', content: '└── CmsApplication.java              [show app]' },
          { type: 'info', content: '' },
        ], 15);
        break;

      case 'clear':
        setLines([]);
        return;

      case 'about':
        await addLines([
          { type: 'info', content: '' },
          { type: 'success', content: '🏢 Enterprise Complaint Management System' },
          { type: 'info', content: '─────────────────────────────────────────' },
          { type: 'output', content: '  Version: 1.0.0' },
          { type: 'output', content: '  Framework: Spring Boot 3.x' },
          { type: 'output', content: '  Language: Java 17+' },
          { type: 'output', content: '' },
          { type: 'success', content: '✨ Features:' },
          { type: 'output', content: '  • JWT Authentication & Authorization' },
          { type: 'output', content: '  • AI-powered Sentiment Analysis' },
          { type: 'output', content: '  • SLA Monitoring with Auto-Escalation' },
          { type: 'output', content: '  • Staff Gamification System' },
          { type: 'output', content: '  • QR Code Tracking' },
          { type: 'output', content: '  • Role-based Access Control' },
          { type: 'info', content: '' },
        ], 25);
        break;

      default:
        addLine('error', `❌ Command not found: ${command}`);
        addLine('output', '   Type "help" for available commands');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
    processCommand(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-emerald-400';
      case 'info': return 'text-slate-500';
      case 'code': return 'text-amber-300';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Terminal Container */}
      <div
        className="flex-1 bg-[#0d1117] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50"
        style={{
          boxShadow: '0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer shadow-lg shadow-red-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer shadow-lg shadow-yellow-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer shadow-lg shadow-green-500/20"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-slate-400 font-mono">cms-backend-explorer</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            bash
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          className="p-4 h-[calc(100vh-320px)] min-h-[400px] overflow-y-auto font-mono text-sm leading-relaxed scroll-smooth"
          style={{
            background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Lines */}
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`${getLineColor(line.type)} ${line.type === 'code' ? 'whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg my-2 border border-slate-700/30 overflow-x-auto' : ''} animate-in fade-in slide-in-from-bottom-1 duration-200`}
              style={{ animationDelay: `${idx * 10}ms` }}
            >
              {line.content}
            </div>
          ))}

          {/* Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center mt-2 group">
            <span className="text-emerald-400 mr-2 group-focus-within:text-emerald-300 transition-colors">
              <span className="text-blue-400">cms</span>
              <span className="text-slate-500">:</span>
              <span className="text-purple-400">~</span>
              <span className="text-slate-500">$</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-slate-100 focus:outline-none caret-emerald-400 placeholder-slate-600"
              placeholder={isTyping ? '' : 'Type a command...'}
              autoFocus
              disabled={isTyping}
            />
            {isTyping && (
              <span className="text-slate-500 animate-pulse">Processing...</span>
            )}
          </form>
        </div>
      </div>

      {/* Quick Commands Bar */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['help', 'list', 'tree', 'cat services', 'show sentiment', 'clear'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd);
              inputRef.current?.focus();
            }}
            className="px-3 py-1.5 text-xs font-mono bg-slate-800 text-slate-400 rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            $ {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};

export default JavaSourceViewer;