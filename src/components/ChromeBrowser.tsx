
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, RefreshCw, Home, Plus, X, Bookmark, ExternalLink, Search } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ChromeBrowserProps {
  userId: string;
}

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

const HomepageContent = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="w-full max-w-md mb-8">
      <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
        <Search className="w-5 h-5 mr-2 text-gray-500" />
        <span className="text-gray-400">Search the web</span>
      </div>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
      {[
        { name: 'Google', url: 'https://google.com', color: 'bg-white' },
        { name: 'YouTube', url: 'https://youtube.com', color: 'bg-red-100' },
        { name: 'Gmail', url: 'https://gmail.com', color: 'bg-blue-100' },
        { name: 'Maps', url: 'https://maps.google.com', color: 'bg-green-100' },
        { name: 'Drive', url: 'https://drive.google.com', color: 'bg-yellow-100' },
        { name: 'News', url: 'https://news.google.com', color: 'bg-orange-100' },
        { name: 'Photos', url: 'https://photos.google.com', color: 'bg-purple-100' },
        { name: 'Translate', url: 'https://translate.google.com', color: 'bg-indigo-100' }
      ].map((site, index) => (
        <div 
          key={index}
          className={`${site.color} dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow`}
        >
          <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center mb-2">
            {site.name.charAt(0)}
          </div>
          <span>{site.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const ErrorPage = ({ url }: { url: string }) => (
  <div className="flex flex-col items-center justify-center h-full p-8">
    <div className="w-16 h-16 mb-4 text-red-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h2 className="text-xl font-bold mb-2">This webpage is not available</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-4">
      Cannot access {url}
    </p>
    <p className="text-sm text-gray-500 max-w-md text-center">
      This is a simulated browser. For security and technical reasons, it cannot actually load external websites.
    </p>
  </div>
);

const ChromeBrowser: React.FC<ChromeBrowserProps> = ({ userId }) => {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const savedTabs = localStorage.getItem(`webOS_chrome_tabs_${userId}`);
    if (savedTabs) {
      return JSON.parse(savedTabs);
    }
    return [
      { id: 'tab-1', title: 'New Tab', url: 'chrome://newtab', favicon: '' }
    ];
  });
  
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || 'tab-1');
  const [currentUrl, setCurrentUrl] = useState<string>(tabs[0]?.url || 'chrome://newtab');
  const [urlInput, setUrlInput] = useState<string>(currentUrl);
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const savedBookmarks = localStorage.getItem(`webOS_chrome_bookmarks_${userId}`);
    if (savedBookmarks) {
      return JSON.parse(savedBookmarks);
    }
    return [
      { id: 'bm-1', title: 'Google', url: 'https://google.com', favicon: '' },
      { id: 'bm-2', title: 'YouTube', url: 'https://youtube.com', favicon: '' },
      { id: 'bm-3', title: 'GitHub', url: 'https://github.com', favicon: '' }
    ];
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  
  // Save tabs and bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem(`webOS_chrome_tabs_${userId}`, JSON.stringify(tabs));
  }, [tabs, userId]);
  
  useEffect(() => {
    localStorage.setItem(`webOS_chrome_bookmarks_${userId}`, JSON.stringify(bookmarks));
  }, [bookmarks, userId]);
  
  // Update URL input when active tab changes
  useEffect(() => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      setCurrentUrl(activeTab.url);
      setUrlInput(activeTab.url);
    }
  }, [activeTabId, tabs]);
  
  const addNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: 'New Tab',
      url: 'chrome://newtab',
      favicon: ''
    };
    
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };
  
  const closeTab = (tabId: string) => {
    // Don't close if it's the last tab
    if (tabs.length <= 1) {
      return;
    }
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    
    setTabs(newTabs);
    
    // If we closed the active tab, switch to the next available one
    if (tabId === activeTabId) {
      const newActiveIndex = tabIndex === 0 ? 0 : tabIndex - 1;
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };
  
  const navigateTo = (url: string) => {
    let processedUrl = url;
    
    // Add https:// if no protocol specified
    if (url !== 'chrome://newtab' && !url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = `https://${url}`;
    }
    
    // Update the active tab
    const updatedTabs = tabs.map(tab => 
      tab.id === activeTabId 
        ? { 
            ...tab, 
            url: processedUrl,
            title: processedUrl === 'chrome://newtab' 
              ? 'New Tab' 
              : processedUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
          } 
        : tab
    );
    
    setTabs(updatedTabs);
    setCurrentUrl(processedUrl);
    setUrlInput(processedUrl);
  };
  
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(urlInput);
  };
  
  const addBookmark = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab || activeTab.url === 'chrome://newtab') return;
    
    setBookmarkTitle(activeTab.title);
    setIsBookmarkDialogOpen(true);
  };
  
  const saveBookmark = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab || activeTab.url === 'chrome://newtab') return;
    
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      title: bookmarkTitle || activeTab.title,
      url: activeTab.url,
      favicon: activeTab.favicon
    };
    
    setBookmarks([...bookmarks, newBookmark]);
    setIsBookmarkDialogOpen(false);
    
    toast({
      title: "Bookmark added",
      description: `"${newBookmark.title}" has been added to your bookmarks`,
    });
  };
  
  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
    
    toast({
      title: "Bookmark removed",
      description: "The bookmark has been removed",
    });
  };
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Browser Chrome */}
      <div className="flex items-center p-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        {/* Navigation Buttons */}
        <div className="flex space-x-1 mr-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => navigateTo('chrome://newtab')}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
        
        {/* URL Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 mr-2">
          <div className="relative">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="h-8 pr-10 bg-white dark:bg-gray-700"
              placeholder="Search Google or enter website name"
            />
            <Button 
              type="submit"
              size="icon" 
              variant="ghost" 
              className="absolute right-0 top-0 h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        {/* Action Buttons */}
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={addBookmark}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setShowBookmarks(!showBookmarks)}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex bg-gray-300 dark:bg-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`flex items-center min-w-[180px] max-w-[240px] h-9 pl-3 pr-1 ${
              tab.id === activeTabId 
                ? 'bg-gray-100 dark:bg-gray-900' 
                : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600'
            } rounded-t-md cursor-pointer border-r border-gray-300 dark:border-gray-600`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full flex-shrink-0" />
            <span className="truncate flex-1 text-sm">{tab.title}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={addNewTab}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Browser Content */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-800">
        {/* Bookmarks Bar (conditional) */}
        {showBookmarks && (
          <div className="flex items-center overflow-x-auto p-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {bookmarks.map(bookmark => (
              <div 
                key={bookmark.id}
                className="flex items-center px-3 py-1 mr-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer group whitespace-nowrap"
                onClick={() => navigateTo(bookmark.url)}
              >
                <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full flex-shrink-0" />
                <span className="text-sm">{bookmark.title}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBookmark(bookmark.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Web Content */}
        <ScrollArea className="h-full">
          {activeTab?.url === 'chrome://newtab' ? (
            <HomepageContent />
          ) : (
            <ErrorPage url={activeTab?.url || ''} />
          )}
        </ScrollArea>
      </div>
      
      {/* Add Bookmark Dialog */}
      <Dialog open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                placeholder="Bookmark name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input 
                value={activeTab?.url}
                readOnly
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookmarkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveBookmark}>
              Add Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChromeBrowser;
