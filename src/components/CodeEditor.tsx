
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Save, Play, Plus, X, FileText } from 'lucide-react';

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
  const [newFileName, setNewFileName] = useState('');
  const [output, setOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState(false);
  
  // Save files to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem(`webOS_codeFiles_${userId}`, JSON.stringify(files));
  }, [files, userId]);
  
  const activeFile = files.find(file => file.id === activeFileId);
  
  const handleContentChange = (content: string) => {
    if (!activeFile) return;
    
    setFiles(files.map(file => 
      file.id === activeFileId ? { ...file, content } : file
    ));
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
    
    // Determine language from file extension
    const extension = newFileName.split('.').pop() || '';
    let language = 'text';
    
    if (['js', 'jsx'].includes(extension)) language = 'javascript';
    else if (['ts', 'tsx'].includes(extension)) language = 'typescript';
    else if (['html'].includes(extension)) language = 'html';
    else if (['css'].includes(extension)) language = 'css';
    else if (['py'].includes(extension)) language = 'python';
    
    const newFile: CodeFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      content: '',
      language
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
  
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 border-b">
        <div className="flex items-center">
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
            className="ml-2" 
            onClick={handleRunCode}
          >
            <Play className="w-4 h-4 mr-1" /> Run
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setIsCreateDialogOpen(true);
            setNewFileName('');
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
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
          </div>
          
          <TabsContent value="editor" className="flex-1 p-0 m-0">
            <textarea
              className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
              value={activeFile?.content || ''}
              onChange={(e) => handleContentChange(e.target.value)}
              spellCheck={false}
            />
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
          
          <div className="py-4">
            <Input
              placeholder="Enter file name (e.g. script.js)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
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
    </div>
  );
};

export default CodeEditor;
