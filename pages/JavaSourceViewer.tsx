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
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'code' | 'ascii' | 'highlight' | 'boot';
  content: string;
}

interface FileInfo {
  name: string;
  code: string;
  description: string;
  path: string;
  keywords: string[];
}

// All files with keywords for matching
const FILES: FileInfo[] = [
  { name: 'Complaint.java', code: JAVA_COMPLAINT_ENTITY, description: 'JPA Entity for complaints with validation', path: 'model/', keywords: ['complaint', 'complaint.java', 'entity', 'model'] },
  { name: 'User.java', code: JAVA_USER_ENTITY, description: 'User entity with Spring Security integration', path: 'model/', keywords: ['user', 'user.java', 'userdetails'] },
  { name: 'ComplaintRepository.java', code: JAVA_COMPLAINT_REPOSITORY, description: 'Spring Data JPA repository with custom queries', path: 'repository/', keywords: ['complaintrepository', 'complaintrepository.java', 'repo', 'repository'] },
  { name: 'SentimentAnalysisService.java', code: JAVA_SENTIMENT_LOGIC, description: 'AI-powered sentiment analysis service', path: 'service/', keywords: ['sentiment', 'sentimentanalysisservice', 'sentimentanalysisservice.java', 'analysis', 'ai'] },
  { name: 'SLAService.java', code: JAVA_SLA_SCHEDULER, description: 'SLA monitoring with scheduled breach checking', path: 'service/', keywords: ['sla', 'slaservice', 'slaservice.java', 'deadline', 'breach'] },
  { name: 'GamificationService.java', code: JAVA_GAMIFICATION, description: 'Points, badges and leaderboard system', path: 'service/', keywords: ['gamification', 'gamificationservice', 'gamificationservice.java', 'points', 'badges', 'leaderboard'] },
  { name: 'QRCodeService.java', code: JAVA_QR_GENERATION, description: 'QR code generation using ZXing', path: 'service/', keywords: ['qr', 'qrcode', 'qrcodeservice', 'qrcodeservice.java', 'zxing'] },
  { name: 'ComplaintController.java', code: JAVA_CONTROLLER, description: 'REST API endpoints for complaint management', path: 'controller/', keywords: ['complaintcontroller', 'complaintcontroller.java', 'api', 'rest', 'controller'] },
  { name: 'AuthController.java', code: JAVA_AUTH_CONTROLLER, description: 'JWT authentication and registration endpoints', path: 'controller/', keywords: ['auth', 'authcontroller', 'authcontroller.java', 'login', 'register', 'authentication'] },
  { name: 'SecurityConfig.java', code: JAVA_SECURITY, description: 'Spring Security filter chain configuration', path: 'security/', keywords: ['security', 'securityconfig', 'securityconfig.java', 'config', 'filter'] },
  { name: 'JwtTokenProvider.java', code: JAVA_JWT_PROVIDER, description: 'JWT token generation and validation', path: 'security/', keywords: ['jwt', 'jwttokenprovider', 'jwttokenprovider.java', 'token', 'provider'] },
  { name: 'CmsApplication.java', code: JAVA_APPLICATION, description: 'Main Spring Boot application entry point', path: '', keywords: ['app', 'main', 'cmsapplication', 'cmsapplication.java', 'application', 'springboot'] },
];

const findFile = (query: string): FileInfo | undefined => {
  const q = query.toLowerCase().trim();
  return FILES.find(f =>
    f.keywords.some(k => k === q) ||
    f.name.toLowerCase() === q ||
    f.name.toLowerCase().replace('.java', '') === q
  );
};

const DIRECTORY_STRUCTURE: Record<string, string[]> = {
  '': ['model/', 'repository/', 'service/', 'controller/', 'security/', 'CmsApplication.java'],
  'model': ['Complaint.java', 'User.java', 'Comment.java'],
  'repository': ['ComplaintRepository.java', 'UserRepository.java'],
  'service': ['ComplaintService.java', 'SentimentAnalysisService.java', 'SLAService.java', 'GamificationService.java', 'QRCodeService.java', 'NotificationService.java'],
  'controller': ['ComplaintController.java', 'AuthController.java'],
  'security': ['SecurityConfig.java', 'JwtTokenProvider.java', 'JwtAuthenticationFilter.java'],
};

// Java syntax highlighting
const highlightJavaCode = (code: string): React.ReactNode => {
  const keywords = ['package', 'import', 'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'return', 'new', 'if', 'else', 'for', 'while', 'try', 'catch', 'throw', 'throws', 'enum', 'default', 'switch', 'case', 'break', 'continue', 'this', 'super', 'null', 'true', 'false', 'instanceof'];
  const types = ['String', 'int', 'Integer', 'long', 'Long', 'boolean', 'Boolean', 'double', 'Double', 'float', 'List', 'Map', 'Set', 'Optional', 'LocalDateTime', 'Date', 'Object', 'byte', 'User', 'Complaint', 'Sentiment', 'Priority', 'Category', 'ComplaintStatus'];
  const annotations = /@\w+/g;

  return code.split('\n').map((line, lineNum) => {
    let highlighted = line;

    // Escape HTML
    highlighted = highlighted.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Comments (must be first)
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-slate-500 italic">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 italic">$1</span>');

    // Strings
    highlighted = highlighted.replace(/(".*?")/g, '<span class="text-amber-400">$1</span>');

    // Annotations
    highlighted = highlighted.replace(/(@\w+)/g, '<span class="text-yellow-400">$1</span>');

    // Keywords
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="text-purple-400 font-semibold">$1</span>');
    });

    // Types
    types.forEach(t => {
      const regex = new RegExp(`\\b(${t})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span class="text-cyan-400">$1</span>');
    });

    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');

    // Method calls
    highlighted = highlighted.replace(/\.(\w+)\(/g, '.<span class="text-blue-400">$1</span>(');

    return (
      <div key={lineNum} className="flex hover:bg-white/5 transition-colors">
        <span className="w-12 text-right pr-4 text-slate-600 select-none border-r border-slate-700/50 mr-4">{lineNum + 1}</span>
        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
    );
  });
};

const JavaSourceViewer: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
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

  // Boot animation
  useEffect(() => {
    const boot = async () => {
      // Animate progress bar
      for (let i = 0; i <= 100; i += 2) {
        await new Promise(r => setTimeout(r, 30));
        setBootProgress(i);
      }

      await new Promise(r => setTimeout(r, 300));
      setIsBooting(false);

      // Show welcome after boot
      await new Promise(r => setTimeout(r, 100));

      const welcomeLines = [
        { type: 'success' as const, content: '✓ System initialized successfully' },
        { type: 'output' as const, content: '' },
        { type: 'highlight' as const, content: '┌────────────────────────────────────────────────────────────────────────┐' },
        { type: 'highlight' as const, content: '│                                                                        │' },
        { type: 'ascii' as const, content: '│     ██████╗███╗   ███╗███████╗    ██████╗  █████╗  ██████╗██╗  ██╗    │' },
        { type: 'ascii' as const, content: '│    ██╔════╝████╗ ████║██╔════╝    ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝    │' },
        { type: 'ascii' as const, content: '│    ██║     ██╔████╔██║███████╗    ██████╔╝███████║██║     █████╔╝     │' },
        { type: 'ascii' as const, content: '│    ██║     ██║╚██╔╝██║╚════██║    ██╔══██╗██╔══██║██║     ██╔═██╗     │' },
        { type: 'ascii' as const, content: '│    ╚██████╗██║ ╚═╝ ██║███████║    ██████╔╝██║  ██║╚██████╗██║  ██╗    │' },
        { type: 'ascii' as const, content: '│     ╚═════╝╚═╝     ╚═╝╚══════╝    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝    │' },
        { type: 'highlight' as const, content: '│                                                                        │' },
        { type: 'success' as const, content: '│          ⚡ Enterprise Complaint Management System v2.0 ⚡              │' },
        { type: 'info' as const, content: '│                    Backend Source Code Explorer                        │' },
        { type: 'highlight' as const, content: '│                                                                        │' },
        { type: 'highlight' as const, content: '└────────────────────────────────────────────────────────────────────────┘' },
        { type: 'output' as const, content: '' },
        { type: 'output' as const, content: '  Welcome! Type "help" for commands or "ls" to list files.' },
        { type: 'output' as const, content: '' },
      ];

      for (const line of welcomeLines) {
        await new Promise(r => setTimeout(r, 25));
        addLine(line.type, line.content);
      }
    };

    boot();
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
    const argJoined = args.join(' ');

    addLine('input', `${getPrompt()} ${cmd}`);

    if (!command) return;

    switch (command) {
      case 'help':
      case 'man':
      case '?':
        await addLines([
          { type: 'output', content: '' },
          { type: 'highlight', content: '┌─────────────────────────────────────────────────────────────────┐' },
          { type: 'highlight', content: '│                    📖 COMMAND REFERENCE                        │' },
          { type: 'highlight', content: '└─────────────────────────────────────────────────────────────────┘' },
          { type: 'output', content: '' },
          { type: 'success', content: '  📁 Navigation:' },
          { type: 'output', content: '    ls [dir]              List files in directory' },
          { type: 'output', content: '    cd <dir>              Change directory (cd model, cd ..)' },
          { type: 'output', content: '    pwd                   Print current directory' },
          { type: 'output', content: '    tree                  Show full project structure' },
          { type: 'output', content: '' },
          { type: 'success', content: '  📄 View Files:' },
          { type: 'output', content: '    cat <file>            Show file with syntax highlighting' },
          { type: 'output', content: '    head <file>           Show first 25 lines' },
          { type: 'output', content: '' },
          { type: 'info', content: '  💡 File names are flexible! These all work:' },
          { type: 'output', content: '      cat SLAService' },
          { type: 'output', content: '      cat slaservice.java' },
          { type: 'output', content: '      cat sla' },
          { type: 'output', content: '' },
          { type: 'success', content: '  🔍 Search:' },
          { type: 'output', content: '    find <keyword>        Search files by name' },
          { type: 'output', content: '' },
          { type: 'success', content: '  ⚙️ System:' },
          { type: 'output', content: '    clear                 Clear terminal' },
          { type: 'output', content: '    neofetch              System info' },
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
          { type: 'info', content: `  📂 ${lsDir || 'java'}/` },
          { type: 'output', content: '' },
          ...contents.map(item => ({
            type: (item.endsWith('/') ? 'success' : 'output') as const,
            content: `    ${item.endsWith('/') ? '📁' : '📄'} ${item}`
          })),
          { type: 'output', content: '' },
          { type: 'info', content: `  Total: ${contents.length} items` },
          { type: 'output', content: '' },
        ], 15);
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
      case 'show':
        if (!argJoined) {
          addLine('error', `${command}: missing file operand`);
          addLine('info', '  Usage: cat <filename>  (e.g., cat SLAService)');
          return;
        }
        const file = findFile(argJoined);
        if (!file) {
          addLine('error', `${command}: ${argJoined}: No such file`);
          addLine('info', '  💡 Try "ls" to see files, or "find <keyword>" to search');
          // Show suggestions
          const suggestions = FILES.filter(f =>
            f.name.toLowerCase().includes(argJoined.toLowerCase()) ||
            f.keywords.some(k => k.includes(argJoined.toLowerCase()))
          ).slice(0, 3);
          if (suggestions.length > 0) {
            addLine('info', `  Did you mean: ${suggestions.map(s => s.name).join(', ')}?`);
          }
          return;
        }
        await addLines([
          { type: 'output', content: '' },
          { type: 'highlight', content: `┌${'─'.repeat(74)}┐` },
          { type: 'success', content: `│  📄 ${file.name.padEnd(67)} │` },
          { type: 'info', content: `│     ${file.description.padEnd(65)} │` },
          { type: 'info', content: `│     Path: ${(file.path + file.name).padEnd(59)} │` },
          { type: 'highlight', content: `└${'─'.repeat(74)}┘` },
          { type: 'output', content: '' },
        ], 15);
        addLine('code', file.code);
        await addLines([
          { type: 'output', content: '' },
          { type: 'success', content: `  ✓ End of ${file.name} (${file.code.split('\n').length} lines)` },
          { type: 'output', content: '' },
        ], 10);
        break;

      case 'head':
        if (!argJoined) {
          addLine('error', 'head: missing file operand');
          return;
        }
        const hFile = findFile(argJoined);
        if (!hFile) {
          addLine('error', `head: ${argJoined}: No such file`);
          return;
        }
        const headCode = hFile.code.split('\n').slice(0, 25).join('\n');
        addLine('output', '');
        addLine('info', `  ==> ${hFile.name} (first 25 lines) <==`);
        addLine('output', '');
        addLine('code', headCode);
        addLine('info', '  ... (use "cat" to see full file)');
        addLine('output', '');
        break;

      case 'tree':
        await addLines([
          { type: 'output', content: '' },
          { type: 'success', content: '  📂 java/' },
          { type: 'output', content: '  ├── 📁 model/' },
          { type: 'output', content: '  │   ├── 📄 Complaint.java' },
          { type: 'output', content: '  │   ├── 📄 User.java' },
          { type: 'output', content: '  │   └── 📄 Comment.java' },
          { type: 'output', content: '  ├── 📁 repository/' },
          { type: 'output', content: '  │   ├── 📄 ComplaintRepository.java' },
          { type: 'output', content: '  │   └── 📄 UserRepository.java' },
          { type: 'output', content: '  ├── 📁 service/' },
          { type: 'output', content: '  │   ├── 📄 ComplaintService.java' },
          { type: 'output', content: '  │   ├── 📄 SentimentAnalysisService.java' },
          { type: 'output', content: '  │   ├── 📄 SLAService.java' },
          { type: 'output', content: '  │   ├── 📄 GamificationService.java' },
          { type: 'output', content: '  │   ├── 📄 QRCodeService.java' },
          { type: 'output', content: '  │   └── 📄 NotificationService.java' },
          { type: 'output', content: '  ├── 📁 controller/' },
          { type: 'output', content: '  │   ├── 📄 ComplaintController.java' },
          { type: 'output', content: '  │   └── 📄 AuthController.java' },
          { type: 'output', content: '  ├── 📁 security/' },
          { type: 'output', content: '  │   ├── 📄 SecurityConfig.java' },
          { type: 'output', content: '  │   ├── 📄 JwtTokenProvider.java' },
          { type: 'output', content: '  │   └── 📄 JwtAuthenticationFilter.java' },
          { type: 'output', content: '  └── 📄 CmsApplication.java' },
          { type: 'output', content: '' },
          { type: 'info', content: '  5 directories, 17 files' },
          { type: 'output', content: '' },
        ], 12);
        break;

      case 'find':
        if (!argJoined) {
          addLine('error', 'find: missing search term');
          return;
        }
        const matches = FILES.filter(f =>
          f.name.toLowerCase().includes(argJoined.toLowerCase()) ||
          f.keywords.some(k => k.includes(argJoined.toLowerCase())) ||
          f.description.toLowerCase().includes(argJoined.toLowerCase())
        );

        if (matches.length === 0) {
          addLine('output', `  No files matching '${argJoined}'`);
        } else {
          await addLines([
            { type: 'output', content: '' },
            { type: 'success', content: `  Found ${matches.length} file(s):` },
            { type: 'output', content: '' },
            ...matches.map(m => ({ type: 'output' as const, content: `    📄 ${m.path}${m.name}` })),
            { type: 'output', content: '' },
            { type: 'info', content: `  💡 Type "cat ${matches[0].name.replace('.java', '').toLowerCase()}" to view` },
            { type: 'output', content: '' },
          ], 15);
        }
        break;

      case 'neofetch':
        await addLines([
          { type: 'output', content: '' },
          { type: 'ascii', content: '         ████████████████████          cms-backend@2.0.0' },
          { type: 'ascii', content: '       ██                    ██        ─────────────────────' },
          { type: 'ascii', content: '     ██   ████████████████   ██       OS: Spring Boot 3.2' },
          { type: 'ascii', content: '    ██   ██              ██   ██      Host: JVM 17+ (LTS)' },
          { type: 'ascii', content: '   ██   ██  ██████████  ██   ██       Kernel: Vite 6.x' },
          { type: 'ascii', content: '   ██   ██  ██      ██  ██   ██       Packages: 17 (java)' },
          { type: 'ascii', content: '   ██   ██  ██████████  ██   ██       Shell: cms-terminal' },
          { type: 'ascii', content: '    ██   ██              ██   ██      Auth: JWT + BCrypt' },
          { type: 'ascii', content: '     ██   ████████████████   ██       Memory: JPA/Hibernate' },
          { type: 'ascii', content: '       ██                    ██       ' },
          { type: 'ascii', content: '         ████████████████████         ████████████████████' },
          { type: 'output', content: '' },
        ], 20);
        break;

      case 'clear':
      case 'cls':
        setLines([]);
        return;

      case 'whoami':
        addLine('output', '  admin (root)');
        break;

      case 'date':
        addLine('output', `  ${new Date().toString()}`);
        break;

      case 'echo':
        addLine('output', `  ${args.join(' ')}`);
        break;

      default:
        addLine('error', `  ${command}: command not found`);
        addLine('info', '  Type "help" for available commands');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isBooting) return;

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
      const cmds = ['help', 'ls', 'cd', 'pwd', 'cat', 'tree', 'find', 'head', 'clear', 'neofetch'];
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
      case 'code': return '';
      case 'ascii': return 'text-cyan-400 font-bold';
      case 'highlight': return 'text-purple-400';
      case 'boot': return 'text-green-400';
      default: return 'text-slate-300';
    }
  };

  // Boot screen
  if (isBooting) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#0a0e14] rounded-2xl border border-cyan-500/20 overflow-hidden relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-blue-500/10 animate-pulse" />

        <div className="text-center z-10 px-8">
          {/* Spinning logo */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto border-4 border-cyan-500/30 rounded-2xl animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">⚡</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">CMS Backend Terminal</h2>
          <p className="text-slate-400 mb-8">Initializing source explorer...</p>

          {/* Progress bar */}
          <div className="w-80 mx-auto">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-100 ease-out rounded-full"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Loading modules...</span>
              <span>{bootProgress}%</span>
            </div>
          </div>

          {/* Boot messages */}
          <div className="mt-6 text-left text-xs font-mono text-slate-600 space-y-1 max-w-md mx-auto">
            {bootProgress > 20 && <div className="animate-pulse">✓ Spring Boot initialized</div>}
            {bootProgress > 40 && <div className="animate-pulse">✓ JPA/Hibernate loaded</div>}
            {bootProgress > 60 && <div className="animate-pulse">✓ Security module ready</div>}
            {bootProgress > 80 && <div className="animate-pulse">✓ Source files indexed</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Terminal Container */}
      <div
        className="flex-1 bg-[#0a0e14] rounded-2xl overflow-hidden border border-cyan-500/30 relative"
        style={{
          boxShadow: '0 0 60px rgba(6, 182, 212, 0.1), 0 0 30px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30 hover:scale-110 transition-transform cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30 hover:scale-110 transition-transform cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30 hover:scale-110 transition-transform cursor-pointer" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-mono">ONLINE</span>
            </div>
          </div>
          <span className="text-xs text-slate-600 font-mono">cms-backend-explorer</span>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          className="p-5 h-[calc(100vh-320px)] min-h-[450px] overflow-y-auto font-mono text-[13px] leading-relaxed"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`${getLineStyle(line.type)} ${line.type === 'code'
                  ? 'my-3 bg-[#0d1117] border border-slate-700/50 rounded-xl overflow-hidden shadow-xl'
                  : ''
                }`}
              style={{ animation: 'fadeIn 0.2s ease-out' }}
            >
              {line.type === 'code' ? (
                <div className="overflow-x-auto">
                  <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 text-xs text-slate-500">
                    💻 Source Code
                  </div>
                  <div className="p-4 text-[12px] leading-relaxed">
                    {highlightJavaCode(line.content)}
                  </div>
                </div>
              ) : (
                line.content
              )}
            </div>
          ))}

          {/* Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center mt-3">
            <span className="text-emerald-400 mr-2">
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
              placeholder="Type a command..."
              autoFocus
              disabled={isTyping}
              spellCheck={false}
            />
            {isTyping && (
              <span className="text-cyan-500 animate-pulse">●●●</span>
            )}
          </form>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { cmd: 'help', icon: '❓' },
          { cmd: 'ls', icon: '📁' },
          { cmd: 'tree', icon: '🌳' },
          { cmd: 'cat sla', icon: '📄' },
          { cmd: 'cat security', icon: '🔐' },
          { cmd: 'find jwt', icon: '🔍' },
          { cmd: 'neofetch', icon: '💻' },
          { cmd: 'clear', icon: '🧹' },
        ].map(({ cmd, icon }) => (
          <button
            key={cmd}
            onClick={() => !isTyping && processCommand(cmd)}
            className="px-4 py-2 text-xs font-mono bg-slate-900 text-slate-400 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 active:scale-95"
          >
            <span className="mr-2">{icon}</span>$ {cmd}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default JavaSourceViewer;