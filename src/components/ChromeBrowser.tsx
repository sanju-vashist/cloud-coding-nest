
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, RotateCw, Home, Plus, X, Bookmark, Settings, ChevronDown } from 'lucide-react';

interface ChromeBrowserProps {
  userId: string;
}

interface Tab {
  id: string;
  url: string;
  title: string;
  favicon: string;
  isActive: boolean;
}

const ChromeBrowser: React.FC<ChromeBrowserProps> = ({ userId }) => {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const savedTabs = localStorage.getItem(`webOS_browser_tabs_${userId}`);
    return savedTabs 
      ? JSON.parse(savedTabs) 
      : [{ 
          id: `tab-${Date.now()}`, 
          url: 'https://www.google.com', 
          title: 'Google', 
          favicon: 'https://www.google.com/favicon.ico',
          isActive: true 
        }];
  });
  
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(['https://www.google.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<{title: string, url: string}[]>(() => {
    const savedBookmarks = localStorage.getItem(`webOS_browser_bookmarks_${userId}`);
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  
  useEffect(() => {
    localStorage.setItem(`webOS_browser_tabs_${userId}`, JSON.stringify(tabs));
  }, [tabs, userId]);
  
  useEffect(() => {
    localStorage.setItem(`webOS_browser_bookmarks_${userId}`, JSON.stringify(bookmarks));
  }, [bookmarks, userId]);

  const getActiveTab = () => {
    return tabs.find(tab => tab.isActive) || tabs[0];
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      url: 'https://www.google.com',
      title: 'New Tab',
      favicon: '',
      isActive: true
    };
    
    setTabs(prevTabs => prevTabs.map(tab => ({
      ...tab,
      isActive: false
    })).concat(newTab));
    
    setCurrentUrl('https://www.google.com');
    setHistory(['https://www.google.com']);
    setHistoryIndex(0);
  };
  
  const switchTab = (tabId: string) => {
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    }));
    
    setTabs(updatedTabs);
    
    const activeTab = updatedTabs.find(tab => tab.isActive);
    if (activeTab) {
      setCurrentUrl(activeTab.url);
    }
  };
  
  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't close if it's the last tab
    if (tabs.length === 1) {
      return;
    }
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const isActive = tabs[tabIndex].isActive;
    
    const filteredTabs = tabs.filter(tab => tab.id !== tabId);
    
    // If we're closing an active tab, activate another one
    if (isActive && filteredTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, filteredTabs.length - 1);
      filteredTabs[newActiveIndex].isActive = true;
      
      setCurrentUrl(filteredTabs[newActiveIndex].url);
    }
    
    setTabs(filteredTabs);
  };
  
  const navigate = (url: string) => {
    // Add http:// if not present
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it's a search term
      if (url.includes(' ') || !url.includes('.')) {
        processedUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      } else {
        processedUrl = `https://${url}`;
      }
    }
    
    setIsLoading(true);
    
    // Simulated loading
    setTimeout(() => {
      setIsLoading(false);
      
      // Update active tab
      const activeTab = getActiveTab();
      if (activeTab) {
        const updatedTabs = tabs.map(tab => 
          tab.id === activeTab.id 
            ? { ...tab, url: processedUrl, title: getDomainFromUrl(processedUrl) } 
            : tab
        );
        setTabs(updatedTabs);
      }
      
      // Update URL and history
      setCurrentUrl(processedUrl);
      
      // Add to history if navigating to a new URL
      if (historyIndex === history.length - 1) {
        setHistory([...history, processedUrl]);
        setHistoryIndex(history.length);
      } else {
        // User navigated from a previous point in history
        const newHistory = history.slice(0, historyIndex + 1).concat(processedUrl);
        setHistory(newHistory);
        setHistoryIndex(historyIndex + 1);
      }
    }, 800);
  };
  
  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      const previousUrl = history[newIndex];
      setCurrentUrl(previousUrl);
      
      // Update active tab
      const activeTab = getActiveTab();
      if (activeTab) {
        const updatedTabs = tabs.map(tab => 
          tab.id === activeTab.id 
            ? { ...tab, url: previousUrl, title: getDomainFromUrl(previousUrl) } 
            : tab
        );
        setTabs(updatedTabs);
      }
    }
  };
  
  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      const nextUrl = history[newIndex];
      setCurrentUrl(nextUrl);
      
      // Update active tab
      const activeTab = getActiveTab();
      if (activeTab) {
        const updatedTabs = tabs.map(tab => 
          tab.id === activeTab.id 
            ? { ...tab, url: nextUrl, title: getDomainFromUrl(nextUrl) } 
            : tab
        );
        setTabs(updatedTabs);
      }
    }
  };
  
  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Page refreshed",
        description: "The web page has been refreshed",
      });
    }, 800);
  };
  
  const addBookmark = () => {
    const activeTab = getActiveTab();
    if (activeTab) {
      const newBookmark = {
        title: activeTab.title,
        url: activeTab.url
      };
      
      // Check if bookmark already exists
      const exists = bookmarks.some(bm => bm.url === activeTab.url);
      if (!exists) {
        setBookmarks([...bookmarks, newBookmark]);
        toast({
          title: "Bookmark added",
          description: "Page has been added to bookmarks",
        });
      } else {
        toast({
          title: "Bookmark exists",
          description: "This page is already in your bookmarks",
          variant: "destructive"
        });
      }
    }
  };
  
  const navigateToHome = () => {
    navigate('https://www.google.com');
  };
  
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(currentUrl);
  };
  
  const getDomainFromUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch (error) {
      return url;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chrome Browser UI */}
      <div className="flex flex-col bg-gray-100 dark:bg-gray-800">
        {/* Tab Bar */}
        <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center px-3 py-1 max-w-[200px] rounded-t-md mr-1 text-sm cursor-pointer ${
                tab.isActive 
                  ? 'bg-white dark:bg-gray-800 text-black dark:text-white' 
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500'
              }`}
            >
              {tab.favicon && (
                <img 
                  src={tab.favicon} 
                  alt="" 
                  className="w-4 h-4 mr-2" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="truncate">{tab.title}</span>
              <X 
                className="w-4 h-4 ml-2 opacity-60 hover:opacity-100" 
                onClick={(e) => closeTab(tab.id, e)}
              />
            </div>
          ))}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full shrink-0"
            onClick={handleNewTab}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Navigation Bar */}
        <div className="flex items-center p-1 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center space-x-1 mr-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={goBack}
              disabled={historyIndex <= 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={goForward}
              disabled={historyIndex >= history.length - 1}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 rounded-full ${isLoading ? 'animate-spin' : ''}`}
              onClick={refresh}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={navigateToHome}
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleUrlSubmit} className="flex-grow flex items-center">
            <div className="flex-grow relative">
              <Input
                type="text"
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                className="h-9 pr-10 bg-gray-100 dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                placeholder="Search Google or type a URL"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
          </form>
          
          <div className="flex items-center ml-2 space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={addBookmark}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Browser Content */}
      <div className="flex-grow bg-white dark:bg-gray-900 p-4 overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-6xl font-bold mb-8 text-blue-500">G</div>
          <h1 className="text-2xl mb-4">Welcome to Chrome Browser</h1>
          <p className="mb-6 text-gray-500 max-w-md">
            This is a simulated Chrome browser interface. For security reasons, 
            this app cannot actually load external web content in this environment.
          </p>
          <div className="max-w-lg w-full">
            <Input
              type="text"
              placeholder="Search Google or type a URL"
              className="h-12 text-lg"
              onKeyDown={(e) => e.key === 'Enter' && navigate(e.currentTarget.value)}
            />
          </div>
          
          {bookmarks.length > 0 && (
            <div className="mt-8 grid grid-cols-4 gap-4 max-w-lg">
              {bookmarks.slice(0, 8).map((bookmark, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                  onClick={() => navigate(bookmark.url)}
                >
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-2 flex items-center justify-center text-xl font-bold">
                    {bookmark.title.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm truncate w-full text-center">{bookmark.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChromeBrowser;
