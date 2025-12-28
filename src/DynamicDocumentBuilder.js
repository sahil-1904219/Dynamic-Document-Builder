// import React, { useState, useRef, useEffect } from 'react';
// import { Plus, Trash2, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight, Moon, Sun, Copy, Search, Eye, Maximize2 } from 'lucide-react';
// import { Notification } from './components/Notification'
// import { SidebarSection } from './components/modals/SidebarSection';
// import { DownloadModal } from './components/modals/DownloadModal';
// import { DeleteModal } from './components/modals/DeleteModal';
// import { ValidationModal } from './components/modals/ValidateModal';
// import { DocumentTabs } from './components/documents/DocumentTabs';
// import { Header } from './components/layout/Header';
// import { Footer } from './components/layout/Footer';
// import { Preview } from './components/documents/Preview';
// import {
//   generateId,
//   buildHierarchy,           
//   generateMarkdown,
//   generateMetadata,
//   downloadFile,
//   validateSectionsForExport,
//   countWords,
//   countCharacters
// } from './utils/documentUtils';

// import {
//   renderMarkdown,            
//   parseMarkdownToSections,
//   parseJsonToSections
// } from './utils/markdownUtils';

//   const { documents, activeDocId, renameDocument, duplicateDocument, 
//           deleteDocument, addDocument } = useDocuments();
// // ==================== UTILITIES ====================
// // ==================== COMPONENTS ====================

// const DynamicDocumentBuilder = () => {





//   const showNotification = (message) => {
//     setNotification(message);
//   };









//   // NEW VERSION - Heading is REQUIRED

//   // Around line 521






//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [sectionToDelete, setSectionToDelete] = useState(null);








//   const [showValidationModal, setShowValidationModal] = useState(false);
//   const [validationErrors, setValidationErrors] = useState([]);








//    // PASTE Block 1 (handleMouseDown, handleMouseMove, handleMouseUp)
//   // PASTE Block 2 (handleSidebarMouseDown, handleSidebarMouseMove, handleSidebarMouseUp)

//   const totalWords = selectedSection ? countWords(selectedSection.content || '') : 0;
//   const totalChars = selectedSection ? countCharacters(selectedSection.content || '') : 0;
//   const topLevelSections = sections.filter(s => !s.parentId);

//   return (
//     <div className={`h-screen flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
//       <Notification message={notification} onClose={() => setNotification('')} darkMode={darkMode} />

//       {showDeleteModal && (
//         <DeleteModal
//           onClose={() => {
//             setShowDeleteModal(false);
//             setSectionToDelete(null);
//           }}
//           onConfirm={confirmDelete}
//           darkMode={darkMode}
//         />
//       )}
//       {showDeleteDocModal && (
//         <DeleteModal
//           onClose={() => {
//             setShowDeleteDocModal(false);
//             setDocToDelete(null);
//           }}
//           onConfirm={confirmDeleteDocument}
//           darkMode={darkMode}
//         />
//       )}

//       {showValidationModal && (
//         <ValidationModal
//           errors={validationErrors}
//           onClose={() => setShowValidationModal(false)}
//           darkMode={darkMode}
//         />
//       )}

//       {showDownloadModal && (
//         <DownloadModal
//           onClose={() => setShowDownloadModal(false)}
//           onDownload={handleDownload}
//           darkMode={darkMode}
//         />
//       )}

//       {/* HEADER */}


//       {/* DOCUMENT TABS */}

//       {/* HEADER */}
//       <Header
//         darkMode={darkMode}
//         onToggleDarkMode={() => setDarkMode(!darkMode)}
//         onUndo={undo}
//         onRedo={redo}
//         canUndo={historyIndex > 0}
//         canRedo={historyIndex < history.length - 1}
//         sectionsCount={sections.length}
//         previewMode={previewMode}
//         onToggleSplitPreview={() => sections.length >= 1 && setPreviewMode(previewMode === 'split' ? 'none' : 'split')}
//         onToggleFullPreview={() => sections.length >= 1 && setPreviewMode(previewMode === 'full' ? 'none' : 'full')}
//         onExport={() => sections.length >= 1 && setShowDownloadModal(true)}
//       />
//       <DocumentTabs
//         documents={documents}
//         activeDocId={activeDocId}
//         onDocumentChange={(docId) => {
//           setActiveDocId(docId);
//           setSelectedSectionId(null);
//         }}
//         onRenameDocument={renameDocument}
//         onDuplicateDocument={duplicateDocument}
//         onDeleteDocument={deleteDocument}
//         onAddDocument={addDocument}
//         darkMode={darkMode}
//       />



//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex overflow-hidden app-container">
//         {/* LEFT SIDEBAR INITIALLY*/}
//         {previewMode !== 'full' && (

//         )}
//         {/* SIDEBAR RESIZER */}
//         {previewMode !== 'full' && (
//           <div
//             className={`w-1 cursor-col-resize hover:bg-indigo-500 transition-colors ${darkMode ? 'bg-slate-700' : 'bg-gray-300'
//               } ${isResizingSidebar ? 'bg-indigo-500' : ''}`}
//             onMouseDown={handleSidebarMouseDown}
//           />
//         )}
//         {/* MAIN EDITOR/PREVIEW */}
//         {previewMode === 'full' ? (
//           <div className="flex-1">
//             <Preview sections={sections} darkMode={darkMode} activeDoc={activeDoc} />
//           </div>
//         ) : (
//           <div className="flex-1 flex main-container overflow-hidden">
//             {/* EDITOR */}
//             <div
//               className={`flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
//               style={{
//                 width: previewMode === 'split' ? `${previewWidth}%` : '100%',
//                 height: '100%'
//               }}>
//                 //here
//               {selectedSection ? (
//                 <>


//                   {/* Section Content Header */}

//                   <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" style={{ minHeight: 0 }}>
//                     <div>
//                       <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
//                         Section Heading
//                       </label>
//                       <input
//                         type="text"
//                         value={selectedSection.name || ''}
//                         onChange={(e) => updateSection(selectedSectionId, 'name', e.target.value)}
//                         placeholder="Enter section heading (e.g., Introduction, Chapter 1)"
//                         className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold transition-all ${darkMode
//                           ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500'
//                           : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
//                           }`}
//                       />
//                     </div>

//                     <div className="flex-1 flex flex-col">
//                       <div className="flex items-center justify-between mb-2">
//                         <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
//                           Section Content
//                         </label>
//                         <label
//                           className="
//     flex items-center gap-2
//     px-3 py-1.5
//     rounded-md
//     cursor-pointer
//     text-xs font-medium
//     bg-indigo-600
//     text-white
//     hover:bg-indigo-700
//     transition-all
//     active:scale-95
//   "
//                         >
//                           <Upload size={14} />
//                           <span>Add Image</span>
//                           <input
//                             type="file"
//                             accept="image/png,image/jpeg,image/jpg"
//                             onChange={(e) => handleImageUpload(e.target.files[0])}
//                             className="hidden"
//                           />
//                         </label>


//                       </div>
//                       <textarea
//                         ref={textareaRef}
//                         value={selectedSection.content || ''}
//                         onChange={(e) => updateSection(selectedSectionId, 'content', e.target.value)}
//                         placeholder="Start writing your content..."
//                         style={{ fontSize: `${selectedSection.fontSize || 16}px`, minHeight: '230px' }}
//                         className={`flex-1 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all ${darkMode
//                           ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500'
//                           : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
//                           }`}
//                       />



//                         </div>
//                       )}


//                     </div>


//                   </div>
//                 </>
//               ) : (

//               )}
//             </div>

//             {/* SPLIT PREVIEW */}
//             {previewMode === 'split' && (
//               <>
//                 <div
//                   className={`w-1 cursor-col-resize hover:bg-indigo-500 transition-colors ${darkMode ? 'bg-slate-700' : 'bg-gray-300'
//                     } ${isResizing ? 'bg-indigo-500' : ''}`}
//                   onMouseDown={handleMouseDown}
//                 />
//                 <div
//                   className="flex-1 overflow-hidden"
//                   style={{ width: `${100 - previewWidth}%` }}
//                 >
//                   <Preview sections={sections} darkMode={darkMode} activeDoc={activeDoc} />
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* FOOTER - New Component */}
//       <Footer
//         sectionsCount={sections.length}
//         selectedSection={selectedSection}
//         totalChars={totalChars}
//         totalWords={totalWords}
//         autoSaveStatus={autoSaveStatus}
//         darkMode={darkMode}
//       />
//     </div>  // ← Keep this closing div
//   );
// };

// export default DynamicDocumentBuilder;



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