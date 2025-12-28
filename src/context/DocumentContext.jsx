import React, { createContext, useContext, useState } from 'react';

const DocumentContext = createContext();

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocumentContext must be used within DocumentProvider');
  return context;
};

export const DocumentProvider = ({ children }) => {

    const [documents, setDocuments] = useState([
    { id: 'doc_1', name: 'Untitled Document', sections: [], createdAt: new Date().toISOString() }
  ]);
  const [activeDocId, setActiveDocId] = useState('doc_1');
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [notification, setNotification] = useState('');
  const [previewMode, setPreviewMode] = useState('none');
  const [previewWidth, setPreviewWidth] = useState(50);
  const [darkMode, setDarkMode] = useState(() => {
    // Check browser's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Saved');
  const [isResizing, setIsResizing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [rotatingIndex, setRotatingIndex] = useState(null);
  const [swappingIndex, setSwappingIndex] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(20); // percentage
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [showDeleteDocModal, setShowDeleteDocModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const textareaRef = useRef(null);
    const activeDoc = documents.find(d => d.id === activeDocId);
  const sections = activeDoc ? activeDoc.sections : [];
  const selectedSection = sections.find(s => s.id === selectedSectionId);


    const setSections = (newSections) => {
    const updatedSections = typeof newSections === 'function' ? newSections(sections) : newSections;

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedSections);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setDocuments(docs => docs.map(doc =>
      doc.id === activeDocId ? { ...doc, sections: updatedSections } : doc
    ));
    setAutoSaveStatus('Saving...');
    setTimeout(() => setAutoSaveStatus('Saved'), 500);
  };

    const showNotification = (message) => setNotification(message);

  const value = {
    documents, setDocuments,
    activeDocId, setActiveDocId,
    activeDoc, sections, setSections,
    selectedSectionId, setSelectedSectionId,
    selectedSection,
    notification, showNotification, setNotification,
    darkMode, setDarkMode,
    searchTerm, setSearchTerm,
    previewMode, setPreviewMode,
    previewWidth, setPreviewWidth,
    sidebarWidth, setSidebarWidth,
    autoSaveStatus, setAutoSaveStatus,
    history, setHistory,
    historyIndex, setHistoryIndex,
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};
