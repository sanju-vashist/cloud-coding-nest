import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { 
  File, Folder, Settings, Code, Terminal, LogOut, Menu, 
  Calendar, StickyNote, Clock, Battery, Wifi, Volume, 
  Search, Bell, Moon, Sun, Chrome, Wallpaper
} from "lucide-react";
import FileExplorer from "@/components/FileExplorer";
import CodeEditor from "@/components/CodeEditor";
import TerminalEmulator from "@/components/TerminalEmulator";
import CalendarApp from "@/components/CalendarApp";
import NotesApp from "@/components/NotesApp";
import ChromeBrowser from "@/components/ChromeBrowser";
import AppWindow from "@/components/AppWindow";

interface DesktopProps {
  username: string;
  onLogout: () => void;
}

interface WallpaperOption {
  id: string;
  name: string;
  url: string;
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWallpaperDialogOpen, setIsWallpaperDialogOpen] = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState(() => {
    const saved = localStorage.getItem('webOS_wallpaper');
    return saved || 'from-blue-50 to-indigo-100';
  });
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState('');
  
  // Load user data from localStorage
  const userData = JSON.parse(localStorage.getItem('webOS_user') || '{}');
  const userId = userData.id;
  
  const wallpaperOptions: WallpaperOption[] = [
    { id: 'default', name: 'Default Blue', url: 'from-blue-50 to-indigo-100' },
    { id: 'purple', name: 'Purple Dream', url: 'from-purple-50 to-pink-100' },
    { id: 'green', name: 'Forest Green', url: 'from-green-50 to-teal-100' },
    { id: 'sunset', name: 'Sunset Orange', url: 'from-red-50 to-orange-100' },
    { id: 'gradient1', name: 'Ocean Blue', url: 'from-blue-400 to-indigo-600' },
    { id: 'gradient2', name: 'Emerald', url: 'from-emerald-400 to-teal-600' }
  ];
  
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
  
  useEffect(() => {
    localStorage.setItem('webOS_wallpaper', currentWallpaper);
  }, [currentWallpaper]);
  
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
    
    // Close search when opening an app
    setIsSearchOpen(false);
  };
  
  const getAppTitle = (appType: string) => {
    switch (appType) {
      case 'fileExplorer': return 'File Explorer';
      case 'codeEditor': return 'Code Editor';
      case 'terminal': return 'Terminal';
      case 'settings': return 'Settings';
      case 'calendar': return 'Calendar';
      case 'notes': return 'Notes';
      case 'browser': return 'Chrome';
      default: return 'Application';
    }
  };
  
  const getDefaultSize = (appType: string) => {
    switch (appType) {
      case 'fileExplorer': return { width: 700, height: 500 };
      case 'codeEditor': return { width: 900, height: 600 };
      case 'terminal': return { width: 700, height: 500 };
      case 'settings': return { width: 600, height: 500 };
      case 'calendar': return { width: 800, height: 600 };
      case 'notes': return { width: 800, height: 600 };
      case 'browser': return { width: 1000, height: 700 };
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
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') return;
    
    // App search
    const appCommands = [
      { name: 'Files', action: () => openApp('fileExplorer') },
      { name: 'Code Editor', action: () => openApp('codeEditor') },
      { name: 'Terminal', action: () => openApp('terminal') },
      { name: 'Settings', action: () => openApp('settings') },
      { name: 'Calendar', action: () => openApp('calendar') },
      { name: 'Notes', action: () => openApp('notes') },
      { name: 'Chrome', action: () => openApp('browser') },
      { name: 'Dark Mode', action: () => setIsDarkMode(!isDarkMode) },
      { name: 'Change Wallpaper', action: () => setIsWallpaperDialogOpen(true) },
      { name: 'Log Out', action: onLogout }
    ];
    
    // Check if there's an exact match
    const matchedCommand = appCommands.find(cmd => 
      cmd.name.toLowerCase() === query.toLowerCase()
    );
    
    if (matchedCommand) {
      matchedCommand.action();
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };
  
  const applyWallpaper = (option: WallpaperOption) => {
    setCurrentWallpaper(option.url);
    toast({
      title: "Wallpaper updated",
      description: `Wallpaper set to ${option.name}`
    });
  };
  
  const applyCustomWallpaper = () => {
    if (customWallpaperUrl.trim()) {
      setCurrentWallpaper(customWallpaperUrl);
      toast({
        title: "Custom wallpaper applied",
        description: "Your custom wallpaper has been set"
      });
      setIsWallpaperDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Please provide a valid image URL",
        variant: "destructive"
      });
    }
  };
  
  const isWallpaperGradient = () => {
    return currentWallpaper.includes('from-') && currentWallpaper.includes('to-');
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
      case 'browser':
        return <ChromeBrowser userId={userId} />;
      case 'settings':
        return (
          <div className="p-4 h-full overflow-auto">
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Wallpaper className="h-5 w-5 mr-2" />
                    <span>Wallpaper</span>
                  </div>
                  <Button onClick={() => setIsWallpaperDialogOpen(true)}>Change</Button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {wallpaperOptions.slice(0, 3).map((option) => (
                    <div 
                      key={option.id}
                      className={`h-16 rounded-md cursor-pointer bg-gradient-to-br ${option.url} border-2 ${
                        currentWallpaper === option.url ? 'border-blue-500' : 'border-transparent'
                      }`}
                      onClick={() => applyWallpaper(option)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Account</h3>
                <p className="mb-2">Username: {username}</p>
                <Button variant="outline" onClick={onLogout}>Log Out</Button>
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">About WebOS</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Version 1.2.0<br />
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
    <div 
      className={`relative w-full h-screen overflow-hidden ${
        isWallpaperGradient()
          ? `bg-gradient-to-br ${currentWallpaper}` 
          : 'bg-cover bg-center'
      }`}
      style={!isWallpaperGradient() ? { backgroundImage: `url(${currentWallpaper})` } : {}}
    >
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
                <Button variant="ghost" className="justify-start" onClick={() => openApp('browser')}>
                  <Chrome className="w-4 h-4 mr-2" />
                  Chrome
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => openApp('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setIsWallpaperDialogOpen(true)}>
                  <Wallpaper className="w-4 h-4 mr-2" />
                  Change Wallpaper
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
          {/* Search bar */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-gray-600 dark:text-gray-300"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
            
            {isSearchOpen && (
              <div className="absolute top-7 right-0 w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-1 z-50">
                <Command>
                  <CommandInput 
                    placeholder="Search apps, settings, or files..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                      }
                    }}
                    autoFocus
                  />
                  <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
                    <CommandGroup heading="Applications">
                      <CommandItem onSelect={() => openApp('fileExplorer')}>
                        <Folder className="mr-2 h-4 w-4" />
                        <span>Files</span>
                      </CommandItem>
                      <CommandItem onSelect={() => openApp('codeEditor')}>
                        <Code className="mr-2 h-4 w-4" />
                        <span>Code Editor</span>
                      </CommandItem>
                      <CommandItem onSelect={() => openApp('terminal')}>
                        <Terminal className="mr-2 h-4 w-4" />
                        <span>Terminal</span>
                      </CommandItem>
                      <CommandItem onSelect={() => openApp('calendar')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Calendar</span>
                      </CommandItem>
                      <CommandItem onSelect={() => openApp('notes')}>
                        <StickyNote className="mr-2 h-4 w-4" />
                        <span>Notes</span>
                      </CommandItem>
                      <CommandItem onSelect={() => openApp('browser')}>
                        <Chrome className="mr-2 h-4 w-4" />
                        <span>Chrome</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Settings">
                      <CommandItem onSelect={() => openApp('settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </CommandItem>
                      <CommandItem onSelect={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? (
                          <Sun className="mr-2 h-4 w-4" />
                        ) : (
                          <Moon className="mr-2 h-4 w-4" />
                        )}
                        <span>Toggle Dark Mode</span>
                      </CommandItem>
                      <CommandItem onSelect={() => setIsWallpaperDialogOpen(true)}>
                        <Wallpaper className="mr-2 h-4 w-4" />
                        <span>Change Wallpaper</span>
                      </CommandItem>
                      <CommandItem onSelect={onLogout} className="text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log Out</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
          
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
        <DockIcon icon={<Chrome />} label="Chrome" onClick={() => openApp('browser')} />
        <div className="h-8 w-px bg-gray-300/30 dark:bg-gray-600/30 mx-1"></div>
        <DockIcon icon={<Settings />} label="Settings" onClick={() => openApp('settings')} />
      </div>
      
      {/* Wallpaper Dialog */}
      <Dialog open={isWallpaperDialogOpen} onOpenChange={setIsWallpaperDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Wallpaper</DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <Tabs defaultValue="preset" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="preset">Preset Wallpapers</TabsTrigger>
                <TabsTrigger value="custom">Custom URL</TabsTrigger>
              </TabsList>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3" data-value="preset">
                  {wallpaperOptions.map((option) => (
                    <div 
                      key={option.id}
                      className={`h-24 rounded-md cursor-pointer bg-gradient-to-br ${option.url} border-2 ${
                        currentWallpaper === option.url ? 'border-blue-500' : 'border-transparent'
                      }`}
                      onClick={() => applyWallpaper(option)}
                    >
                      <div className="h-full w-full flex items-end justify-start p-2">
                        <span className="text-xs bg-black/30 text-white px-1.5 py-0.5 rounded">
                          {option.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4" data-value="custom">
                  <div className="space-y-2">
                    <label className="text-sm">Enter Image URL</label>
                    <Input 
                      value={customWallpaperUrl}
                      onChange={(e) => setCustomWallpaperUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Enter a valid URL to an image for your custom wallpaper
                    </p>
                  </div>
                  <Button onClick={applyCustomWallpaper}>Apply Custom Wallpaper</Button>
                </div>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Global click handler to close search when clicking outside */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsSearchOpen(false)}
        />
      )}
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
