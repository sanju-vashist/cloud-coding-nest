
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Save, Play, Plus, X, FileText, Download, Upload, Copy, Settings } from 'lucide-react';

interface CodeEditorProps {
  userId: string;
}

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ userId }) => {
  const [files, setFiles] = useState<CodeFile[]>(() => {
    const savedFiles = localStorage.getItem(`webOS_codeFiles_${userId}`);
    return savedFiles ? JSON.parse(savedFiles) : [
      {
        id: 'default-file',
        name: 'main.js',
        content: '// Welcome to WebOS Code Editor\nconsole.log("Hello, World!");',
        language: 'javascript'
      }
    ];
  });
  
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('javascript');
  const [output, setOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    darkTheme: true,
    autoSave: false
  });
  
  // Save files to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`webOS_codeFiles_${userId}`, JSON.stringify(files));
  }, [files, userId]);
  
  // Save editor settings
  useEffect(() => {
    localStorage.setItem(`webOS_editorSettings_${userId}`, JSON.stringify(editorSettings));
  }, [editorSettings, userId]);
  
  // Load editor settings
  useEffect(() => {
    const savedSettings = localStorage.getItem(`webOS_editorSettings_${userId}`);
    if (savedSettings) {
      setEditorSettings(JSON.parse(savedSettings));
    }
  }, [userId]);
  
  const activeFile = files.find(file => file.id === activeFileId);
  
  const handleContentChange = (content: string) => {
    if (!activeFile) return;
    
    setFiles(files.map(file => 
      file.id === activeFileId ? { ...file, content } : file
    ));
    
    // Auto save if enabled
    if (editorSettings.autoSave) {
      localStorage.setItem(`webOS_codeFiles_${userId}`, JSON.stringify(files.map(file => 
        file.id === activeFileId ? { ...file, content } : file
      )));
    }
  };
  
  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a file name",
        variant: "destructive"
      });
      return;
    }
    
    // Check if file already exists
    if (files.some(file => file.name === newFileName)) {
      toast({
        title: "File exists",
        description: "A file with this name already exists",
        variant: "destructive"
      });
      return;
    }
    
    const newFile: CodeFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      content: '',
      language: newFileLanguage
    };
    
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    setIsCreateDialogOpen(false);
    setNewFileName('');
  };
  
  const handleCloseFile = (fileId: string) => {
    if (files.length === 1) {
      toast({
        title: "Cannot close",
        description: "You must have at least one file open",
        variant: "destructive"
      });
      return;
    }
    
    const newFiles = files.filter(file => file.id !== fileId);
    setFiles(newFiles);
    
    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0].id);
    }
  };
  
  const handleRunCode = () => {
    if (!activeFile) return;
    
    setOutput('');
    setShowOutput(true);
    
    // Capture console.log output
    const originalConsoleLog = console.log;
    let output = '';
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      output += message + '\n';
      originalConsoleLog.apply(console, args);
    };
    
    try {
      // Only support JavaScript for now
      if (activeFile.language === 'javascript') {
        // Simple and safe eval with Function constructor
        const runFunction = new Function(activeFile.content);
        runFunction();
      } else {
        output = `Running ${activeFile.language} code is not supported yet.`;
      }
    } catch (error) {
      output += `Error: ${(error as Error).message}`;
    } finally {
      console.log = originalConsoleLog;
      setOutput(output);
    }
  };
  
  const handleDownloadFile = () => {
    if (!activeFile) return;
    
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded",
      description: `${activeFile.name} has been downloaded to your device`
    });
  };
  
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Determine language from file extension
      const extension = file.name.split('.').pop() || '';
      let language = 'text';
      
      if (['js', 'jsx'].includes(extension)) language = 'javascript';
      else if (['ts', 'tsx'].includes(extension)) language = 'typescript';
      else if (['html'].includes(extension)) language = 'html';
      else if (['css'].includes(extension)) language = 'css';
      else if (['py'].includes(extension)) language = 'python';
      
      const newFile: CodeFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        content,
        language
      };
      
      setFiles([...files, newFile]);
      setActiveFileId(newFile.id);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been added to your workspace`
      });
    };
    
    reader.readAsText(file);
  };
  
  const getLineCount = (text: string) => {
    return text.split('\n').length;
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              toast({
                title: "Saved",
                description: "Your code has been saved"
              });
            }}
          >
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRunCode}
          >
            <Play className="w-4 h-4 mr-1" /> Run
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadFile}
          >
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          
          <label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {}}
              className="cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-1" /> Import
            </Button>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleUploadFile}
              accept=".js,.jsx,.ts,.tsx,.html,.css,.py,.txt,.json"
            />
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsSettingsDialogOpen(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setIsCreateDialogOpen(true);
              setNewFileName('');
              setNewFileLanguage('javascript');
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex items-center bg-gray-50 dark:bg-gray-800 overflow-x-auto">
        {files.map(file => (
          <div 
            key={file.id}
            className={`flex items-center px-3 py-1 border-r cursor-pointer ${
              file.id === activeFileId 
                ? 'bg-white dark:bg-gray-700 border-b-2 border-b-blue-500' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveFileId(file.id)}
          >
            <FileText className="w-3 h-3 mr-1" />
            <span className="text-sm truncate max-w-[100px]">{file.name}</span>
            {files.length > 1 && (
              <button
                className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseFile(file.id);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Editor and Output */}
      <div className="flex flex-col flex-1">
        <Tabs value={showOutput ? 'output' : 'editor'} className="flex-1 flex flex-col">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 border-b flex justify-between">
            <TabsList>
              <TabsTrigger 
                value="editor" 
                onClick={() => setShowOutput(false)}
              >
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="output" 
                onClick={() => setShowOutput(true)}
              >
                Output
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (activeFile) {
                    navigator.clipboard.writeText(activeFile.content);
                    toast({
                      title: "Copied",
                      description: "Code copied to clipboard"
                    });
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="editor" className="flex-1 p-0 m-0 overflow-hidden">
            <div className="flex h-full">
              {/* Line numbers */}
              <div className="bg-gray-100 dark:bg-gray-800 text-right p-4 text-gray-500 dark:text-gray-400 text-sm font-mono">
                {activeFile && Array.from({ length: getLineCount(activeFile.content) }).map((_, i) => (
                  <div key={i} className="select-none">
                    {i + 1}
                  </div>
                ))}
              </div>
              
              {/* Editor */}
              <textarea
                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-900 dark:text-gray-100"
                value={activeFile?.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                spellCheck={false}
                style={{ 
                  fontSize: `${editorSettings.fontSize}px`,
                  tabSize: editorSettings.tabSize,
                  whiteSpace: editorSettings.wordWrap ? 'pre-wrap' : 'pre',
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="flex-1 p-0 m-0">
            <div className="w-full h-full p-4 font-mono text-sm bg-black text-green-400 overflow-auto">
              {output || 'Run your code to see output here...'}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create File Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">File Name</label>
              <Input
                placeholder="Enter file name (e.g. script.js)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select
                value={newFileLanguage}
                onValueChange={setNewFileLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editor Settings</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size</label>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditorSettings({...editorSettings, fontSize: Math.max(10, editorSettings.fontSize - 1)})}
                >
                  -
                </Button>
                <span className="mx-2">{editorSettings.fontSize}px</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditorSettings({...editorSettings, fontSize: Math.min(24, editorSettings.fontSize + 1)})}
                >
                  +
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tab Size</label>
              <Select
                value={String(editorSettings.tabSize)}
                onValueChange={(value) => setEditorSettings({...editorSettings, tabSize: Number(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tab size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="8">8 spaces</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Word Wrap</label>
              <input
                type="checkbox"
                checked={editorSettings.wordWrap}
                onChange={(e) => setEditorSettings({...editorSettings, wordWrap: e.target.checked})}
                className="toggle"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto Save</label>
              <input
                type="checkbox"
                checked={editorSettings.autoSave}
                onChange={(e) => setEditorSettings({...editorSettings, autoSave: e.target.checked})}
                className="toggle"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeEditor;
