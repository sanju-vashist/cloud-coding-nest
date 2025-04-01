
import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';

interface AppWindowProps {
  window: {
    id: string;
    title: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    minimized: boolean;
    maximized: boolean;
  };
  isActive: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
}

const AppWindow: React.FC<AppWindowProps> = ({
  window,
  isActive,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}) => {
  const [position, setPosition] = useState(window.position);
  const [size, setSize] = useState(window.size);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previousPosition, setPreviousPosition] = useState(window.position);
  const [previousSize, setPreviousSize] = useState(window.size);
  
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Effect to hide window when minimized
  useEffect(() => {
    if (window.minimized) {
      setPosition({ ...position, y: window.position.y + window.size.height });
    } else {
      setPosition(previousPosition);
    }
  }, [window.minimized]);
  
  // Effect to maximize/restore window
  useEffect(() => {
    if (window.maximized) {
      setPreviousPosition({ ...position });
      setPreviousSize({ ...size });
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 48 }); // 48px for taskbar
    } else if (previousSize.width > 0) {
      setPosition(previousPosition);
      setSize(previousSize);
    }
  }, [window.maximized]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    
    e.preventDefault();
    onFocus();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setPosition({
      x: Math.max(0, newX),
      y: Math.max(0, newY)
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleResize);
  };
  
  const startResize = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    onFocus();
    setIsResizing(true);
    setResizeDirection(direction);
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !windowRef.current) return;
    
    const rect = windowRef.current.getBoundingClientRect();
    
    if (resizeDirection.includes('e')) {
      const width = e.clientX - rect.left;
      setSize(prev => ({
        ...prev,
        width: Math.max(200, width)
      }));
    }
    
    if (resizeDirection.includes('s')) {
      const height = e.clientY - rect.top;
      setSize(prev => ({
        ...prev,
        height: Math.max(150, height)
      }));
    }
    
    if (resizeDirection.includes('w')) {
      const width = rect.right - e.clientX;
      const x = e.clientX;
      if (width > 200) {
        setSize(prev => ({
          ...prev,
          width
        }));
        setPosition(prev => ({
          ...prev,
          x
        }));
      }
    }
    
    if (resizeDirection.includes('n')) {
      const height = rect.bottom - e.clientY;
      const y = e.clientY;
      if (height > 150) {
        setSize(prev => ({
          ...prev,
          height
        }));
        setPosition(prev => ({
          ...prev,
          y
        }));
      }
    }
  };
  
  if (window.minimized) {
    return null;
  }
  
  return (
    <div
      ref={windowRef}
      className={`absolute rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 transition-shadow ${
        isActive ? 'shadow-2xl ring-1 ring-blue-500/20 z-20' : 'shadow-lg z-10'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onClick={onFocus}
    >
      {/* Window Header */}
      <div
        className={`flex items-center justify-between h-10 px-3 ${
          isActive ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="text-sm font-medium truncate">{window.title}</div>
        <div className="flex items-center space-x-1">
          <button
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={onMinimize}
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={onMaximize}
          >
            {window.maximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button
            className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="flex-1 overflow-auto">{children}</div>
      
      {/* Resize Handles */}
      {!window.maximized && (
        <>
          <div
            className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => startResize(e, 'se')}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize"
            onMouseDown={(e) => startResize(e, 's')}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize"
            onMouseDown={(e) => startResize(e, 'e')}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
            onMouseDown={(e) => startResize(e, 'sw')}
          />
          <div
            className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize"
            onMouseDown={(e) => startResize(e, 'w')}
          />
          <div
            className="absolute top-0 left-0 right-0 h-1 cursor-n-resize"
            onMouseDown={(e) => startResize(e, 'n')}
          />
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
            onMouseDown={(e) => startResize(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
            onMouseDown={(e) => startResize(e, 'ne')}
          />
        </>
      )}
    </div>
  );
};

export default AppWindow;
