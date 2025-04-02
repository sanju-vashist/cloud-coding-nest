
import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface AppWindowProps {
  window: {
    id: string;
    type: string;
    title: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    minimized: boolean;
    maximized: boolean;
  };
  isActive: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

const AppWindow: React.FC<AppWindowProps> = ({
  window,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children
}) => {
  const [position, setPosition] = useState(window.position);
  const [size, setSize] = useState(window.size);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Update position and size if window props change
  useEffect(() => {
    setPosition(window.position);
    setSize(window.size);
  }, [window.position, window.size]);
  
  // Handle maximized state
  useEffect(() => {
    if (window.maximized) {
      // Store previous position and size for restoring later
      setPosition({ x: 0, y: 0 });
      // Use window object for innerWidth/innerHeight
      setSize({ 
        width: window.innerWidth || document.documentElement.clientWidth, 
        height: window.innerHeight || document.documentElement.clientHeight 
      });
    }
  }, [window.maximized]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.maximized) return;
    
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    onFocus();
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - size.width || document.documentElement.clientWidth - size.width;
      const maxY = window.innerHeight - 40 || document.documentElement.clientHeight - 40; // Leave space for taskbar
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, size.width]);
  
  if (window.minimized) {
    return null;
  }
  
  return (
    <div
      ref={windowRef}
      className={`absolute rounded-lg overflow-hidden flex flex-col bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 ${
        isActive ? 'ring-2 ring-blue-500 dark:ring-blue-400 z-50' : 'z-10'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease'
      }}
      onClick={onFocus}
    >
      {/* Window Title Bar - macOS style */}
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-700 cursor-move select-none"
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center space-x-1.5">
          <button
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X className="w-2 h-2 text-red-800 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
          >
            <Minus className="w-2 h-2 text-yellow-800 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
          >
            <Square className="w-2 h-2 text-green-800 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div className="absolute inset-x-0 text-center">
          <span className="text-sm font-medium truncate">{window.title}</span>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AppWindow;
