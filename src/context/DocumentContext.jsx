import React, { createContext, useContext, useState, useRef } from 'react';
const DocumentContext = createContext();

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([
    {
      id: 'doc_1',
      name: 'Untitled Document',
      sections: [],
      createdAt: new Date().toISOString()
    }
  ]);
  const [activeDocId, setActiveDocId] = useState('doc_1');
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [notification, setNotification] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [previewMode, setPreviewMode] = useState('none');
  const [previewWidth, setPreviewWidth] = useState(50);
  const [sidebarWidth, setSidebarWidth] = useState(20);
  const [autoSaveStatus, setAutoSaveStatus] = useState('Saved');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [rotatingIndex, setRotatingIndex] = useState(null);
  const [swappingIndex, setSwappingIndex] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [showDeleteDocModal, setShowDeleteDocModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const textareaRef = useRef(null);

  const activeDoc = documents.find(d => d.id === activeDocId);
  const sections = activeDoc?.sections || [];
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  const setSections = (newSections) => {
    const updatedSections = typeof newSections === 'function'
      ? newSections(sections)
      : newSections;

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

  const showNotification = (message) => {
    setNotification(message);
  };

  const value = {
    // State
    documents,
    setDocuments,
    activeDocId,
    setActiveDocId,
    activeDoc,
    sections,
    setSections,
    selectedSectionId,
    setSelectedSectionId,
    selectedSection,
    notification,
    showNotification,
    setNotification,
    darkMode,
    setDarkMode,
    searchTerm,
    setSearchTerm,
    previewMode,
    setPreviewMode,
    previewWidth,
    setPreviewWidth,
    sidebarWidth,
    setSidebarWidth,
    autoSaveStatus,
    setAutoSaveStatus,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    rotatingIndex,
    setRotatingIndex,
    swappingIndex,
    setSwappingIndex,
    showDownloadModal,
    setShowDownloadModal,
    showDeleteModal,
    setShowDeleteModal,
    sectionToDelete,
    setSectionToDelete,
    showDeleteDocModal,
    setShowDeleteDocModal,
    docToDelete,
    setDocToDelete,
    showValidationModal,
    setShowValidationModal,
    validationErrors,
    setValidationErrors,
    textareaRef,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};