import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { X, Plus, Maximize2, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  isVisible: boolean;
  onClose: () => void;
  sidebarWidth: number;
  statusBarHeight?: number; // Add this prop
}

type CommandHistory = {
  command: string;
  output: string;
  isError?: boolean;
}

type TerminalInstance = {
  id: number;
  history: CommandHistory[];
  input: string;
  commandHistory: string[];
  historyIndex: number;
  currentDirectory: string;
  username: string;
}

type HeaderTab = 'PROBLEMS' | 'OUTPUT' | 'DEBUG CONSOLE' | 'TERMINAL' | 'PORTS';

export default function Terminal({ isVisible, onClose, sidebarWidth, statusBarHeight = 24 }: TerminalProps) {
  // State for managing terminal instances
  const [terminals, setTerminals] = useState<TerminalInstance[]>([
    {
      id: 1,
      history: [{
        command: '',
        output: 'Welcome to VS Code Terminal\nType "help" to see available commands.'
      }],
      input: '',
      commandHistory: [],
      historyIndex: -1,
      currentDirectory: '/home/user',
      username: 'user'
    }
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState<number>(1);

  // State for managing header tabs
  const [activeHeaderTab, setActiveHeaderTab] = useState<HeaderTab>('TERMINAL');
  const [problemsContent, setProblemsContent] = useState<string>("No problems have been detected in the workspace.");
  const [outputContent, setOutputContent] = useState<string>("Output will be shown here.");
  const [debugContent, setDebugContent] = useState<string>("Debug console is ready.");

  // State for fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Get the active terminal
  const activeTerminal = terminals.find(t => t.id === activeTerminalId) || terminals[0];

  // Create a new terminal instance
  const createNewTerminal = () => {
    const newId = Math.max(0, ...terminals.map(t => t.id)) + 1;
    const newTerminal: TerminalInstance = {
      id: newId,
      history: [{
        command: '',
        output: 'Welcome to VS Code Terminal\nType "help" to see available commands.'
      }],
      input: '',
      commandHistory: [],
      historyIndex: -1,
      currentDirectory: '/home/user',
      username: 'user'
    };

    setTerminals(prev => [...prev, newTerminal]);
    setActiveTerminalId(newId);

    // Focus on the new terminal
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Close a terminal instance
  const closeTerminal = (id: number) => {
    if (terminals.length === 1) {
      // If it's the last terminal, close the whole panel
      onClose();
      return;
    }

    setTerminals(prev => prev.filter(t => t.id !== id));

    // If we're closing the active terminal, activate another one
    if (id === activeTerminalId) {
      const remainingTerminals = terminals.filter(t => t.id !== id);
      setActiveTerminalId(remainingTerminals[0].id);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Available commands
  const commands = {
    'clear': () => {
      setTerminals(prev => prev.map(term =>
        term.id === activeTerminalId
          ? { ...term, history: [] }
          : term
      ));
      return '';
    },
    'help': () => {
      return `
Available commands:
  - help: Show this help message
  - clear: Clear the terminal
  - ls: List files in current directory
  - pwd: Print working directory
  - whoami: Show current user
  - echo [text]: Display text
  - cd [directory]: Change directory (simulated)
  - uname: Show system information
  - date: Show current date
  - exit: Close the terminal
      `.trim();
    },
    'ls': () => {
      const files = [
        'Documents/',
        'Pictures/',
        'Downloads/',
        'projects/',
        'package.json',
        'tsconfig.json',
        'README.md'
      ];
      return files.join('  ');
    },
    'pwd': () => {
      return activeTerminal.currentDirectory;
    },
    'whoami': () => {
      return activeTerminal.username;
    },
    'cd': (args: string) => {
      if (!args) return activeTerminal.currentDirectory;

      let newDirectory = activeTerminal.currentDirectory;

      if (args === '..') {
        const parts = activeTerminal.currentDirectory.split('/');
        if (parts.length > 2) { // Don't go above /home
          parts.pop();
          newDirectory = parts.join('/');
        }
      } else if (args.startsWith('/')) {
        newDirectory = args;
      } else {
        newDirectory = `${activeTerminal.currentDirectory}/${args}`;
      }

      setTerminals(prev => prev.map(term =>
        term.id === activeTerminalId
          ? { ...term, currentDirectory: newDirectory }
          : term
      ));

      return '';
    },
    'echo': (args: string) => {
      return args || '';
    },
    'uname': () => {
      return 'VS Code Terminal 1.0';
    },
    'date': () => {
      return new Date().toString();
    },
    'exit': () => {
      closeTerminal(activeTerminalId);
      return '';
    }
  };

  // Execute a command in the active terminal
  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    // Save to command history
    const updatedCommandHistory = [command, ...activeTerminal.commandHistory];

    // Parse command and arguments
    const [cmd, ...args] = command.trim().split(' ');
    const argsStr = args.join(' ');

    // Execute command
    let output = '';
    let isError = false;

    if (cmd in commands) {
      try {
        //@ts-ignore - We know the commands exist
        output = commands[cmd](argsStr);
      } catch (e) {
        output = `Error executing command: ${e}`;
        isError = true;
      }
    } else {
      output = `Command not found: ${cmd}. Type 'help' to see available commands.`;
      isError = true;
    }

    // Format the command prompt
    const commandPrompt = `${activeTerminal.username}@vscode:${activeTerminal.currentDirectory.replace('/home/user', '~')}$ ${command}`;

    // Add to terminal history
    const updatedHistory = [
      ...activeTerminal.history,
      {
        command: commandPrompt,
        output,
        isError
      }
    ];

    // Update the terminal
    setTerminals(prev => prev.map(term =>
      term.id === activeTerminalId
        ? {
          ...term,
          history: updatedHistory,
          commandHistory: updatedCommandHistory,
          historyIndex: -1,
          input: ''
        }
        : term
    ));
  };

  // Handle keyboard events in the terminal
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(activeTerminal.input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeTerminal.commandHistory.length > 0) {
        const newIndex = Math.min(
          activeTerminal.historyIndex + 1,
          activeTerminal.commandHistory.length - 1
        );

        setTerminals(prev => prev.map(term =>
          term.id === activeTerminalId
            ? {
              ...term,
              historyIndex: newIndex,
              input: term.commandHistory[newIndex]
            }
            : term
        ));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeTerminal.historyIndex > 0) {
        const newIndex = activeTerminal.historyIndex - 1;

        setTerminals(prev => prev.map(term =>
          term.id === activeTerminalId
            ? {
              ...term,
              historyIndex: newIndex,
              input: term.commandHistory[newIndex]
            }
            : term
        ));
      } else if (activeTerminal.historyIndex === 0) {
        setTerminals(prev => prev.map(term =>
          term.id === activeTerminalId
            ? {
              ...term,
              historyIndex: -1,
              input: ''
            }
            : term
        ));
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for commands
      const partialCommand = activeTerminal.input.trim();
      if (partialCommand) {
        const completions = Object.keys(commands).filter(cmd =>
          cmd.startsWith(partialCommand)
        );
        if (completions.length === 1) {
          setTerminals(prev => prev.map(term =>
            term.id === activeTerminalId
              ? { ...term, input: completions[0] + ' ' }
              : term
          ));
        }
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerminals(prev => prev.map(term =>
      term.id === activeTerminalId
        ? { ...term, input: e.target.value }
        : term
    ));
  };

  // Scroll to bottom when terminal history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminals, activeTerminalId, activeHeaderTab]);

  // Focus input when terminal becomes visible or active terminal changes
  useEffect(() => {
    if (isVisible && inputRef.current && activeHeaderTab === 'TERMINAL') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isVisible, activeTerminalId, activeHeaderTab]);

  if (!isVisible) return null;

  // Render content based on active header tab
  const renderContent = () => {
    switch (activeHeaderTab) {
      case 'PROBLEMS':
        return (
          <div className="problems-content p-4 text-sm text-gray-300">
            {problemsContent}
          </div>
        );
      case 'OUTPUT':
        return (
          <div className="output-content p-4 font-mono text-sm text-gray-300">
            {outputContent}
          </div>
        );
      case 'DEBUG CONSOLE':
        return (
          <div className="debug-content p-4 font-mono text-sm text-gray-300">
            {debugContent}
          </div>
        );
      case 'PORTS':
        return (
          <div className="ports-content p-4 text-sm">
            <p className="text-gray-400 mb-4">No forwarded ports. Forward a port to access your locally running services over the internet.</p>
            <button
              className="px-8 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={() => console.log('Forward port clicked')}
            >
              Forward a Port
            </button>
          </div>
        );
      case 'TERMINAL':
      default:
        return (
          <>
            {/* Terminal Tabs */}
            <div className="terminal-tabs flex bg-editor-dark border-b border-gray-800">
              {terminals.map(terminal => (
                <div
                  key={terminal.id}
                  className={`
                    terminal-tab flex items-center px-3 py-1 border-r border-gray-800 cursor-pointer
                    ${activeTerminalId === terminal.id ? 'bg-editor-dark' : 'bg-editor-dark text-gray-400 hover:bg-gray-800/50'}
                  `}
                  onClick={() => setActiveTerminalId(terminal.id)}
                >
                  <TerminalIcon size={14} className="mr-2" />
                  <span className="text-xs">bash</span>
                  {activeTerminalId === terminal.id && (
                    <X
                      size={14}
                      className="ml-2 text-gray-400 hover:text-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTerminal(terminal.id);
                      }}
                    />
                  )}
                </div>
              ))}
              <div
                className="terminal-new-tab flex items-center justify-center px-2 py-1 cursor-pointer hover:bg-gray-800/50"
                onClick={createNewTerminal}
              >
                <Plus size={14} />
              </div>
            </div>

            {/* Terminal Content */}
            <div
              ref={terminalRef}
              className="terminal-content flex-1 overflow-y-auto p-2 font-mono text-sm bg-editor-dark"
            >
              {activeTerminal.history.map((item, index) => (
                <div key={index} className="mb-1">
                  {item.command && (
                    <div className="command text-gray-200">{item.command}</div>
                  )}
                  {item.output && (
                    <div className={`output whitespace-pre-wrap ${item.isError ? 'text-red-400' : 'text-gray-300'}`}>
                      {item.output}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <span className="mr-2 text-green-500">
                  {activeTerminal.username}@vscode:{activeTerminal.currentDirectory.replace('/home/user', '~')}$
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={activeTerminal.input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none caret-white text-white"
                  autoFocus
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`terminal-container h-full flex flex-col bg-editor-dark text-gray-200 ${isFullscreen ? 'fixed z-50' : ''
      }`} style={isFullscreen ? {
        left: `${sidebarWidth + 48}px`,
        top: 0,
        right: 0,
        bottom: `${statusBarHeight}px`
      } : undefined}>
      {/* Terminal Header */}
      <div className="terminal-header flex items-center justify-between bg-editor-dark py-1.5 px-3 border-b border-gray-800">
        <div className="flex space-x-4">
          <div
            className={`text-xs font-medium uppercase cursor-pointer hover:text-white ${activeHeaderTab === 'PROBLEMS' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveHeaderTab('PROBLEMS')}
          >
            PROBLEMS
          </div>
          <div
            className={`text-xs font-medium uppercase cursor-pointer hover:text-white ${activeHeaderTab === 'OUTPUT' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveHeaderTab('OUTPUT')}
          >
            OUTPUT
          </div>
          <div
            className={`text-xs font-medium uppercase cursor-pointer hover:text-white ${activeHeaderTab === 'DEBUG CONSOLE' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveHeaderTab('DEBUG CONSOLE')}
          >
            DEBUG CONSOLE
          </div>
          <div
            className={`text-xs font-medium uppercase cursor-pointer hover:text-white ${activeHeaderTab === 'TERMINAL' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveHeaderTab('TERMINAL')}
          >
            TERMINAL
          </div>
          <div
            className={`text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-white ${activeHeaderTab === 'PORTS' ? 'text-white border-b-2 border-white' : ''}`}
            onClick={() => setActiveHeaderTab('PORTS')}
          >
            PORTS
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Maximize2
            size={16}
            className="text-gray-400 cursor-pointer hover:text-gray-200"
            onClick={toggleFullscreen}
          />
          <X
            size={16}
            className="text-gray-400 cursor-pointer hover:text-gray-200"
            onClick={onClose}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}