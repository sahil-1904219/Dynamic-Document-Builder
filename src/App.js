import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight, Moon, Sun, Copy, Search, Eye, Maximize2 } from 'lucide-react';
import { Notification } from './components/Notification'
import { SidebarSection } from './components/modals/SidebarSection';
import { DownloadModal } from './components/modals/DownloadModal';
import { DeleteModal } from './components/modals/DeleteModal';
import { ValidationModal } from './components/modals/ValidateModal';
import { DocumentTabs } from './components/documents/DocumentTabs';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Preview } from './components/documents/Preview';
import {
  generateId,
  buildHierarchy,           
  generateMarkdown,
  generateMetadata,
  downloadFile,
  validateSectionsForExport,
  countWords,
  countCharacters
} from './utils/documentUtils';

import {
  renderMarkdown,            
  parseMarkdownToSections,
  parseJsonToSections
} from './utils/markdownUtils';
// ==================== UTILITIES ====================
// ==================== COMPONENTS ====================

const DynamicDocumentBuilder = () => {
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

  const showNotification = (message) => {
    setNotification(message);
  };

  const addDocument = () => {
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: `Document ${documents.length + 1}`,
      sections: [],
      createdAt: new Date().toISOString()
    };
    setDocuments([...documents, newDoc]);
    setActiveDocId(newDoc.id);
    setSelectedSectionId(null);
    showNotification('New document created!');
  };

  const duplicateDocument = (docId) => {
    const docToDuplicate = documents.find(d => d.id === docId);
    if (!docToDuplicate) return;

    const duplicateSection = (section) => {
      const newSection = {
        ...section,
        id: generateId()
      };
      return newSection;
    };

    const newDoc = {
      ...docToDuplicate,
      id: `doc_${Date.now()}`,
      name: `${docToDuplicate.name} (Copy)`,
      sections: docToDuplicate.sections.map(duplicateSection),
      createdAt: new Date().toISOString()
    };
    setDocuments([...documents, newDoc]);
    setActiveDocId(newDoc.id);
    showNotification('Document duplicated!');
  };

  const deleteDocument = (docId) => {
    if (documents.length === 1) {
      showNotification('Cannot delete last document');
      return;
    }
    setDocToDelete(docId);
    setShowDeleteDocModal(true);
  };

  const confirmDeleteDocument = () => {
    if (!docToDelete) return;

    const newDocs = documents.filter(d => d.id !== docToDelete);
    setDocuments(newDocs);
    if (activeDocId === docToDelete) {
      setActiveDocId(newDocs[0].id);
      setSelectedSectionId(null);
    }
    showNotification('Document deleted');
    setShowDeleteDocModal(false);
    setDocToDelete(null);
  };
  const renameDocument = (docId, newName) => {
    setDocuments(docs => docs.map(doc =>
      doc.id === docId ? { ...doc, name: newName } : doc
    ));
  };

  const addSection = (parentId = null) => {
    const newSection = {
      id: generateId(),
      name: '',
      content: '',
      parentId,
      images: [],
      expanded: true,
      fontSize: '16'
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
    showNotification('Section added!');
  };


  // NEW VERSION - Heading is REQUIRED
  const isSectionValid = (section) => {
    const hasName = section.name && section.name.trim().length > 0;
    const hasContent = section.content && section.content.trim().length > 0;
    const hasImages = section.images && section.images.length > 0;
    // Section MUST have a heading/name
    // Content and images are optional
    return hasName;
  };

  // Around line 521


  const handleMarkdownUpload = (file) => {
    if (!file || !file.name.endsWith('.md')) {
      showNotification('Please upload a .md file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      parseMarkdownToSections(content);

      // Update document name to match filename (without extension)
      const fileName = file.name.replace('.md', '');
      renameDocument(activeDocId, fileName);
    };
    reader.readAsText(file);
  };
const handleJsonUpload = (file) => {
    if (!file || !file.name.endsWith('.json')) {
        showNotification('Please upload a .json metadata file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const metadata = JSON.parse(e.target.result);
            parseJsonToSections(metadata);

            // Update document name to match filename (without extension)
            const fileName = file.name.replace('_metadata.json', '').replace('.json', '');
            renameDocument(activeDocId, fileName);
        } catch (error) {
            showNotification('Invalid JSON file format');
            console.error('JSON parse error:', error);
        }
    };
    reader.readAsText(file);
};

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const deleteSection = (id) => {
    setSectionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!sectionToDelete) return;

    // Collect all IDs to delete (section + all descendants)
    const idsToDelete = new Set();

    const collectIds = (sectionId) => {
      idsToDelete.add(sectionId);
      const children = sections.filter(s => s.parentId === sectionId);
      children.forEach(child => collectIds(child.id));
    };

    collectIds(sectionToDelete);

    // Delete all collected sections in one operation
    setSections(prev => prev.filter(s => !idsToDelete.has(s.id)));

    if (selectedSectionId === sectionToDelete || idsToDelete.has(selectedSectionId)) {
      setSelectedSectionId(null);
    }

    showNotification('Section deleted');
    setShowDeleteModal(false);
    setSectionToDelete(null);
  };

  const duplicateSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newSection = {
      ...section,
      id: generateId(),
      name: `${section.name} (Copy)`,
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
    showNotification('Section duplicated!');
  };
  const handleImageUpload = (file) => {
    if (!selectedSection || !file) return;

    if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentImages = selectedSection.images || [];
        const figureLabel = String.fromCharCode(65 + currentImages.length);
        const newImage = {
          file,
          preview: reader.result,
          label: `Fig ${figureLabel}`
        };
        updateSection(selectedSectionId, 'images', [...currentImages, newImage]);

        // Show warning if section has only images
        if (!selectedSection.name?.trim() && !selectedSection.content?.trim()) {
          showNotification('⚠️ Warning: Add a heading - it\'s required for export');
        } else {
          showNotification('Image added');
        }
      };
      reader.readAsDataURL(file);
    } else {
      showNotification('Please upload PNG or JPG');
    }
  };

  const moveImage = (imageIndex, direction) => {
    if (!selectedSection) return;
    const images = [...selectedSection.images];
    const newIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;

    if (newIndex < 0 || newIndex >= images.length) return;

    [images[imageIndex], images[newIndex]] = [images[newIndex], images[imageIndex]];

    // Relabel images
    images.forEach((img, idx) => {
      img.label = `Fig ${String.fromCharCode(65 + idx)}`;
    });

    updateSection(selectedSectionId, 'images', images);
  };

  const deleteImage = (imageIndex) => {
    if (!selectedSection) return;
    const images = selectedSection.images.filter((_, idx) => idx !== imageIndex);

    // Relabel remaining images
    images.forEach((img, idx) => {
      img.label = `Fig ${String.fromCharCode(65 + idx)}`;
    });

    updateSection(selectedSectionId, 'images', images);
    showNotification('Image removed');
  };
  const updateImageLabel = (imageIndex, newLabel) => {
    if (!selectedSection) return;
    const images = [...selectedSection.images];
    images[imageIndex].label = newLabel;
    updateSection(selectedSectionId, 'images', images);
    showNotification('Image label updated');
  };


  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = history[newIndex];
      setDocuments(docs => docs.map(doc =>
        doc.id === activeDocId ? { ...doc, sections: previousState } : doc
      ));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setDocuments(docs => docs.map(doc =>
        doc.id === activeDocId ? { ...doc, sections: nextState } : doc
      ));
    }
  };
  const handleDragStart = (e, sectionId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSectionId) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedSection = sections.find(s => s.id === draggedId);
    const targetSection = sections.find(s => s.id === targetSectionId);

    if (!draggedSection || !targetSection || draggedId === targetSectionId) return;

    // Check if target is a descendant of dragged section
    const isDescendant = (parentId, childId) => {
      const parent = sections.find(s => s.id === parentId);
      if (!parent) return false;
      if (parent.parentId === childId) return true;
      if (parent.parentId) return isDescendant(parent.parentId, childId);
      return false;
    };

    if (isDescendant(targetSectionId, draggedId)) {
      showNotification('Cannot move to descendant');
      return;
    }

    // Make dragged section a sibling of target (same parent as target)
    updateSection(draggedId, 'parentId', targetSection.parentId);
    showNotification('Section moved');
  };
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleDownload = (format) => {
    if (sections.length === 0) {
      showNotification('Add sections first');
      setShowDownloadModal(false);
      return;
    }

    // Validate sections before export
    const validation = validateSectionsForExport();
    if (!validation.valid) {
      const invalidSections = sections.filter(s => !isSectionValid(s));
      const errors = invalidSections.map(s => {
        if (s.images && s.images.length > 0) {
          return `Section with ${s.images.length} image(s) only - Add heading or content`;
        }
        return 'Empty section - Add heading or content';
      });

      setValidationErrors(errors);
      setShowValidationModal(true);
      setShowDownloadModal(false);
      return;
    }

    const docName = activeDoc.name || 'document';

    switch (format) {
      case 'markdown':
        const markdown = generateMarkdown(sections);
        downloadFile(markdown, `${docName}.md`);
        showNotification('✓ Markdown downloaded with embedded images!');
        break;

      case 'metadata':
        const metadata = generateMetadata(sections);
        downloadFile(JSON.stringify(metadata, null, 2), `${docName}_metadata.json`, 'application/json');
        showNotification('✓ Metadata downloaded with hierarchy & statistics!');
        break;
    }

    setShowDownloadModal(false);
  };
  const swapImagesWithSpring = (idx) => {
    if (swappingIndex !== null) return; // prevent double clicks

    setSwappingIndex(idx);

    // swap AFTER spring animation completes
    setTimeout(() => {
      moveImage(idx, 'down');
      setSwappingIndex(null);
    }, 420); // must match duration below
  };


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
  // ADD these new functions after handleMouseUp:
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

  const totalWords = selectedSection ? countWords(selectedSection.content || '') : 0;
  const totalChars = selectedSection ? countCharacters(selectedSection.content || '') : 0;
  const topLevelSections = sections.filter(s => !s.parentId);

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <Notification message={notification} onClose={() => setNotification('')} darkMode={darkMode} />

      {showDeleteModal && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setSectionToDelete(null);
          }}
          onConfirm={confirmDelete}
          darkMode={darkMode}
        />
      )}
      {showDeleteDocModal && (
        <DeleteModal
          onClose={() => {
            setShowDeleteDocModal(false);
            setDocToDelete(null);
          }}
          onConfirm={confirmDeleteDocument}
          darkMode={darkMode}
        />
      )}

      {showValidationModal && (
        <ValidationModal
          errors={validationErrors}
          onClose={() => setShowValidationModal(false)}
          darkMode={darkMode}
        />
      )}

      {showDownloadModal && (
        <DownloadModal
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownload}
          darkMode={darkMode}
        />
      )}

      {/* HEADER */}


      {/* DOCUMENT TABS */}

      {/* HEADER */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        sectionsCount={sections.length}
        previewMode={previewMode}
        onToggleSplitPreview={() => sections.length >= 1 && setPreviewMode(previewMode === 'split' ? 'none' : 'split')}
        onToggleFullPreview={() => sections.length >= 1 && setPreviewMode(previewMode === 'full' ? 'none' : 'full')}
        onExport={() => sections.length >= 1 && setShowDownloadModal(true)}
      />
      <DocumentTabs
        documents={documents}
        activeDocId={activeDocId}
        onDocumentChange={(docId) => {
          setActiveDocId(docId);
          setSelectedSectionId(null);
        }}
        onRenameDocument={renameDocument}
        onDuplicateDocument={duplicateDocument}
        onDeleteDocument={deleteDocument}
        onAddDocument={addDocument}
        darkMode={darkMode}
      />



      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden app-container">
        {/* LEFT SIDEBAR INITIALLY*/}
        {previewMode !== 'full' && (
          <div className={`border-r flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
            style={{ width: `${sidebarWidth}%`, height: '100%' }}>
            <div className="p-4 border-b" style={{ borderColor: darkMode ? '#334155' : '#e5e7eb' }}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
                <Search size={16} className={darkMode ? 'text-slate-400' : 'text-gray-400'} />
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${darkMode ? 'text-slate-200 placeholder-slate-500' : 'text-slate-900 placeholder-gray-400'
                    }`}
                />
              </div>
            </div>

            <div className="p-4 space-y-3">
              <button
                onClick={() => addSection()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg text-sm font-medium"
              >
                <Plus size={18} />
                Add Section
              </button>
              {sections.length === 0 && (
                <>
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg text-sm font-medium"
                  >
                    <FileCode size={16} />
                    <span>Load Markdown</span>
                    <input
                      type="file"
                      accept=".md"
                      onChange={(e) => handleMarkdownUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg text-sm font-medium"
                  >
                    <FileJson size={16} />
                    <span>Load Metadata JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => handleJsonUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
{/* LEFT SIDEBAR*/}
            <div className="flex-1 overflow-y-auto px-2" style={{ minHeight: 0 }}>
              {topLevelSections.map((section) => (
                <SidebarSection
                  key={section.id}
                  section={section}
                  sections={sections}
                  level={0}
                  onSelect={setSelectedSectionId}
                  selectedId={selectedSectionId}
                  onDelete={deleteSection}
                  onAddChild={addSection}
                  onDuplicate={duplicateSection}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  searchTerm={searchTerm}
                  darkMode={darkMode}
                />
              ))}
            </div>


          </div>
        )}
        {/* SIDEBAR RESIZER */}
        {previewMode !== 'full' && (
          <div
            className={`w-1 cursor-col-resize hover:bg-indigo-500 transition-colors ${darkMode ? 'bg-slate-700' : 'bg-gray-300'
              } ${isResizingSidebar ? 'bg-indigo-500' : ''}`}
            onMouseDown={handleSidebarMouseDown}
          />
        )}
        {/* MAIN EDITOR/PREVIEW */}
        {previewMode === 'full' ? (
          <div className="flex-1">
            <Preview sections={sections} darkMode={darkMode} activeDoc={activeDoc} />
          </div>
        ) : (
          <div className="flex-1 flex main-container overflow-hidden">
            {/* EDITOR */}
            <div
              className={`flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
              style={{
                width: previewMode === 'split' ? `${previewWidth}%` : '100%',
                height: '100%'
              }}>
              {selectedSection ? (
                <>


                  {/* Section Content Header */}

                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" style={{ minHeight: 0 }}>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={selectedSection.name || ''}
                        onChange={(e) => updateSection(selectedSectionId, 'name', e.target.value)}
                        placeholder="Enter section heading (e.g., Introduction, Chapter 1)"
                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold transition-all ${darkMode
                          ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500'
                          : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                          }`}
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Section Content
                        </label>
                        <label
                          className="
    flex items-center gap-2
    px-3 py-1.5
    rounded-md
    cursor-pointer
    text-xs font-medium
    bg-indigo-600
    text-white
    hover:bg-indigo-700
    transition-all
    active:scale-95
  "
                        >
                          <Upload size={14} />
                          <span>Add Image</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                            className="hidden"
                          />
                        </label>


                      </div>
                      <textarea
                        ref={textareaRef}
                        value={selectedSection.content || ''}
                        onChange={(e) => updateSection(selectedSectionId, 'content', e.target.value)}
                        placeholder="Start writing your content..."
                        style={{ fontSize: `${selectedSection.fontSize || 16}px`, minHeight: '230px' }}
                        className={`flex-1 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all ${darkMode
                          ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500'
                          : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                          }`}
                      />

                      {selectedSection.images && selectedSection.images.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              Images
                            </label>
                            <button
                              onClick={() => updateSection(selectedSectionId, 'imagePosition',
                                selectedSection.imagePosition === 'above' ? 'below' : 'above')}
                              className={`text-xs px-3 py-1 rounded-lg transition-all transform hover:scale-105 ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              Position: {selectedSection.imagePosition === 'above' ? 'Above Text' : 'Below Text'}
                            </button>
                          </div>
                          <div className="flex items-center gap-6 flex-wrap mt-6">
                            {selectedSection.images.map((img, idx) => {
                              const moveLeft = swappingIndex === idx - 1;
                              const moveRight = swappingIndex === idx;

                              return (
                                <React.Fragment key={idx}>
                                  {/* IMAGE CARD */}
                                  <div
                                    className={`relative group
            transition-transform
            duration-[420ms]
            ${moveLeft ? '-translate-x-[110px]' : ''}
            ${moveRight ? 'translate-x-[110px]' : ''}
          `}
                                    style={{
                                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    }}
                                  >
                                    <div
                                      className={`border rounded-md overflow-hidden w-[88px]
            ${darkMode ? 'border-slate-600' : 'border-gray-300'}`}
                                    >
                                      <img
                                        src={img.preview}
                                        alt={img.label}
                                        className="w-[88px] h-[88px] object-cover"
                                      />
                                      <input
                                        type="text"
                                        value={img.label}
                                        onChange={(e) => updateImageLabel(idx, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`text-[10px] text-center py-0.5 w-full border-none focus:outline-none focus:ring-1 focus:ring-indigo-500
    ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'}`}
                                        placeholder="Image label"
                                      />
                                    </div>

                                    {/* DELETE (EDGE, HOVER ONLY) */}
                                    <button
                                      onClick={() => deleteImage(idx)}
                                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full
                       bg-red-500 text-white text-[10px]
                       flex items-center justify-center
                       shadow-md hover:bg-red-600
                       opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      ✕
                                    </button>

                                    {/* EDIT (CENTER, GLASS EFFECT) */}
                                    <label
                                      className="absolute inset-0 flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity
                       cursor-pointer"
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center
                          backdrop-blur-sm shadow-lg
                          ${darkMode
                                            ? 'bg-slate-800/70 text-slate-200'
                                            : 'bg-white/70 text-gray-700'}`}
                                      >
                                        ✎
                                      </div>

                                      <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (!file) return;

                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const updatedImages = [...selectedSection.images];
                                            updatedImages[idx] = {
                                              ...updatedImages[idx],
                                              file,
                                              preview: reader.result,
                                            };
                                            updateSection(selectedSectionId, 'images', updatedImages);
                                          };
                                          reader.readAsDataURL(file);
                                        }}
                                      />
                                    </label>
                                  </div>

                                  {/* ⇄ SPRING SWAP BUTTON */}
                                  {idx < selectedSection.images.length - 1 && (
                                    <button
                                      onClick={() => swapImagesWithSpring(idx)}
                                      className={`w-10 h-10 rounded-full flex items-center justify-center
                        shadow-md transition
                        ${darkMode
                                          ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                      title="Swap images"
                                    >
                                      ⇄
                                    </button>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>


                        </div>
                      )}


                    </div>


                  </div>
                </>
              ) : (
                <div className={`flex-1 flex items-center justify-center ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  <div className="text-center">
                    <FileText size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No section selected</p>
                    <p className="text-sm mt-2">Select a section from the sidebar or create a new one</p>
                  </div>
                </div>
              )}
            </div>

            {/* SPLIT PREVIEW */}
            {previewMode === 'split' && (
              <>
                <div
                  className={`w-1 cursor-col-resize hover:bg-indigo-500 transition-colors ${darkMode ? 'bg-slate-700' : 'bg-gray-300'
                    } ${isResizing ? 'bg-indigo-500' : ''}`}
                  onMouseDown={handleMouseDown}
                />
                <div
                  className="flex-1 overflow-hidden"
                  style={{ width: `${100 - previewWidth}%` }}
                >
                  <Preview sections={sections} darkMode={darkMode} activeDoc={activeDoc} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* FOOTER - New Component */}
      <Footer
        sectionsCount={sections.length}
        selectedSection={selectedSection}
        totalChars={totalChars}
        totalWords={totalWords}
        autoSaveStatus={autoSaveStatus}
        darkMode={darkMode}
      />
    </div>  // ← Keep this closing div
  );
};

export default DynamicDocumentBuilder;



