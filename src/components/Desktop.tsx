
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  File, Folder, Settings, Code, Terminal, LogOut, Menu, 
  Calendar, StickyNote, Clock, Battery, Wifi, Volume, 
  Search, Bell, Moon, Sun
} from "lucide-react";
import FileExplorer from "@/components/FileExplorer";
import CodeEditor from "@/components/CodeEditor";
import TerminalEmulator from "@/components/TerminalEmulator";
import CalendarApp from "@/components/CalendarApp";
import NotesApp from "@/components/NotesApp";
import AppWindow from "@/components/AppWindow";

interface DesktopProps {
  username: string;
  onLogout: () => void;
}

const Desktop: React.FC<DesktopProps> = ({ username, onLogout }) => {
  const [openWindows, setOpenWindows] = useState<any[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('webOS_darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Load user data from localStorage
  const userData = JSON.parse(localStorage.getItem('webOS_user') || '{}');
  const userId = userData.id;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update time every minute
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('webOS_darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const openApp = (appType: string) => {
    const newWindow = {
      id: `window-${Date.now()}`,
      type: appType,
      title: getAppTitle(appType),
      position: { x: 50 + (openWindows.length * 20), y: 50 + (openWindows.length * 20) },
      size: getDefaultSize(appType),
      minimized: false,
      maximized: false
    };
    
    setOpenWindows([...openWindows, newWindow]);
    setActiveWindowId(newWindow.id);
    setIsMenuOpen(false);
  };
  
  const getAppTitle = (appType: string) => {
    switch (appType) {
      case 'fileExplorer': return 'File Explorer';
      case 'codeEditor': return 'Code Editor';
      case 'terminal': return 'Terminal';
      case 'settings': return 'Settings';
      case 'calendar': return 'Calendar';
      case 'notes': return 'Notes';
      default: return 'Application';
    }
  };
  
  const getDefaultSize = (appType: string) => {
    switch (appType) {
      case 'fileExplorer': return { width: 700, height: 500 };
      case 'codeEditor': return { width: 900, height: 600 };
      case 'terminal': return { width: 700, height: 500 };
      case 'settings': return { width: 500, height: 400 };
      case 'calendar': return { width: 800, height: 600 };
      case 'notes': return { width: 800, height: 600 };
      default: return { width: 700, height: 500 };
    }
  };
  
  const closeWindow = (id: string) => {
    setOpenWindows(openWindows.filter(window => window.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(openWindows.length > 1 ? openWindows[openWindows.length - 2].id : null);
    }
  };
  
  const minimizeWindow = (id: string) => {
    setOpenWindows(openWindows.map(window => 
      window.id === id ? { ...window, minimized: !window.minimized } : window
    ));
    
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };
  
  const maximizeWindow = (id: string) => {
    setOpenWindows(openWindows.map(window => 
      window.id === id ? { ...window, maximized: !window.maximized } : window
    ));
  };
  
  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    // Move window to end of array to bring it to the front
    setOpenWindows([
      ...openWindows.filter(window => window.id !== id),
      openWindows.find(window => window.id === id)!
    ]);
  };
  
  const renderAppContent = (window: any) => {
    switch (window.type) {
      case 'fileExplorer':
        return <FileExplorer userId={userId} />;
      case 'codeEditor':
        return <CodeEditor userId={userId} />;
      case 'terminal':
        return <TerminalEmulator userId={userId} />;
      case 'calendar':
        return <CalendarApp userId={userId} />;
      case 'notes':
        return <NotesApp userId={userId} />;
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold">Settings</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  {isDarkMode ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />}
                  <span>Dark Mode</span>
                </div>
                <Button 
                  variant={isDarkMode ? "default" : "outline"} 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? "On" : "Off"}
                </Button>
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Account</h3>
                <p className="mb-2">Username: {username}</p>
                <Button variant="outline" onClick={onLogout}>Log Out</Button>
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">About WebOS</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Version 1.1.0<br />
                  A web-based operating system experience<br />
                  Running in your browser
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Unknown application type</div>;
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-gradient-to-br ${
      isDarkMode 
        ? 'from-gray-900 to-gray-800' 
        : 'from-blue-50 to-indigo-100'
    }`}>
      {/* Desktop */}
      <div className="absolute inset-0 p-4 pt-8">
        {/* Windows */}
        {openWindows.map((window) => (
          <AppWindow
            key={window.id}
            window={window}
            isActive={activeWindowId === window.id}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
          >
            {renderAppContent(window)}
          </AppWindow>
        ))}
      </div>
      
      {/* Top Menu Bar - macOS style */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between h-7 px-4 bg-white/80 backdrop-blur-md dark:bg-black/60 border-b border-gray-200/50 dark:border-gray-700/50 z-50">
        <div className="flex items-center space-x-4">
          <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <Menu className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 mt-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="grid gap-1">
                <Button variant="ghost" className="justify-start" onClick={() => openApp('fileExplorer')}>
                  <Folder className="w-4 h-4 mr-2" />
                  Files
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => openApp('codeEditor')}>
                  <Code className="w-4 h-4 mr-2" />
                  Code Editor
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => openApp('terminal')}>
                  <Terminal className="w-4 h-4 mr-2" />
                  Terminal
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => openApp('calendar')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => openApp('notes')}>
                  <StickyNote className="w-4 h-4 mr-2" />
                  Notes
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => openApp('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <Button variant="ghost" className="justify-start text-red-500" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <span className="text-sm font-medium">WebOS</span>
          
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              File
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              View
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              Window
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              Help
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <Battery className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <Volume className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
          
          <span className="text-xs">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      
      {/* Dock - macOS style */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center p-1 bg-white/20 backdrop-blur-lg dark:bg-black/30 rounded-2xl border border-white/30 dark:border-white/10 shadow-lg">
        <DockIcon icon={<Folder />} label="Files" onClick={() => openApp('fileExplorer')} />
        <DockIcon icon={<Code />} label="Code" onClick={() => openApp('codeEditor')} />
        <DockIcon icon={<Terminal />} label="Terminal" onClick={() => openApp('terminal')} />
        <DockIcon icon={<Calendar />} label="Calendar" onClick={() => openApp('calendar')} />
        <DockIcon icon={<StickyNote />} label="Notes" onClick={() => openApp('notes')} />
        <div className="h-8 w-px bg-gray-300/30 dark:bg-gray-600/30 mx-1"></div>
        <DockIcon icon={<Settings />} label="Settings" onClick={() => openApp('settings')} />
      </div>
    </div>
  );
};

interface DockIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const DockIcon: React.FC<DockIconProps> = ({ icon, label, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative group">
      <div 
        className="flex items-center justify-center w-12 h-12 rounded-xl mx-1 bg-white/10 backdrop-blur-lg dark:bg-white/5 border border-white/20 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white/20 dark:hover:bg-white/10"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-gray-800 dark:text-gray-200">
          {icon}
        </div>
      </div>
      
      {isHovered && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800/90 dark:bg-gray-900/90 text-white text-xs rounded whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
};

export default Desktop;
