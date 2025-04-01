
import React, { useState, useRef, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface TerminalEmulatorProps {
  userId: string;
}

interface CommandHistory {
  command: string;
  output: string;
}

const TerminalEmulator: React.FC<TerminalEmulatorProps> = ({ userId }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>(() => {
    const saved = localStorage.getItem(`webOS_terminal_history_${userId}`);
    return saved ? JSON.parse(saved) : [{
      command: '',
      output: 'Welcome to WebOS Terminal v1.0.0\nType "help" to see available commands.\n'
    }];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    localStorage.setItem(`webOS_terminal_history_${userId}`, JSON.stringify(history));
  }, [history, userId]);
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);
  
  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory(1);
    }
  };
  
  const navigateHistory = (direction: number) => {
    if (commandHistory.length === 0) return;
    
    const newIndex = historyIndex + direction;
    
    if (newIndex >= commandHistory.length) {
      setHistoryIndex(-1);
      setInput('');
      return;
    }
    
    if (newIndex >= 0) {
      setHistoryIndex(newIndex);
      setInput(commandHistory[commandHistory.length - 1 - newIndex]);
    }
  };
  
  const processCommand = () => {
    if (!input.trim()) return;
    
    const trimmedInput = input.trim();
    const args = trimmedInput.split(' ');
    const command = args[0].toLowerCase();
    
    // Add to command history
    setCommandHistory([...commandHistory, trimmedInput]);
    setHistoryIndex(-1);
    
    let output = '';
    
    // Process command
    switch (command) {
      case 'help':
        output = `
Available commands:
  help            - Show this help message
  echo [text]     - Display text
  ls              - List files in current directory
  clear           - Clear the terminal
  date            - Show current date and time
  whoami          - Show current user
  pwd             - Print working directory
  mkdir [name]    - Create a directory
  touch [name]    - Create a file
  cat [file]      - Display file contents
  rm [file]       - Remove a file
  uname           - Show system information
`;
        break;
        
      case 'echo':
        output = args.slice(1).join(' ');
        break;
        
      case 'ls':
        // Simulate file listing
        output = 'Documents/\nPictures/\nMusic/\nprojects/\nindex.html\nstyles.css\nscript.js';
        break;
        
      case 'clear':
        setHistory([{
          command: '',
          output: ''
        }]);
        setInput('');
        return;
        
      case 'date':
        output = new Date().toString();
        break;
        
      case 'whoami':
        output = 'user@webos';
        break;
        
      case 'pwd':
        output = currentDirectory;
        break;
        
      case 'mkdir':
        if (args.length < 2) {
          output = 'mkdir: missing operand\nTry \'mkdir --help\' for more information.';
        } else {
          output = `Directory '${args[1]}' created`;
          
          // In a real implementation, we would create the directory in the file system
          toast({
            title: "Directory created",
            description: `${args[1]} created successfully`
          });
        }
        break;
        
      case 'touch':
        if (args.length < 2) {
          output = 'touch: missing file operand\nTry \'touch --help\' for more information.';
        } else {
          output = `File '${args[1]}' created`;
          
          // In a real implementation, we would create the file in the file system
          toast({
            title: "File created",
            description: `${args[1]} created successfully`
          });
        }
        break;
        
      case 'cat':
        if (args.length < 2) {
          output = 'cat: missing file operand\nTry \'cat --help\' for more information.';
        } else {
          output = `File contents of '${args[1]}':\n\nThis is a simulated file content. In a real implementation, the actual file content would be displayed.`;
        }
        break;
        
      case 'rm':
        if (args.length < 2) {
          output = 'rm: missing operand\nTry \'rm --help\' for more information.';
        } else {
          output = `'${args[1]}' removed`;
          
          // In a real implementation, we would remove the file from the file system
          toast({
            title: "File removed",
            description: `${args[1]} removed successfully`
          });
        }
        break;
        
      case 'uname':
        output = 'WebOS 1.0.0 JavaScript Virtual Environment';
        break;
        
      default:
        output = `${command}: command not found`;
    }
    
    setHistory([...history, { command: input, output }]);
    setInput('');
  };
  
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div 
      className="flex flex-col h-full bg-black text-green-400 font-mono text-sm p-4 overflow-hidden"
      onClick={handleClick}
    >
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto whitespace-pre-wrap"
      >
        {history.map((item, index) => (
          <div key={index}>
            {item.command && (
              <div className="flex">
                <span className="text-blue-400">user@webos:~$</span>
                <span className="ml-2">{item.command}</span>
              </div>
            )}
            <div>{item.output}</div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center mt-2">
        <span className="text-blue-400">user@webos:~$</span>
        <input
          ref={inputRef}
          type="text"
          className="flex-1 ml-2 bg-transparent border-none outline-none text-green-400"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
};

export default TerminalEmulator;
