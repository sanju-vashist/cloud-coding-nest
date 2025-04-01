
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { File, Folder, Settings, Code, Terminal, LogOut, Menu } from "lucide-react";
import FileExplorer from "@/components/FileExplorer";
import CodeEditor from "@/components/CodeEditor";
import TerminalEmulator from "@/components/TerminalEmulator";
import AppWindow from "@/components/AppWindow";

interface DesktopProps {
  username: string;
  onLogout: () => void;
}

const Desktop: React.FC<DesktopProps> = ({ username, onLogout }) => {
  const [openWindows, setOpenWindows] = useState<any[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Load user data from localStorage
  const userData = JSON.parse(localStorage.getItem('webOS_user') || '{}');
  const userId = userData.id;
  
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
      default: return 'Application';
    }
  };
  
  const getDefaultSize = (appType: string) => {
    switch (appType) {
      case 'fileExplorer': return { width: 600, height: 400 };
      case 'codeEditor': return { width: 800, height: 500 };
      case 'terminal': return { width: 600, height: 400 };
      case 'settings': return { width: 500, height: 400 };
      default: return { width: 600, height: 400 };
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
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold">Settings</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2">Username: {username}</p>
                <Button variant="outline" onClick={onLogout}>Log Out</Button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Unknown application type</div>;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-blue-50 dark:bg-gray-900">
      {/* Desktop */}
      <div className="absolute inset-0 p-4">
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
      
      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between h-12 px-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 mt-1 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
        </div>
        
        <div className="flex items-center space-x-1">
          {openWindows.map((window) => (
            <Button
              key={window.id}
              variant={activeWindowId === window.id ? "secondary" : "ghost"}
              size="sm"
              className="px-3 text-xs"
              onClick={() => {
                if (window.minimized) {
                  minimizeWindow(window.id);
                }
                focusWindow(window.id);
              }}
            >
              {window.title}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center text-sm">
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 grid grid-cols-1 gap-4">
        <DesktopIcon icon={<Folder />} label="Files" onClick={() => openApp('fileExplorer')} />
        <DesktopIcon icon={<Code />} label="Code" onClick={() => openApp('codeEditor')} />
        <DesktopIcon icon={<Terminal />} label="Terminal" onClick={() => openApp('terminal')} />
        <DesktopIcon icon={<Settings />} label="Settings" onClick={() => openApp('settings')} />
      </div>
    </div>
  );
};

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onClick }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center w-16 h-20 p-2 rounded-lg cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-10 h-10 mb-1 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        {icon}
      </div>
      <span className="text-xs text-center text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
        {label}
      </span>
    </div>
  );
};

export default Desktop;
