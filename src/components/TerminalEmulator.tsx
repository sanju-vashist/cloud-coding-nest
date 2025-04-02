
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
      output: 'Welcome to WebOS Terminal v1.1.0\nType "help" to see available commands.\n'
    }];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  const [fileSystem, setFileSystem] = useState(() => {
    const savedFS = localStorage.getItem(`webOS_fileSystem_${userId}`);
    return savedFS ? JSON.parse(savedFS) : {
      '/home/user': {
        'Documents': { type: 'directory', content: {} },
        'Downloads': { type: 'directory', content: {} },
        'Desktop': { type: 'directory', content: {} },
        'readme.txt': { type: 'file', content: 'Welcome to WebOS!' }
      }
    };
  });
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    localStorage.setItem(`webOS_terminal_history_${userId}`, JSON.stringify(history));
  }, [history, userId]);
  
  useEffect(() => {
    localStorage.setItem(`webOS_fileSystem_${userId}`, JSON.stringify(fileSystem));
  }, [fileSystem, userId]);
  
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      performTabCompletion();
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
  
  const performTabCompletion = () => {
    if (!input.trim()) return;
    
    const parts = input.trim().split(' ');
    const lastPart = parts[parts.length - 1];
    
    if (!lastPart) return;
    
    // Get current directory's contents
    const dirParts = currentDirectory.split('/').filter(Boolean);
    let currentObj = fileSystem;
    for (const part of dirParts) {
      if (currentObj[part] && currentObj[part].type === 'directory') {
        currentObj = currentObj[part].content;
      } else {
        return;
      }
    }
    
    // Find matching items
    const matches = Object.keys(currentObj).filter(item => 
      item.startsWith(lastPart)
    );
    
    if (matches.length === 1) {
      // Complete the input
      parts[parts.length - 1] = matches[0];
      setInput(parts.join(' '));
    } else if (matches.length > 1) {
      // Display possible completions
      const output = `\nPossible completions: ${matches.join('  ')}`;
      setHistory([...history, { command: '', output }]);
    }
  };
  
  const getPathContents = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    let current = fileSystem;
    
    for (const part of parts) {
      if (!current[part] || current[part].type !== 'directory') {
        return null;
      }
      current = current[part].content;
    }
    
    return current;
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
  help             - Show this help message
  echo [text]      - Display text
  ls               - List files in current directory
  clear            - Clear the terminal
  date             - Show current date and time
  whoami           - Show current user
  pwd              - Print working directory
  mkdir [name]     - Create a directory
  touch [name]     - Create a file
  cat [file]       - Display file contents
  rm [file]        - Remove a file
  cd [directory]   - Change directory
  uname            - Show system information
  cp [src] [dest]  - Copy a file
  mv [src] [dest]  - Move or rename a file
  grep [text] [file] - Search for text in file
  find [path] [name] - Find files by name
  history          - Show command history
  alias            - List all aliases
  man [command]    - Display manual for command
`;
        break;
        
      case 'echo':
        output = args.slice(1).join(' ');
        break;
        
      case 'ls':
        // Get directory contents
        const dirContents = getPathContents(currentDirectory);
        if (!dirContents) {
          output = `ls: cannot access '${currentDirectory}': No such directory`;
          break;
        }
        
        const files = Object.keys(dirContents);
        if (files.length === 0) {
          output = '';
          break;
        }
        
        const dirOutput = [];
        const fileOutput = [];
        
        for (const file of files) {
          if (dirContents[file].type === 'directory') {
            dirOutput.push(`${file}/`);
          } else {
            fileOutput.push(file);
          }
        }
        
        output = [...dirOutput.sort(), ...fileOutput.sort()].join('\n');
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
        
      case 'cd':
        if (args.length < 2 || args[1] === '~') {
          setCurrentDirectory('/home/user');
          output = '';
        } else if (args[1] === '..') {
          // Go up one directory
          const parts = currentDirectory.split('/').filter(Boolean);
          if (parts.length > 0) {
            parts.pop();
            const newDir = '/' + parts.join('/');
            setCurrentDirectory(newDir || '/');
          }
          output = '';
        } else if (args[1].startsWith('/')) {
          // Absolute path
          const targetDir = getPathContents(args[1]);
          if (targetDir) {
            setCurrentDirectory(args[1]);
            output = '';
          } else {
            output = `cd: ${args[1]}: No such directory`;
          }
        } else {
          // Relative path
          const targetPath = `${currentDirectory}/${args[1]}`;
          const targetDir = getPathContents(targetPath);
          if (targetDir) {
            setCurrentDirectory(targetPath);
            output = '';
          } else {
            output = `cd: ${args[1]}: No such directory`;
          }
        }
        break;
        
      case 'mkdir':
        if (args.length < 2) {
          output = 'mkdir: missing operand\nTry \'mkdir --help\' for more information.';
        } else {
          const dirName = args[1];
          const dirPath = dirName.startsWith('/')
            ? dirName
            : `${currentDirectory}/${dirName}`;
          
          const parts = dirPath.split('/').filter(Boolean);
          const newDirName = parts.pop() || '';
          const parentPath = '/' + parts.join('/');
          
          const parentDir = getPathContents(parentPath);
          
          if (!parentDir) {
            output = `mkdir: cannot create directory '${dirName}': No such file or directory`;
            break;
          }
          
          if (parentDir[newDirName]) {
            output = `mkdir: cannot create directory '${dirName}': File exists`;
            break;
          }
          
          // Create the directory
          parentDir[newDirName] = { type: 'directory', content: {} };
          setFileSystem({ ...fileSystem });
          
          output = `Directory '${dirName}' created`;
          
          toast({
            title: "Directory created",
            description: `${dirName} created successfully`
          });
        }
        break;
        
      case 'touch':
        if (args.length < 2) {
          output = 'touch: missing file operand\nTry \'touch --help\' for more information.';
        } else {
          const fileName = args[1];
          const filePath = fileName.startsWith('/')
            ? fileName
            : `${currentDirectory}/${fileName}`;
          
          const parts = filePath.split('/').filter(Boolean);
          const newFileName = parts.pop() || '';
          const parentPath = '/' + parts.join('/');
          
          const parentDir = getPathContents(parentPath);
          
          if (!parentDir) {
            output = `touch: cannot touch '${fileName}': No such file or directory`;
            break;
          }
          
          // Create the file if it doesn't exist
          if (!parentDir[newFileName]) {
            parentDir[newFileName] = { type: 'file', content: '' };
            setFileSystem({ ...fileSystem });
            output = `File '${fileName}' created`;
          } else {
            output = `File '${fileName}' updated`;
          }
          
          toast({
            title: "File created/updated",
            description: `${fileName} created/updated successfully`
          });
        }
        break;
        
      case 'cat':
        if (args.length < 2) {
          output = 'cat: missing file operand\nTry \'cat --help\' for more information.';
        } else {
          const fileName = args[1];
          const filePath = fileName.startsWith('/')
            ? fileName
            : `${currentDirectory}/${fileName}`;
          
          const parts = filePath.split('/').filter(Boolean);
          const targetFileName = parts.pop() || '';
          const parentPath = '/' + parts.join('/');
          
          const parentDir = getPathContents(parentPath);
          
          if (!parentDir || !parentDir[targetFileName]) {
            output = `cat: ${fileName}: No such file or directory`;
            break;
          }
          
          if (parentDir[targetFileName].type === 'directory') {
            output = `cat: ${fileName}: Is a directory`;
            break;
          }
          
          output = parentDir[targetFileName].content || '(Empty file)';
        }
        break;
        
      case 'rm':
        if (args.length < 2) {
          output = 'rm: missing operand\nTry \'rm --help\' for more information.';
        } else {
          const fileName = args[1];
          const filePath = fileName.startsWith('/')
            ? fileName
            : `${currentDirectory}/${fileName}`;
          
          const parts = filePath.split('/').filter(Boolean);
          const targetFileName = parts.pop() || '';
          const parentPath = '/' + parts.join('/');
          
          const parentDir = getPathContents(parentPath);
          
          if (!parentDir || !parentDir[targetFileName]) {
            output = `rm: cannot remove '${fileName}': No such file or directory`;
            break;
          }
          
          // Remove the file or directory
          delete parentDir[targetFileName];
          setFileSystem({ ...fileSystem });
          
          output = `'${fileName}' removed`;
          
          toast({
            title: "Item removed",
            description: `${fileName} removed successfully`
          });
        }
        break;
        
      case 'uname':
        output = 'WebOS 1.1.0 JavaScript Virtual Environment';
        break;
        
      case 'history':
        output = commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
        break;
        
      case 'man':
        if (args.length < 2) {
          output = 'What manual page do you want?\nFor example, try \'man man\'.';
        } else {
          const cmdName = args[1].toLowerCase();
          switch (cmdName) {
            case 'ls':
              output = 'LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about the FILEs (the current directory by default).';
              break;
            case 'cd':
              output = 'CD(1)\n\nNAME\n       cd - change the working directory\n\nSYNOPSIS\n       cd [directory]\n\nDESCRIPTION\n       Change the current directory to directory.  The default directory is the value of the HOME shell variable.';
              break;
            case 'man':
              output = 'MAN(1)\n\nNAME\n       man - an interface to the system reference manuals\n\nSYNOPSIS\n       man [command]\n\nDESCRIPTION\n       man is the system\'s manual pager.  Each page argument given to man is normally the name of a program, utility or function.';
              break;
            default:
              output = `No manual entry for ${cmdName}`;
          }
        }
        break;
        
      case 'cp':
        if (args.length < 3) {
          output = 'cp: missing file operand\nTry \'cp --help\' for more information.';
        } else {
          output = `Copied ${args[1]} to ${args[2]} (simulation)`;
        }
        break;
        
      case 'mv':
        if (args.length < 3) {
          output = 'mv: missing file operand\nTry \'mv --help\' for more information.';
        } else {
          output = `Moved ${args[1]} to ${args[2]} (simulation)`;
        }
        break;
        
      case 'grep':
        if (args.length < 3) {
          output = 'grep: missing pattern\nTry \'grep --help\' for more information.';
        } else {
          output = `Searching for '${args[1]}' in ${args[2]} (simulation)`;
        }
        break;
        
      case 'find':
        if (args.length < 3) {
          output = 'find: missing path\nTry \'find --help\' for more information.';
        } else {
          output = `Finding files named '${args[2]}' in ${args[1]} (simulation)`;
        }
        break;
        
      case 'alias':
        output = 'No aliases defined';
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
