
import React, { useState, useRef, useEffect } from 'react';
import {
  JAVA_COMPLAINT_ENTITY, JAVA_USER_ENTITY,
  JAVA_COMPLAINT_REPOSITORY,
  JAVA_SENTIMENT_LOGIC, JAVA_SLA_SCHEDULER, JAVA_GAMIFICATION, JAVA_QR_GENERATION,
  JAVA_CONTROLLER, JAVA_AUTH_CONTROLLER,
  JAVA_SECURITY, JAVA_JWT_PROVIDER,
  JAVA_APPLICATION
} from '../utils/javaCodeSnippets';
import { Terminal, Maximize2, Minimize2, X, Play } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'code' | 'ascii' | 'highlight' | 'dim';
  content: string;
}

interface FileInfo {
  name: string;
  code: string;
  description: string;
  path: string;
  keywords: string[];
}

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

const highlightJavaCode = (code: string): React.ReactElement[] => {
  const lines = code.split('\n');

  return lines.map((line, lineNum) => {
    // Tokenize the line to avoid nested replacements
    const tokens: { text: string; className: string }[] = [];
    let remaining = line;

    while (remaining.length > 0) {
      let matched = false;

      // Check for comments first
      const commentMatch = remaining.match(/^(\/\/.*)$/);
      if (commentMatch) {
        tokens.push({ text: commentMatch[1], className: 'text-slate-500 italic' });
        remaining = remaining.slice(commentMatch[1].length);
        matched = true;
        continue;
      }

      // Check for strings
      const stringMatch = remaining.match(/^("[^"]*")/);
      if (stringMatch) {
        tokens.push({ text: stringMatch[1], className: 'text-emerald-300' });
        remaining = remaining.slice(stringMatch[1].length);
        matched = true;
        continue;
      }

      // Check for annotations
      const annotationMatch = remaining.match(/^(@\w+)/);
      if (annotationMatch) {
        tokens.push({ text: annotationMatch[1], className: 'text-yellow-300' });
        remaining = remaining.slice(annotationMatch[1].length);
        matched = true;
        continue;
      }

      // Check for keywords
      const keywordMatch = remaining.match(/^(package|import|public|private|protected|class|interface|extends|implements|static|final|void|return|new|if|else|for|while|try|catch|throw|throws|enum|default|switch|case|break|continue|this|super|null|true|false|instanceof)\b/);
      if (keywordMatch) {
        tokens.push({ text: keywordMatch[1], className: 'text-purple-400 font-semibold' });
        remaining = remaining.slice(keywordMatch[1].length);
        matched = true;
        continue;
      }

      // Check for types
      const typeMatch = remaining.match(/^(String|int|Integer|long|Long|boolean|Boolean|double|Double|float|List|Map|Set|Optional|LocalDateTime|Date|Object|byte|User|Complaint|Sentiment|Priority|Category|ComplaintStatus|ResponseEntity|HttpStatus)\b/);
      if (typeMatch) {
        tokens.push({ text: typeMatch[1], className: 'text-cyan-300' });
        remaining = remaining.slice(typeMatch[1].length);
        matched = true;
        continue;
      }

      // Check for numbers
      const numberMatch = remaining.match(/^(\d+)/);
      if (numberMatch) {
        tokens.push({ text: numberMatch[1], className: 'text-orange-300' });
        remaining = remaining.slice(numberMatch[1].length);
        matched = true;
        continue;
      }

      // Check for method calls (word followed by parenthesis)
      const methodMatch = remaining.match(/^\.(\w+)\(/);
      if (methodMatch) {
        tokens.push({ text: '.', className: 'text-slate-400' });
        tokens.push({ text: methodMatch[1], className: 'text-blue-300' });
        tokens.push({ text: '(', className: 'text-slate-400' });
        remaining = remaining.slice(methodMatch[0].length);
        matched = true;
        continue;
      }

      // Default: take one character
      if (!matched) {
        tokens.push({ text: remaining[0], className: 'text-slate-300' });
        remaining = remaining.slice(1);
      }
    }

    return (
      <div key={lineNum} className="flex hover:bg-white/5 transition-colors group">
        <span className="w-12 text-right pr-4 text-slate-600 select-none border-r border-slate-700/50 mr-4 flex-shrink-0 group-hover:text-slate-500 transition-colors font-mono text-xs pt-0.5">{lineNum + 1}</span>
        <span className="whitespace-pre font-mono text-[13px]">
          {tokens.map((token, i) => (
            <span key={i} className={token.className}>{token.text}</span>
          ))}
        </span>
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
  const [isBooted, setIsBooted] = useState(false);
  const [currentDir, setCurrentDir] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { type, content }]);
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Boot sequence inside terminal
  useEffect(() => {
    const runBootSequence = async () => {
      setIsTyping(true);

      // Initial boot messages
      addLine('dim', '');
      await sleep(100);
      addLine('dim', '[  OK  ] Started CMS Backend Terminal v2.0 (Glass Kernel)');
      await sleep(80);
      addLine('dim', '[  OK  ] Loading Spring Boot 3.x kernel modules...');
      await sleep(80);
      addLine('dim', '[  OK  ] Initializing JPA/Hibernate ORM...');
      await sleep(80);
      addLine('dim', '[  OK  ] JWT Security module loaded');
      await sleep(80);
      addLine('dim', '[  OK  ] Mounted filesystem: /java (Read-Only)');
      await sleep(80);
      addLine('success', '[  OK  ] System ready');
      await sleep(200);

      addLine('output', '');
      await sleep(50);

      // Simple readable ASCII banner
      addLine('ascii', '');
      addLine('ascii', '    ██████╗ ███╗   ███╗ ███████╗    ██████╗  █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗██████╗ ');
      addLine('ascii', '   ██╔════╝ ████╗ ████║ ██╔════╝    ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║██╔══██╗');
      addLine('ascii', '   ██║      ██╔████╔██║ ███████╗    ██████╔╝███████║██║     █████╔╝ █████╗  ██╔██╗ ██║██║  ██║');
      addLine('ascii', '   ██║      ██║╚██╔╝██║ ╚════██║    ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║██║  ██║');
      addLine('ascii', '   ╚██████╗ ██║ ╚═╝ ██║ ███████║    ██████╔╝██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║██████╔╝');
      addLine('ascii', '    ╚═════╝ ╚═╝     ╚═╝ ╚══════╝    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ');
      addLine('ascii', '');
      await sleep(100);
      addLine('highlight', '                        ⚡ Source Code Explorer v2.0 ⚡');
      await sleep(100);

      addLine('output', '');
      await sleep(50);
      addLine('info', '  Spring Boot 3.x │ Java 17+ │ JWT Auth │ JPA/Hibernate');
      await sleep(50);
      addLine('output', '');
      await sleep(50);
      addLine('output', '  Type "help" for commands, "ls" to list files, or "cat <file>" to view code.');
      await sleep(50);
      addLine('output', '');

      setIsTyping(false);
      setIsBooted(true);
    };

    runBootSequence();
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

    setIsTyping(true);

    switch (command) {
      case 'help':
      case 'man':
      case '?':
        addLine('output', '');
        await sleep(20);
        addLine('highlight', '  ┌─────────────────────────────────────────────────────────────┐');
        addLine('highlight', '  │                    📖 COMMAND REFERENCE                     │');
        addLine('highlight', '  └─────────────────────────────────────────────────────────────┘');
        addLine('output', '');
        await sleep(20);
        addLine('success', '  📁 Navigation');
        addLine('output', '     ls [dir]           List files in directory');
        addLine('output', '     cd <dir>           Change directory (cd model, cd ..)');
        addLine('output', '     pwd                Print current directory');
        addLine('output', '     tree               Show full project structure');
        await sleep(20);
        addLine('output', '');
        addLine('success', '  📄 View Files');
        addLine('output', '     cat <file>         Display file with syntax highlighting');
        addLine('output', '     head <file>        Show first 25 lines');
        await sleep(20);
        addLine('output', '');
        addLine('info', '  💡 File names are flexible:');
        addLine('output', '     cat SLAService     cat sla     cat slaservice.java');
        await sleep(20);
        addLine('output', '');
        addLine('success', '  🔍 Search');
        addLine('output', '     find <keyword>     Search files by name');
        await sleep(20);
        addLine('output', '');
        addLine('success', '  ⚙️ System');
        addLine('output', '     clear              Clear terminal');
        addLine('output', '     neofetch           System info');
        addLine('output', '');
        break;

      case 'ls':
      case 'dir':
        const lsDir = args[0]?.replace(/\/$/, '') || currentDir;
        const lsContents = DIRECTORY_STRUCTURE[lsDir];
        if (!lsContents && lsDir !== '') {
          addLine('error', `  ls: cannot access '${lsDir}': No such directory`);
          break;
        }
        const contents = lsContents || DIRECTORY_STRUCTURE[''];
        addLine('output', '');
        addLine('info', `  📂 ${lsDir || 'java'}/`);
        addLine('output', '');
        for (const item of contents) {
          await sleep(15);
          addLine(item.endsWith('/') ? 'success' : 'output', `     ${item.endsWith('/') ? '📁' : '📄'} ${item}`);
        }
        addLine('output', '');
        addLine('dim', `  ${contents.length} items`);
        addLine('output', '');
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
          addLine('error', `  cd: ${target}: No such directory`);
        }
        break;

      case 'pwd':
        addLine('output', `  /java${currentDir ? '/' + currentDir : ''}`);
        break;

      case 'cat':
      case 'less':
      case 'more':
      case 'view':
      case 'open':
      case 'show':
        if (!argJoined) {
          addLine('error', `  ${command}: missing file operand`);
          addLine('info', '  Usage: cat <filename>  (e.g., cat SLAService)');
          break;
        }
        const file = findFile(argJoined);
        if (!file) {
          addLine('error', `  ${command}: ${argJoined}: No such file`);
          const suggestions = FILES.filter(f =>
            f.name.toLowerCase().includes(argJoined.toLowerCase()) ||
            f.keywords.some(k => k.includes(argJoined.toLowerCase()))
          ).slice(0, 3);
          if (suggestions.length > 0) {
            addLine('info', `  Did you mean: ${suggestions.map(s => s.name).join(', ')}?`);
          }
          break;
        }
        addLine('output', '');
        addLine('highlight', `  ╭${'─'.repeat(70)}╮`);
        addLine('success', `  │  📄 ${file.name.padEnd(63)} │`);
        addLine('info', `  │     ${file.description.padEnd(61)} │`);
        addLine('dim', `  │     ${(file.path + file.name).padEnd(61)} │`);
        addLine('highlight', `  ╰${'─'.repeat(70)}╯`);
        addLine('output', '');
        addLine('code', file.code);
        addLine('output', '');
        addLine('success', `  ✓ ${file.name} (${file.code.split('\n').length} lines)`);
        addLine('output', '');
        break;

      case 'head':
        if (!argJoined) {
          addLine('error', '  head: missing file operand');
          break;
        }
        const hFile = findFile(argJoined);
        if (!hFile) {
          addLine('error', `  head: ${argJoined}: No such file`);
          break;
        }
        const headCode = hFile.code.split('\n').slice(0, 25).join('\n');
        addLine('output', '');
        addLine('info', `  ==> ${hFile.name} (first 25 lines) <==`);
        addLine('output', '');
        addLine('code', headCode);
        addLine('dim', '  ... (use "cat" to see full file)');
        addLine('output', '');
        break;

      case 'tree':
        addLine('output', '');
        addLine('success', '  📂 java/');
        const treeLines = [
          '  ├── 📁 model/',
          '  │   ├── 📄 Complaint.java',
          '  │   ├── 📄 User.java',
          '  │   └── 📄 Comment.java',
          '  ├── 📁 repository/',
          '  │   ├── 📄 ComplaintRepository.java',
          '  │   └── 📄 UserRepository.java',
          '  ├── 📁 service/',
          '  │   ├── 📄 SentimentAnalysisService.java',
          '  │   ├── 📄 SLAService.java',
          '  │   ├── 📄 GamificationService.java',
          '  │   └── 📄 QRCodeService.java',
          '  ├── 📁 controller/',
          '  │   ├── 📄 ComplaintController.java',
          '  │   └── 📄 AuthController.java',
          '  ├── 📁 security/',
          '  │   ├── 📄 SecurityConfig.java',
          '  │   └── 📄 JwtTokenProvider.java',
          '  └── 📄 CmsApplication.java',
        ];
        for (const line of treeLines) {
          await sleep(20);
          addLine('output', line);
        }
        addLine('output', '');
        addLine('dim', '  5 directories, 17 files');
        addLine('output', '');
        break;

      case 'find':
        if (!argJoined) {
          addLine('error', '  find: missing search term');
          break;
        }
        const matches = FILES.filter(f =>
          f.name.toLowerCase().includes(argJoined.toLowerCase()) ||
          f.keywords.some(k => k.includes(argJoined.toLowerCase())) ||
          f.description.toLowerCase().includes(argJoined.toLowerCase())
        );

        if (matches.length === 0) {
          addLine('output', `  No files matching '${argJoined}'`);
        } else {
          addLine('output', '');
          addLine('success', `  Found ${matches.length} file(s):`);
          addLine('output', '');
          for (const m of matches) {
            await sleep(20);
            addLine('output', `     📄 ${m.path}${m.name}`);
          }
          addLine('output', '');
          addLine('info', `  💡 Type "cat ${matches[0].name.replace('.java', '').toLowerCase()}" to view`);
          addLine('output', '');
        }
        break;

      case 'neofetch':
        addLine('output', '');
        await sleep(20);
        addLine('ascii', '                                      ┌─────────────────────────────────────┐');
        await sleep(25);
        addLine('ascii', '         ( (                          │  spring-boot-cms@2.0                │');
        await sleep(25);
        addLine('ascii', '          ) )                         ├─────────────────────────────────────┤');
        await sleep(25);
        addLine('success', '        ........                      │                                     │');
        await sleep(25);
        addLine('success', '        |      |]                     │  OS         Spring Boot 3.2.x       │');
        await sleep(25);
        addLine('success', '        \\\\      /                      │  Runtime    Java 17+ (LTS)          │');
        await sleep(25);
        addLine('success', "         \`----'                       │  Auth       JWT + BCrypt            │");
        await sleep(25);
        addLine('ascii', '                                      │  Database   JPA / Hibernate         │');
        await sleep(25);
        addLine('ascii', '       ██╗ █████╗ ██╗   ██╗ █████╗    │  Packages   17 source files         │');
        await sleep(25);
        addLine('ascii', '       ██║██╔══██╗██║   ██║██╔══██╗   │  AI         Sentiment Analysis      │');
        await sleep(25);
        addLine('ascii', '       ██║███████║██║   ██║███████║   │  SLA        Auto-escalation         │');
        await sleep(25);
        addLine('ascii', '  ██   ██║██╔══██║╚██╗ ██╔╝██╔══██║   │  Features   Gamification, QR        │');
        await sleep(25);
        addLine('ascii', '  ╚█████╔╝██║  ██║ ╚████╔╝ ██║  ██║   │                                     │');
        await sleep(25);
        addLine('ascii', '   ╚════╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝   └─────────────────────────────────────┘');
        await sleep(20);
        addLine('output', '');
        break;

      case 'clear':
      case 'cls':
        setLines([]);
        setIsTyping(false);
        return;

      case 'whoami':
        addLine('output', '  admin');
        break;

      case 'date':
        addLine('output', `  ${new Date().toLocaleString()}`);
        break;

      case 'echo':
        addLine('output', `  ${args.join(' ')}`);
        break;

      default:
        addLine('error', `  ${command}: command not found`);
        addLine('info', '  Type "help" for available commands');
    }

    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !isBooted) return;

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
      case 'input': return 'text-cyan-400 font-bold';
      case 'error': return 'text-red-400';
      case 'success': return 'text-emerald-400';
      case 'info': return 'text-slate-400';
      case 'dim': return 'text-slate-600';
      case 'code': return '';
      case 'ascii': return 'text-cyan-400';
      case 'highlight': return 'text-purple-400 font-bold';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col p-4">
      {/* Background Glow */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Terminal Container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.4)] bg-[#0d1117]/90 backdrop-blur-xl flex flex-col transition-all duration-300 hover:shadow-[0_0_100px_rgba(0,0,0,0.5)] hover:border-white/20 ring-1 ring-white/5">

        {/* Glass Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/5 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-2.5 group">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] shadow-sm transform group-hover:scale-110 transition-transform cursor-pointer" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] shadow-sm transform group-hover:scale-110 transition-transform delay-75 cursor-pointer" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] shadow-sm transform group-hover:scale-110 transition-transform delay-150 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 opacity-50">
            <Terminal size={14} className="text-slate-400" />
            <span className="text-sm text-slate-300 font-mono font-medium tracking-wide">admin@cms-backend: ~</span>
          </div>
          <div className="w-16 flex justify-end gap-2 opacity-30 hover:opacity-100 transition-opacity">
            <Minimize2 size={16} className="cursor-pointer" />
            <Maximize2 size={16} className="cursor-pointer" />
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          className="p-6 flex-1 overflow-y-auto font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`${getLineStyle(line.type)} ${line.type === 'code' ? 'my-4' : 'my-1'}`}
            >
              {line.type === 'code' ? (
                <div className="relative group/code">
                  <div className="absolute inset-0 bg-white/5 rounded-xl -m-1 blur opacity-0 group-hover/code:opacity-100 transition-opacity" />
                  <div className="relative bg-[#0d1117]/80 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                      Java Source
                      <span className="ml-auto opacity-50 font-mono">UTF-8</span>
                    </div>
                    <div className="p-5 text-[13px] leading-relaxed overflow-x-auto">
                      {highlightJavaCode(line.content).map((lineEl, lineIdx) => (
                        <div
                          key={lineIdx}
                          className="opacity-0 animate-slideIn"
                          style={{
                            animationDelay: `${lineIdx * 10}ms`,
                            animationFillMode: 'forwards'
                          }}
                        >
                          {lineEl}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="whitespace-pre drop-shadow-sm">{line.content}</span>
              )}
            </div>
          ))}

          {/* Input Line */}
          {isBooted && (
            <form onSubmit={handleSubmit} className="flex items-center mt-3 group">
              <span className="mr-3 whitespace-nowrap">
                <span className="text-emerald-400 font-bold drop-shadow-md">➜</span>
                <span className="text-cyan-400 ml-2 font-bold drop-shadow-md">~{currentDir ? `/${currentDir}` : ''}</span>
              </span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-slate-100 focus:outline-none caret-emerald-400 placeholder-white/20 font-medium"
                  placeholder={isTyping ? '' : 'Type command...'}
                  autoFocus
                  disabled={isTyping}
                  spellCheck={false}
                />
                {isTyping && <span className="absolute left-0 text-emerald-400 animate-pulse">▋</span>}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Quick Actions Bar - Floating Glass */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {['help', 'ls', 'tree', 'cat sla', 'neofetch', 'clear'].map(cmd => (
          <button
            key={cmd}
            onClick={() => !isTyping && isBooted && processCommand(cmd)}
            className="px-4 py-2 text-xs font-mono font-medium text-slate-300 bg-white/5 hover:bg-white/10 active:bg-white/20 backdrop-blur-md rounded-full border border-white/10 transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center gap-2 group"
          >
            <Play size={10} className="fill-current opacity-50 group-hover:opacity-100 transition-opacity" />
            {cmd}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default JavaSourceViewer;