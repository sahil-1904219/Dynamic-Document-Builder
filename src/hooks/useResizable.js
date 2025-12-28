import { useState, useEffect } from 'react';
import { useDocumentContext } from '../context/DocumentContext';

export const useResizable = () => {
  const { 
    previewMode, 
    previewWidth, 
    setPreviewWidth, 
    sidebarWidth, 
    setSidebarWidth 
  } = useDocumentContext();
  
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const handleMouseDown = (e) => {
    if (previewMode === 'split') {
      setIsResizing(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    const container = document.querySelector('.main-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    if (newWidth > 20 && newWidth < 80) {
      setPreviewWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleSidebarMouseDown = (e) => {
    setIsResizingSidebar(true);
    e.preventDefault();
  };

  const handleSidebarMouseMove = (e) => {
    if (!isResizingSidebar) return;

    const container = document.querySelector('.app-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    if (newWidth > 15 && newWidth < 40) {
      setSidebarWidth(newWidth);
    }
  };

  const handleSidebarMouseUp = () => {
    setIsResizingSidebar(false);
  };

  useEffect(() => {
    if (isResizingSidebar) {
      document.addEventListener('mousemove', handleSidebarMouseMove);
      document.addEventListener('mouseup', handleSidebarMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleSidebarMouseMove);
        document.removeEventListener('mouseup', handleSidebarMouseUp);
      };
    }
  }, [isResizingSidebar]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return { 
    isResizing, 
    isResizingSidebar,
    handleMouseDown, 
    handleSidebarMouseDown 
  };
};