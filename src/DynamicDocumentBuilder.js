import React from 'react';
import { DocumentProvider } from './context/DocumentContext';
import { useDocumentContext } from './context/DocumentContext';
import { useDocuments } from './hooks/useDocuments';
import { useSections } from './hooks/useSections';
import { useHistory } from './hooks/useHistory';
import { useResizable } from './hooks/useResizable';
import { Sidebar } from './components/layout/Sidebar';
import { SectionEditor } from './components/sections/SectionEditor';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DocumentTabs } from './components/documents/DocumentTabs';
import { Preview } from './components/documents/Preview';
import { Notification } from './components/modals/Notification';
import { DownloadModal } from './components/modals/DownloadModal';
import { DeleteModal } from './components/modals/DeleteModal';
import { ValidationModal } from './components/modals/ValidateModal';

// At the top, update the imports to include generateId:
import { 
  countWords, 
  countCharacters, 
  generateMarkdown, 
  generateMetadata, 
  downloadFile, 
  validateSectionsForExport,
  generateId  // ADD THIS
} from './utils/documentUtils';
import { parseMarkdownToSections, parseJsonToSections } from './utils/markdownUtils';


const DynamicDocumentBuilderContent = () => {
  const {
    darkMode, setDarkMode,
    notification, setNotification,
    previewMode, setPreviewMode,
    previewWidth,
    showDownloadModal, setShowDownloadModal,
    showDeleteModal, setShowDeleteModal,
    sectionToDelete, setSectionToDelete,
    showDeleteDocModal, setShowDeleteDocModal,
    docToDelete, setDocToDelete,
    showValidationModal, setShowValidationModal,
    validationErrors, setValidationErrors,
    activeDoc, sections, selectedSection,
    selectedSectionId, setSelectedSectionId,
    showNotification,setSections
  } = useDocumentContext();

  const {
    documents,
    activeDocId,
    setActiveDocId,
    renameDocument,
    duplicateDocument,
    deleteDocument,
    addDocument,
    confirmDeleteDocument
  } = useDocuments();

  const { isSectionValid, confirmDelete } = useSections();
  const { undo, redo, canUndo, canRedo } = useHistory();
  const {
    isResizing,
    isResizingSidebar,
    handleMouseDown,
    handleSidebarMouseDown
  } = useResizable();

  // In your DynamicDocumentBuilderContent component, update these functions:

const handleMarkdownUpload = (file) => {
  if (!file || !file.name.endsWith('.md')) {
    showNotification('Please upload a .md file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const result = parseMarkdownToSections(content, generateId);
    
    // Update the sections state with the parsed data
    setSections(result.sections);
    
    // Optionally select the first section
    if (result.sections.length > 0) {
      setSelectedSectionId(result.sections[0].id);
    }
    
    const fileName = file.name.replace('.md', '');
    renameDocument(activeDocId, fileName);
    
    showNotification(`✓ Loaded ${result.sections.length} sections with ${result.stats.totalImages} images`);
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
      const result = parseJsonToSections(metadata, generateId);
      
      // Update the sections state with the parsed data
      setSections(result.sections);
      
      // Optionally select the first section
      if (result.sections.length > 0) {
        setSelectedSectionId(result.sections[0].id);
      }

      const fileName = file.name.replace('_metadata.json', '').replace('.json', '');
      renameDocument(activeDocId, fileName);
      
      showNotification(`✓ Loaded ${result.sections.length} sections with ${result.stats.totalImages} images`);
    } catch (error) {
      showNotification('Invalid JSON file format');
      console.error('JSON parse error:', error);
    }
  };
  reader.readAsText(file);
};

  const handleDownload = (format) => {
    if (sections.length === 0) {
      showNotification('Add sections first');
      setShowDownloadModal(false);
      return;
    }

    const validation = validateSectionsForExport(sections, isSectionValid);
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

  const totalWords = selectedSection ? countWords(selectedSection.content || '') : 0;
  const totalChars = selectedSection ? countCharacters(selectedSection.content || '') : 0;

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

      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
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

      <div className="flex-1 flex overflow-hidden app-container">
        {previewMode !== 'full' && (
          <>
            <Sidebar 
              onMarkdownUpload={handleMarkdownUpload} 
              onJsonUpload={handleJsonUpload} 
            />
            
            <div
              className={`w-1 cursor-col-resize hover:bg-indigo-500 transition-colors ${
                darkMode ? 'bg-slate-700' : 'bg-gray-300'
              } ${isResizingSidebar ? 'bg-indigo-500' : ''}`}
              onMouseDown={handleSidebarMouseDown}
            />
          </>
        )}

        {previewMode === 'full' ? (
          <div className="flex-1">
            <Preview sections={sections} darkMode={darkMode} activeDoc={activeDoc} />
          </div>
        ) : (
          <div className="flex-1 flex main-container overflow-hidden">
            <div
              className={`flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
              style={{
                width: previewMode === 'split' ? `${previewWidth}%` : '100%',
                height: '100%'
              }}
            >
              <SectionEditor />
            </div>

            {previewMode === 'split' && (
              <>
                <div
                  className={`w-1 cursor-col-resize hover:bg-indigo-500 transition-colors ${
                    darkMode ? 'bg-slate-700' : 'bg-gray-300'
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

      <Footer
        sectionsCount={sections.length}
        selectedSection={selectedSection}
        totalChars={totalChars}
        totalWords={totalWords}
        autoSaveStatus="Saved"
        darkMode={darkMode}
      />
    </div>
  );
};

const DynamicDocumentBuilder = () => (
  <DocumentProvider>
    <DynamicDocumentBuilderContent />
  </DocumentProvider>
);

export default DynamicDocumentBuilder;