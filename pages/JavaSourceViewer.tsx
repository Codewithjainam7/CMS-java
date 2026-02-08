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
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'code' | 'ascii' | 'highlight';
  content: string;
}

// All files with multiple keyword aliases
const CODE_MAP: Record<string, { name: string; code: string; description: string; path: string }> = {
  // Models
  'complaint.java': { name: 'Complaint.java', code: JAVA_COMPLAINT_ENTITY, description: 'JPA Entity for complaints', path: 'model/' },
  'complaint': { name: 'Complaint.java', code: JAVA_COMPLAINT_ENTITY, description: 'JPA Entity for complaints', path: 'model/' },
  'user.java': { name: 'User.java', code: JAVA_USER_ENTITY, description: 'User entity with Spring Security', path: 'model/' },
  'user': { name: 'User.java', code: JAVA_USER_ENTITY, description: 'User entity with Spring Security', path: 'model/' },

  // Repositories
  'complaintrepository.java': { name: 'ComplaintRepository.java', code: JAVA_COMPLAINT_REPOSITORY, description: 'Spring Data JPA repository', path: 'repository/' },
  'complaintrepo': { name: 'ComplaintRepository.java', code: JAVA_COMPLAINT_REPOSITORY, description: 'Spring Data JPA repository', path: 'repository/' },

  // Services
  'sentimentanalysisservice.java': { name: 'SentimentAnalysisService.java', code: JAVA_SENTIMENT_LOGIC, description: 'AI sentiment analysis', path: 'service/' },
  'sentiment': { name: 'SentimentAnalysisService.java', code: JAVA_SENTIMENT_LOGIC, description: 'AI sentiment analysis', path: 'service/' },
  'slaservice.java': { name: 'SLAService.java', code: JAVA_SLA_SCHEDULER, description: 'SLA monitoring service', path: 'service/' },
  'sla': { name: 'SLAService.java', code: JAVA_SLA_SCHEDULER, description: 'SLA monitoring service', path: 'service/' },
  'gamificationservice.java': { name: 'GamificationService.java', code: JAVA_GAMIFICATION, description: 'Staff gamification system', path: 'service/' },
  'gamification': { name: 'GamificationService.java', code: JAVA_GAMIFICATION, description: 'Staff gamification system', path: 'service/' },
  'qrcodeservice.java': { name: 'QRCodeService.java', code: JAVA_QR_GENERATION, description: 'QR code generation', path: 'service/' },
  'qrcode': { name: 'QRCodeService.java', code: JAVA_QR_GENERATION, description: 'QR code generation', path: 'service/' },
  'qr': { name: 'QRCodeService.java', code: JAVA_QR_GENERATION, description: 'QR code generation', path: 'service/' },

  // Controllers
  'complaintcontroller.java': { name: 'ComplaintController.java', code: JAVA_CONTROLLER, description: 'REST API endpoints', path: 'controller/' },
  'complaintcontroller': { name: 'ComplaintController.java', code: JAVA_CONTROLLER, description: 'REST API endpoints', path: 'controller/' },
  'authcontroller.java': { name: 'AuthController.java', code: JAVA_AUTH_CONTROLLER, description: 'JWT auth endpoints', path: 'controller/' },
  'authcontroller': { name: 'AuthController.java', code: JAVA_AUTH_CONTROLLER, description: 'JWT auth endpoints', path: 'controller/' },
  'auth': { name: 'AuthController.java', code: JAVA_AUTH_CONTROLLER, description: 'JWT auth endpoints', path: 'controller/' },

  // Security
  'securityconfig.java': { name: 'SecurityConfig.java', code: JAVA_SECURITY, description: 'Spring Security config', path: 'security/' },
  'security': { name: 'SecurityConfig.java', code: JAVA_SECURITY, description: 'Spring Security config', path: 'security/' },
  'jwttokenprovider.java': { name: 'JwtTokenProvider.java', code: JAVA_JWT_PROVIDER, description: 'JWT token handling', path: 'security/' },
  'jwt': { name: 'JwtTokenProvider.java', code: JAVA_JWT_PROVIDER, description: 'JWT token handling', path: 'security/' },
  'cmsapplication.java': { name: 'CmsApplication.java', code: JAVA_APPLICATION, description: 'Main entry point', path: '' },
  'app': { name: 'CmsApplication.java', code: JAVA_APPLICATION, description: 'Main entry point', path: '' },
  'main': { name: 'CmsApplication.java', code: JAVA_APPLICATION, description: 'Main entry point', path: '' },
};

const DIRECTORY_STRUCTURE: Record<string, string[]> = {
  '': ['model/', 'repository/', 'service/', 'controller/', 'security/', 'CmsApplication.java'],
  'model': ['Complaint.java', 'User.java', 'Comment.java'],
  'repository': ['ComplaintRepository.java', 'UserRepository.java'],
  'service': ['ComplaintService.java', 'SentimentAnalysisService.java', 'SLAService.java', 'GamificationService.java', 'QRCodeService.java', 'NotificationService.java'],
  'controller': ['ComplaintController.java', 'AuthController.java'],
  'security': ['SecurityConfig.java', 'JwtTokenProvider.java', 'JwtAuthenticationFilter.java'],
};

const JavaSourceViewer: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [currentDir, setCurrentDir] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { type, content }]);
  };

  const addLines = async (newLines: { type: TerminalLine['type']; content: string }[], delay = 15) => {
    setIsTyping(true);
    for (const line of newLines) {
      await new Promise(resolve => setTimeout(resolve, delay));
      addLine(line.type, line.content);
    }
    setIsTyping(false);
  };

  // Boot sequence on mount
  useEffect(() => {
    const bootSequence = async () => {
      setIsTyping(true);

      const bootLines = [
        { type: 'info' as const, content: '[    0.000000] Booting CMS Backend Terminal...' },
        { type: 'info' as const, content: '[    0.001234] Loading Spring Boot 3.x kernel...' },
        { type: 'info' as const, content: '[    0.002456] Initializing JPA/Hibernate subsystem...' },
        { type: 'info' as const, content: '[    0.003789] JWT Security module loaded.' },
        { type: 'success' as const, content: '[    0.005000] System ready.' },
        { type: 'output' as const, content: '' },
      ];

      for (const line of bootLines) {
        await new Promise(resolve => setTimeout(resolve, 100));
        addLine(line.type, line.content);
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      const asciiArt = [
        { type: 'ascii' as const, content: '   ______ __  __  _____   ____             _                  _ ' },
        { type: 'ascii' as const, content: '  / ____||  \\/  |/ ____| |  _ \\           | |                | |' },
        { type: 'ascii' as const, content: ' | |     | \\  / | (___   | |_) | __ _  ___| | _____ _ __   __| |' },
        { type: 'ascii' as const, content: ' | |     | |\\/| |\\___ \\  |  _ < / _` |/ __| |/ / _ \\ \'_ \\ / _` |' },
        { type: 'ascii' as const, content: ' | |____ | |  | |____) | | |_) | (_| | (__|   <  __/ | | | (_| |' },
        { type: 'ascii' as const, content: '  \\_____||_|  |_|_____/  |____/ \\__,_|\\___|_|\\_\\___|_| |_|\\__,_|' },
        { type: 'output' as const, content: '' },
        { type: 'highlight' as const, content: '  ⚡ Enterprise Complaint Management System - Source Explorer v2.0' },
        { type: 'output' as const, content: '' },
      ];

      for (const line of asciiArt) {
        await new Promise(resolve => setTimeout(resolve, 30));
        addLine(line.type, line.content);
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      addLine('success', '  Type "help" to see available commands, or "ls" to list files.');
      addLine('output', '');

      setIsTyping(false);
    };

    bootSequence();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const getPrompt = () => {
    const dir = currentDir ? `/${currentDir}` : '';
    return `cms:~/java${dir}$`;
  };

  const processCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const parts = trimmedCmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    addLine('input', `${getPrompt()} ${cmd}`);

    if (!command) return;

    switch (command) {
      case 'help':
      case 'man':
      case '?':
        await addLines([
          { type: 'output', content: '' },
          { type: 'highlight', content: '╭──────────────────────────────────────────────────────────────────╮' },
          { type: 'highlight', content: '│                    📖 COMMAND REFERENCE                         │' },
          { type: 'highlight', content: '╰──────────────────────────────────────────────────────────────────╯' },
          { type: 'output', content: '' },
          { type: 'success', content: '  Navigation:' },
          { type: 'output', content: '    ls [dir]              List files in current/specified directory' },
          { type: 'output', content: '    cd <dir>              Change directory (cd model, cd ..)' },
          { type: 'output', content: '    pwd                   Print current directory' },
          { type: 'output', content: '    tree                  Show full directory tree' },
          { type: 'output', content: '' },
          { type: 'success', content: '  File Viewing:' },
          { type: 'output', content: '    cat <file>            Display file contents' },
          { type: 'output', content: '    less <file>           Same as cat (alias)' },
          { type: 'output', content: '    head <file>           Show first 20 lines' },
          { type: 'output', content: '' },
          { type: 'success', content: '  Search:' },
          { type: 'output', content: '    find <keyword>        Search for files by name' },
          { type: 'output', content: '    grep <text>           Search in file descriptions' },
          { type: 'output', content: '' },
          { type: 'success', content: '  System:' },
          { type: 'output', content: '    clear                 Clear terminal' },
          { type: 'output', content: '    about                 About this project' },
          { type: 'output', content: '    neofetch              System info' },
          { type: 'output', content: '' },
          { type: 'info', content: '  💡 Tip: Use Tab for autocomplete, ↑↓ for history' },
          { type: 'output', content: '' },
        ], 10);
        break;

      case 'ls':
      case 'dir':
        const lsDir = args[0]?.replace(/\/$/, '') || currentDir;
        const lsContents = DIRECTORY_STRUCTURE[lsDir];
        if (!lsContents && lsDir !== '') {
          addLine('error', `ls: cannot access '${lsDir}': No such directory`);
          return;
        }
        const contents = lsContents || DIRECTORY_STRUCTURE[''];
        await addLines([
          { type: 'output', content: '' },
          ...contents.map(item => ({
            type: (item.endsWith('/') ? 'success' : 'output') as const,
            content: `  ${item.endsWith('/') ? '📁' : '📄'} ${item}`
          })),
          { type: 'output', content: '' },
          { type: 'info', content: `  ${contents.length} items` },
          { type: 'output', content: '' },
        ], 20);
        break;

      case 'cd':
        const target = args[0]?.replace(/\/$/, '');
        if (!target || target === '~' || target === '/') {
          setCurrentDir('');
        } else if (target === '..') {
          setCurrentDir('');
        } else if (DIRECTORY_STRUCTURE[target]) {
          setCurrentDir(target);
        } else if (DIRECTORY_STRUCTURE[currentDir]?.some(f => f.replace('/', '') === target)) {
          setCurrentDir(target);
        } else {
          addLine('error', `cd: ${target}: No such directory`);
          return;
        }
        break;

      case 'pwd':
        addLine('output', `/java${currentDir ? '/' + currentDir : ''}`);
        break;

      case 'cat':
      case 'less':
      case 'more':
      case 'view':
      case 'open':
        const fileName = args[0]?.toLowerCase();
        if (!fileName) {
          addLine('error', `${command}: missing file operand`);
          return;
        }
        const file = CODE_MAP[fileName];
        if (!file) {
          addLine('error', `${command}: ${args[0]}: No such file`);
          addLine('info', '  💡 Try "ls" to see available files, or "find <keyword>" to search');
          return;
        }
        await addLines([
          { type: 'output', content: '' },
          { type: 'highlight', content: `╭${'─'.repeat(76)}╮` },
          { type: 'highlight', content: `│ 📄 ${file.name.padEnd(60)} ${file.path.padStart(10)} │` },
          { type: 'highlight', content: `│ ${file.description.padEnd(72)} │` },
          { type: 'highlight', content: `╰${'─'.repeat(76)}╯` },
        ], 20);
        addLine('code', file.code);
        addLine('output', '');
        addLine('info', `  ✓ End of ${file.name}`);
        addLine('output', '');
        break;

      case 'head':
        const headFile = args[0]?.toLowerCase();
        if (!headFile) {
          addLine('error', 'head: missing file operand');
          return;
        }
        const hFile = CODE_MAP[headFile];
        if (!hFile) {
          addLine('error', `head: ${args[0]}: No such file`);
          return;
        }
        const headLines = hFile.code.split('\n').slice(0, 20).join('\n');
        addLine('output', '');
        addLine('info', `==> ${hFile.name} (first 20 lines) <==`);
        addLine('code', headLines);
        addLine('info', '  ... (use "cat" to see full file)');
        addLine('output', '');
        break;

      case 'tree':
        await addLines([
          { type: 'output', content: '' },
          { type: 'success', content: '📂 java/' },
          { type: 'output', content: '├── 📁 model/' },
          { type: 'output', content: '│   ├── 📄 Complaint.java' },
          { type: 'output', content: '│   ├── 📄 User.java' },
          { type: 'output', content: '│   └── 📄 Comment.java' },
          { type: 'output', content: '├── 📁 repository/' },
          { type: 'output', content: '│   ├── 📄 ComplaintRepository.java' },
          { type: 'output', content: '│   └── 📄 UserRepository.java' },
          { type: 'output', content: '├── 📁 service/' },
          { type: 'output', content: '│   ├── 📄 ComplaintService.java' },
          { type: 'output', content: '│   ├── 📄 SentimentAnalysisService.java' },
          { type: 'output', content: '│   ├── 📄 SLAService.java' },
          { type: 'output', content: '│   ├── 📄 GamificationService.java' },
          { type: 'output', content: '│   ├── 📄 QRCodeService.java' },
          { type: 'output', content: '│   └── 📄 NotificationService.java' },
          { type: 'output', content: '├── 📁 controller/' },
          { type: 'output', content: '│   ├── 📄 ComplaintController.java' },
          { type: 'output', content: '│   └── 📄 AuthController.java' },
          { type: 'output', content: '├── 📁 security/' },
          { type: 'output', content: '│   ├── 📄 SecurityConfig.java' },
          { type: 'output', content: '│   ├── 📄 JwtTokenProvider.java' },
          { type: 'output', content: '│   └── 📄 JwtAuthenticationFilter.java' },
          { type: 'output', content: '└── 📄 CmsApplication.java' },
          { type: 'output', content: '' },
          { type: 'info', content: '5 directories, 17 files' },
          { type: 'output', content: '' },
        ], 15);
        break;

      case 'find':
        const searchTerm = args[0]?.toLowerCase();
        if (!searchTerm) {
          addLine('error', 'find: missing search term');
          return;
        }
        const matches = Object.entries(CODE_MAP)
          .filter(([key, val]) => key.includes(searchTerm) || val.name.toLowerCase().includes(searchTerm))
          .reduce((acc, [_, val]) => {
            if (!acc.find(v => v.name === val.name)) acc.push(val);
            return acc;
          }, [] as typeof CODE_MAP[string][]);

        if (matches.length === 0) {
          addLine('error', `find: no files matching '${searchTerm}'`);
        } else {
          await addLines([
            { type: 'output', content: '' },
            { type: 'success', content: `Found ${matches.length} file(s):` },
            ...matches.map(m => ({ type: 'output' as const, content: `  📄 ${m.path}${m.name}` })),
            { type: 'output', content: '' },
          ], 20);
        }
        break;

      case 'grep':
        const grepTerm = args.join(' ').toLowerCase();
        if (!grepTerm) {
          addLine('error', 'grep: missing search pattern');
          return;
        }
        const grepMatches = Object.entries(CODE_MAP)
          .filter(([_, val]) => val.description.toLowerCase().includes(grepTerm))
          .reduce((acc, [_, val]) => {
            if (!acc.find(v => v.name === val.name)) acc.push(val);
            return acc;
          }, [] as typeof CODE_MAP[string][]);

        if (grepMatches.length === 0) {
          addLine('output', `(no matches for '${grepTerm}')`);
        } else {
          await addLines([
            { type: 'output', content: '' },
            ...grepMatches.map(m => ({
              type: 'output' as const,
              content: `  ${m.path}${m.name}: ${m.description}`
            })),
            { type: 'output', content: '' },
          ], 20);
        }
        break;

      case 'neofetch':
        await addLines([
          { type: 'output', content: '' },
          { type: 'ascii', content: '        ⢀⣤⣴⣶⣶⣶⣦⣤⡀        ' },
          { type: 'ascii', content: '      ⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄      ' },
          { type: 'ascii', content: '     ⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦     ' },
          { type: 'ascii', content: '    ⣼⣿⣿⣿⠋⠉⠙⣿⣿⣿⠋⠉⠙⣿⣿⣧    ' },
          { type: 'ascii', content: '   ⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇   ' },
          { type: 'ascii', content: '   ⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇   ' },
          { type: 'ascii', content: '    ⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟    ' },
          { type: 'ascii', content: '     ⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁     ' },
          { type: 'output', content: '' },
          { type: 'success', content: '  cms-backend@2.0.0' },
          { type: 'output', content: '  ─────────────────' },
          { type: 'output', content: '  OS: Spring Boot 3.x' },
          { type: 'output', content: '  Kernel: Java 17+ (LTS)' },
          { type: 'output', content: '  Packages: 17 source files' },
          { type: 'output', content: '  Auth: JWT + BCrypt' },
          { type: 'output', content: '  DB: JPA/Hibernate' },
          { type: 'output', content: '  Features: Sentiment, SLA, Gamification' },
          { type: 'output', content: '' },
        ], 25);
        break;

      case 'clear':
      case 'cls':
        setLines([]);
        return;

      case 'about':
        await addLines([
          { type: 'output', content: '' },
          { type: 'highlight', content: '╭──────────────────────────────────────────────────────────────────╮' },
          { type: 'highlight', content: '│              🏢 Enterprise CMS - Backend Architecture           │' },
          { type: 'highlight', content: '╰──────────────────────────────────────────────────────────────────╯' },
          { type: 'output', content: '' },
          { type: 'output', content: '  This terminal provides an interactive way to explore the Java' },
          { type: 'output', content: '  Spring Boot backend code for the Complaint Management System.' },
          { type: 'output', content: '' },
          { type: 'success', content: '  Key Technologies:' },
          { type: 'output', content: '    • Spring Boot 3.x with Spring Security' },
          { type: 'output', content: '    • JWT Authentication & Authorization' },
          { type: 'output', content: '    • JPA/Hibernate for ORM' },
          { type: 'output', content: '    • AI-powered Sentiment Analysis' },
          { type: 'output', content: '    • SLA Monitoring with Auto-escalation' },
          { type: 'output', content: '    • Staff Gamification System' },
          { type: 'output', content: '' },
        ], 20);
        break;

      case 'whoami':
        addLine('output', 'admin');
        break;

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'echo':
        addLine('output', args.join(' '));
        break;

      case 'exit':
      case 'quit':
        addLine('info', 'Goodbye! 👋');
        break;

      default:
        addLine('error', `${command}: command not found`);
        addLine('info', '  Type "help" for available commands');
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
        setHistoryIndex(historyIndex - 1);
        setInput(commandHistory[commandHistory.length - historyIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete
      const cmds = ['help', 'ls', 'cd', 'pwd', 'cat', 'tree', 'find', 'grep', 'clear', 'about', 'neofetch'];
      const match = cmds.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  const getLineStyle = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-emerald-400';
      case 'info': return 'text-slate-500';
      case 'code': return 'text-amber-200/90';
      case 'ascii': return 'text-blue-400 font-bold';
      case 'highlight': return 'text-purple-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Terminal Container with glow */}
      <div
        className="flex-1 bg-[#0a0e14] rounded-2xl overflow-hidden border border-cyan-500/20 relative"
        style={{
          boxShadow: '0 0 80px rgba(6, 182, 212, 0.15), 0 0 40px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" style={{ animationDuration: '4s' }} />

        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
          }}
        />

        {/* Terminal Header */}
        <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 hover:scale-110 transition-transform cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50 hover:scale-110 transition-transform cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 hover:scale-110 transition-transform cursor-pointer"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
              <span className="text-xs text-emerald-400 font-mono font-bold">LIVE</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">cms-backend-explorer</span>
          </div>
          <div className="text-xs text-slate-600 font-mono">
            zsh • java
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          className="relative p-5 h-[calc(100vh-320px)] min-h-[450px] overflow-y-auto font-mono text-sm leading-relaxed scroll-smooth"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Lines */}
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`${getLineStyle(line.type)} ${line.type === 'code'
                  ? 'whitespace-pre-wrap bg-slate-900/80 p-4 rounded-lg my-3 border border-slate-700/50 overflow-x-auto backdrop-blur-sm shadow-lg'
                  : ''
                }`}
              style={{
                animation: 'fadeSlideIn 0.15s ease-out forwards',
                opacity: 0,
                animationDelay: `${Math.min(idx * 5, 100)}ms`
              }}
            >
              {line.content}
            </div>
          ))}

          {/* Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center mt-3 group">
            <span className="text-emerald-400 mr-2 font-bold">
              <span className="text-cyan-400">cms</span>
              <span className="text-slate-600">:</span>
              <span className="text-purple-400">~/java{currentDir ? `/${currentDir}` : ''}</span>
              <span className="text-slate-600">$</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-slate-100 focus:outline-none caret-cyan-400 placeholder-slate-700"
              placeholder={isTyping ? '' : 'Enter command...'}
              autoFocus
              disabled={isTyping}
              spellCheck={false}
            />
            {isTyping && (
              <span className="text-cyan-500 animate-pulse flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            )}
          </form>
        </div>
      </div>

      {/* Quick Commands with glow */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { cmd: 'help', icon: '❓' },
          { cmd: 'ls', icon: '📁' },
          { cmd: 'tree', icon: '🌳' },
          { cmd: 'neofetch', icon: '💻' },
          { cmd: 'cat sentiment', icon: '🧠' },
          { cmd: 'cat security', icon: '🔐' },
          { cmd: 'clear', icon: '🧹' },
        ].map(({ cmd, icon }) => (
          <button
            key={cmd}
            onClick={() => {
              if (!isTyping) {
                processCommand(cmd);
              }
            }}
            className="group px-4 py-2 text-xs font-mono bg-slate-900 text-slate-400 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 active:scale-95"
          >
            <span className="mr-2">{icon}</span>
            <span className="text-slate-500 group-hover:text-slate-400">$</span> {cmd}
          </button>
        ))}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default JavaSourceViewer;