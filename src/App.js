import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight, Moon, Sun, Copy, Search, Eye, Maximize2 } from 'lucide-react';
import { Notification } from './components/Notification'
// ==================== UTILITIES ====================
const generateId = () => `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;



const buildHierarchy = (sections) => {
  const sectionMap = {};
  const hierarchy = [];

  sections.forEach(section => {
    sectionMap[section.id] = { ...section, children: [] };
  });

  sections.forEach(section => {
    if (section.parentId && sectionMap[section.parentId]) {
      sectionMap[section.parentId].children.push(sectionMap[section.id]);
    } else if (!section.parentId) {
      hierarchy.push(sectionMap[section.id]);
    }
  });

  return hierarchy;
};

const countWords = (text) => {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
};

const countCharacters = (text) => {
  return text.length;
};

const generateMarkdown = (sections) => {
  const hierarchy = buildHierarchy(sections);
  let markdown = '';

  const processSection = (section, level) => {
    // Add heading   
    const heading = '#'.repeat(level);
    markdown += `${heading} ${section.name}\n\n`;

    // Handle image position
    const imagePosition = section.imagePosition || 'below';

    // Images ABOVE content
    if (imagePosition === 'above' && section.images && section.images.length > 0) {
      section.images.forEach((img) => {
        markdown += `![${img.label}](${img.preview})\n\n`;
      });
    }

    // Add content
    if (section.content) {
      markdown += `${section.content}\n\n`;
    }

    // Images BELOW content (default)
    if (imagePosition === 'below' && section.images && section.images.length > 0) {
      section.images.forEach((img) => {
        markdown += `![${img.label}](${img.preview})\n\n`;
      });
    }

    // Process children/subsections recursively
    if (section.children && section.children.length > 0) {
      section.children.forEach(child => processSection(child, level + 1));
    }
  };

  hierarchy.forEach(section => processSection(section, 1));
  return markdown.trim();
};

const generateMetadata = (sections) => {
  const hierarchy = buildHierarchy(sections);

  const buildMetadataTree = (section) => {
    const tree = {
      id: section.id,
      name: section.name,
      content: section.content || '', // Include content in metadata
      fontSize: section.fontSize || '16',
      imagePosition: section.imagePosition || 'below',
      hasContent: !!(section.content && section.content.trim()),
      wordCount: countWords(section.content || ''),
      characterCount: countCharacters(section.content || ''),
      imageCount: section.images ? section.images.length : 0,
      images: section.images ? section.images.map(img => ({
        label: img.label,
        filename: `${img.label.replace(/\s+/g, '_')}.png`,
        type: img.file.type,
        base64Data: img.preview // Full base64 data URI for preservation
      })) : []
    };

    if (section.children && section.children.length > 0) {
      tree.subsections = section.children.map(child => buildMetadataTree(child));
    }

    return tree;
  };

  // Calculate statistics
  const totalImages = sections.reduce((sum, s) => sum + (s.images?.length || 0), 0);
  const totalWords = sections.reduce((sum, s) => sum + countWords(s.content || ''), 0);
  const totalCharacters = sections.reduce((sum, s) => sum + countCharacters(s.content || ''), 0);

  const metadata = {
    documentInfo: {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      totalSections: sections.length,
      topLevelSections: hierarchy.length,
      totalImages: totalImages,
      totalWords: totalWords,
      totalCharacters: totalCharacters
    },
    hierarchy: hierarchy.map(section => buildMetadataTree(section)),
    imageReferences: sections.flatMap(s =>
      s.images ? s.images.map(img => ({
        sectionId: s.id,
        sectionName: s.name,
        label: img.label,
        filename: `${img.label.replace(/\s+/g, '_')}.png`,
        type: img.file.type,
        base64Data: img.preview
      })) : []
    ),
    sectionsList: sections.map(s => ({
      id: s.id,
      name: s.name || 'Untitled',
      parentId: s.parentId || null,
      depth: s.parentId ? (sections.find(p => p.id === s.parentId)?.parentId ? 2 : 1) : 0,
      hasContent: !!(s.content && s.content.trim()),
      imageCount: s.images ? s.images.length : 0
    }))
  };

  return metadata;
};

const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const renderMarkdown = (text) => {
  if (!text) return '';

  let html = text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\_(.+?)\_/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-gray-300" />')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br />');

  return html;
};

// ==================== COMPONENTS ====================

// const Notification = ({ message, onClose, darkMode }) => {
//   useEffect(() => {
//     if (message) {
//       const timer = setTimeout(() => onClose(), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [message, onClose]);

//   if (!message) return null;

//   return (
//     <div className={`fixed top-4 right-4 ${darkMode ? 'bg-green-700' : 'bg-green-600'} text-white px-6 py-3 rounded-lg shadow-xl z-50 text-sm`}>
//       <span className="mr-2">✓</span>
//       {message}
//     </div>
//   );
// };

const DownloadModal = ({ onClose, onDownload, darkMode }) => {
  const downloadOptions = [
    {
      id: 'markdown',
      name: 'Markdown Document',
      description: 'Complete markdown with embedded images',
      icon: <FileCode className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      file: 'output.md'
    },
    {
      id: 'metadata',
      name: 'Metadata File',
      description: 'Hierarchy, statistics & image data',
      icon: <FileJson className="w-6 h-6" />,
      color: 'bg-green-600 hover:bg-green-700',
      file: 'metadata.json'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-3xl w-full p-6`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              Export Document
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Download your document files (images embedded as base64)
            </p>
          </div>
          <button onClick={onClose} className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-colors`}>
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {downloadOptions.map(option => (
            <button
              key={option.id}
              onClick={() => onDownload(option.id)}
              className={`${option.color} text-white p-8 rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl flex flex-col items-center gap-4 shadow-lg`}
            >
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                {option.icon}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">{option.name}</h3>
                <p className="text-xs opacity-90 mb-2">{option.description}</p>
                <div className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-mono">
                  {option.file}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                About these exports
              </h4>
              <ul className={`text-xs space-y-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <li>• <strong>Markdown</strong>: Contains all content with images embedded as base64</li>
                <li>• <strong>Metadata</strong>: Contains document structure, statistics, and image references</li>
                <li>• Both files together provide complete document preservation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ onClose, onConfirm, darkMode }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Delete Section
            </h2>
            <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to delete this section and all its subsections?
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete Section
          </button>
        </div>
      </div>
    </div>
  );
};
const ValidationModal = ({ errors, onClose, darkMode }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-lg w-full p-6`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Cannot Export - Incomplete Sections
            </h2>
            <p className={`text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Please complete these sections before exporting:
            </p>
            <ul className={`space-y-2 mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {errors.map((error, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Each section must have a heading. Content and images are optional.
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
const SidebarSection = ({ section, sections, level, onSelect, selectedId, onDelete, onAddChild, onDuplicate, onDragStart, onDragOver, onDrop, searchTerm, darkMode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const childSections = sections.filter(s => s.parentId === section.id);

  // Auto-generate name from content
  // const displayName = section.name ||
  //   (section.content ? section.content.substring(0, 30).trim() || 'Untitled' : 'Untitled');
  // NEW VERSION - Only show actual heading, never content
  const displayName = section.name && section.name.trim()
    ? section.name
    : 'Untitled';
  const matchesSearch = !searchTerm ||
    displayName.toLowerCase().includes(searchTerm.toLowerCase());

  if (!matchesSearch) return null;

  // Max 5 levels
  const canAddChild = level < 4;

  // Check if section is invalid (only images, no content/heading)
  const hasName = section.name && section.name.trim().length > 0;
  const hasContent = section.content && section.content.trim().length > 0;
  const hasImages = section.images && section.images.length > 0;
  const isInvalid = !hasName;

  return (
    <div className="relative">
      <div
        draggable
        onDragStart={(e) => onDragStart(e, section.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, section.id)}
        className={`group relative flex items-start gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-md ${selectedId === section.id
          ? darkMode ? 'bg-indigo-900 bg-opacity-50 shadow-lg' : 'bg-indigo-50 shadow-lg'
          : darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
          } ${isInvalid ? 'border-2 border-red-500 border-dashed animate-pulse' : ''}`}
        onClick={() => onSelect(section.id)}
        style={{ marginLeft: `${level * 16}px` }}
      >

        {childSections.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-shrink-0 mt-1"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-4 flex-shrink-0"></div>
        )}

        <FileText size={14} className="flex-shrink-0 mt-1" />

        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {displayName}
            {isInvalid && <span className="ml-2 text-red-500 text-xs">⚠️ Heading required</span>}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(section.id);
            }}
            className={`p-1 rounded transform hover:scale-125 transition-transform ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'}`}
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          {canAddChild && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(section.id);
              }}
              className={`p-1 rounded transform hover:scale-125 hover:rotate-90 transition-all ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'}`}
              title="Add subsection"
            >
              <Plus size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(section.id);
            }}
            className="p-1 rounded hover:bg-red-500 hover:text-white transform hover:scale-125 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && childSections.length > 0 && (
        <div>
          {childSections.map(child => (
            <SidebarSection
              key={child.id}
              section={child}
              sections={sections}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onDuplicate={onDuplicate}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              searchTerm={searchTerm}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Preview = ({ sections, darkMode, activeDoc }) => {
  const hierarchy = buildHierarchy(sections);


  const renderPreviewSection = (section, level = 1) => {
    const HeadingTag = `h${Math.min(level, 6)}`;

    // DEFAULT imagePosition to 'below' if not set
    const imagePosition = section.imagePosition || 'below';

    return (
      <div key={section.id} className="mb-6">
        <div
          className={`p-6 rounded-lg transition-all border ${darkMode ? 'border-slate-700 bg-slate-800 bg-opacity-30' : 'border-gray-200 bg-gray-50'
            }`}
          style={{ marginLeft: `${(level - 1) * 24}px` }}
        >
          {section.name && (
            <HeadingTag
              className={`font-bold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}
              style={{
                fontSize: level === 1 ? '2rem' : level === 2 ? '1.5rem' : level === 3 ? '1.25rem' : '1rem'
              }}
            >
              {section.name}
            </HeadingTag>
          )}

          {/* IMAGES ABOVE - Check if images exist AND position is above */}
          {imagePosition === 'above' && section.images && section.images.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-4">
              {section.images.map((img, idx) => (
                <div key={idx} className={`border-2 rounded-lg overflow-hidden ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                  <img src={img.preview} alt={img.label} className="w-full h-32 object-cover" />
                  <div className={`px-3 py-2 text-sm font-medium text-center ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {img.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {section.content && (
            <div
              className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
              style={{ fontSize: `${section.fontSize || 16}px` }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
            />
          )}

          {/* IMAGES BELOW - This is the default, so check for 'below' OR undefined */}
          {(imagePosition === 'below' || !imagePosition) && section.images && section.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {section.images.map((img, idx) => (
                <div key={idx} className={`border-2 rounded-lg overflow-hidden ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                  <img src={img.preview} alt={img.label} className="w-full h-32 object-cover" />
                  <div className={`px-3 py-2 text-sm font-medium text-center ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {img.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {section.children && section.children.length > 0 && (
          <div className="mt-2">
            {section.children.map((child) => renderPreviewSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  if (sections.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        <div className="text-center">
          <FileText size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No content to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto p-8 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className={`max-w-4xl mx-auto p-8 rounded-xl border-2 shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
        }`}>
        {/* <h1 className="text-4xl font-bold mb-8 text-center text-indigo-600">
          {activeDoc?.name || 'Document Preview'}
        </h1> */}

        <h1 className="text-4xl font-bold mb-8 text-center text-slate-800" style={{ color: darkMode ? '#e2e8f0' : '#1e3a8a' }}> {activeDoc?.name || 'Document Preview'} </h1>
        {hierarchy.map((section) => renderPreviewSection(section, 1))}
      </div>
    </div>
  );
};

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
  const validateSectionsForExport = () => {
    const invalidSections = sections.filter(s => !isSectionValid(s));

    if (invalidSections.length > 0) {
      const displayNames = invalidSections.map((s, idx) => {
        // NEW: More specific error message
        if (s.content || (s.images && s.images.length > 0)) {
          return `Section ${idx + 1}: Has content/images but missing heading`;
        }
        return `Section ${idx + 1}: Empty section (heading required)`;
      });

      return {
        valid: false,
        message: `Please add headings to these sections before exporting:\n• ${displayNames.join('\n• ')}`
      };
    }

    return { valid: true };
  };

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

  const parseJsonToSections = (metadata) => {
    if (!metadata.hierarchy || !Array.isArray(metadata.hierarchy)) {
      showNotification('Invalid metadata structure');
      return;
    }

    const newSections = [];

    // Recursive function to process hierarchy
    const processHierarchyNode = (node, parentId = null) => {
      // Create the current section
      const section = {
        id: generateId(),
        name: node.name || '',
        content: node.content || '',
        parentId: parentId,
        images: [],
        expanded: true,
        fontSize: node.fontSize || '16',
        imagePosition: node.imagePosition || 'below'
      };

      // Process images if they exist
      if (node.images && Array.isArray(node.images)) {
        section.images = node.images.map(img => ({
          file: {
            name: img.filename || img.label,
            type: img.type || 'image/png'
          },
          preview: img.base64Data,
          label: img.label
        }));
      }

      // Add this section to the flat list
      newSections.push(section);

      // Process subsections recursively, passing THIS section's ID as parent
      if (node.subsections && Array.isArray(node.subsections)) {
        node.subsections.forEach(child => {
          processHierarchyNode(child, section.id);
        });
      }

      return section.id;
    };

    // Process all top-level sections (they have no parent)
    metadata.hierarchy.forEach(topLevelNode => {
      processHierarchyNode(topLevelNode, null);
    });

    setSections(newSections);
    if (newSections.length > 0) {
      setSelectedSectionId(newSections[0].id);
    }

    const totalImages = newSections.reduce((sum, s) => sum + (s.images?.length || 0), 0);
    const totalWords = newSections.reduce((sum, s) => sum + countWords(s.content || ''), 0);
    showNotification(`Loaded ${newSections.length} sections, ${totalImages} images, ${totalWords} words from metadata!`);
  };
  const parseMarkdownToSections = (markdown) => {
    const lines = markdown.split('\n');
    const newSections = [];
    const sectionStack = []; // Stack to track parent sections by level
    let currentSection = null;
    let contentBuffer = ''; // Buffer to accumulate content lines

    const finalizeSection = () => {
      if (currentSection) {
        currentSection.content = contentBuffer.trim();
        contentBuffer = '';
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

      if (headingMatch) {
        // Finalize previous section
        finalizeSection();

        const level = headingMatch[1].length;
        const name = headingMatch[2].trim();

        // Find correct parent based on level
        let parentId = null;
        if (level > 1) {
          // Find the most recent section at level-1
          for (let j = sectionStack.length - 1; j >= 0; j--) {
            if (sectionStack[j].level === level - 1) {
              parentId = sectionStack[j].id;
              break;
            }
          }
        }

        // Remove sections from stack that are at same or deeper level
        while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
          sectionStack.pop();
        }

        currentSection = {
          id: generateId(),
          name: name,
          content: '',
          parentId: parentId,
          images: [],
          expanded: true,
          fontSize: '16',
          imagePosition: 'below'
        };

        newSections.push(currentSection);
        sectionStack.push({ id: currentSection.id, level: level });

      } else if (imageMatch && currentSection) {
        // Image found
        const label = imageMatch[1] || `Fig ${String.fromCharCode(65 + currentSection.images.length)}`;
        const imageData = imageMatch[2];

        // If no content has been added yet, images go above
        if (!contentBuffer.trim()) {
          currentSection.imagePosition = 'above';
        } else {
          // Content exists, so images go below
          currentSection.imagePosition = 'below';
        }

        currentSection.images.push({
          file: {
            name: label,
            type: imageData.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
          },
          preview: imageData,
          label: label
        });

      } else if (currentSection && line.trim()) {
        // Regular content line
        if (contentBuffer) {
          contentBuffer += '\n';
        }
        contentBuffer += line;
      } else if (currentSection && !line.trim() && contentBuffer) {
        // Preserve empty lines within content
        contentBuffer += '\n';
      }
    }

    // Finalize last section
    finalizeSection();

    setSections(newSections);
    if (newSections.length > 0) {
      setSelectedSectionId(newSections[0].id);
    }

    const totalImages = newSections.reduce((sum, s) => sum + (s.images?.length || 0), 0);
    const totalWords = newSections.reduce((sum, s) => sum + countWords(s.content || ''), 0);
    showNotification(`Loaded ${newSections.length} sections, ${totalImages} images, ${totalWords} words!`);
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
      <div className={`${darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200'} flex-shrink-0`}>
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText
              size={24}
              className={darkMode ? 'text-indigo-100' : 'text-indigo-600'}
            />
            <span
              className={`text-lg font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-600'
                }`}
            >
              Dynamic Document Builder
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}

              className={`p-2 rounded-lg transition-all transform hover:scale-110 hover:rotate-12 ${darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'}`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg px-2 py-1`}>
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historyIndex <= 0 ? (darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed') : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95'}`}
                title="Undo (Ctrl+Z)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 8H12.5M3.5 8L6.5 5M3.5 8L6.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Undo
              </button>

              <div className={`w-px h-5 ${darkMode ? 'bg-white' : 'bg-black'}`} />


              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historyIndex >= history.length - 1 ? (darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed') : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95'}`}
                title="Redo (Ctrl+Y)"
              >
                Redo
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12.5 8H3.5M12.5 8L9.5 5M12.5 8L9.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>


            </div>

            <button
              onClick={() => sections.length >= 1 && setPreviewMode(previewMode === 'split' ? 'none' : 'split')}
              disabled={sections.length < 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${sections.length < 1
                ? darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : previewMode === 'split'
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                }`}
            >
              <Eye size={16} /> Live Preview
              {previewMode === 'split' && <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded animate-pulse">Real-time</span>}
            </button>



            <button
              onClick={() => sections.length >= 1 && setPreviewMode(previewMode === 'full' ? 'none' : 'full')}
              disabled={sections.length < 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${sections.length < 1
                ? darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : previewMode === 'full'
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                }`}
            >
              {previewMode === 'full' ? <X size={16} /> : <Maximize2 size={16} />} {previewMode === 'full' ? 'Close Preview' : 'Full Preview'}
            </button>




            <button
              onClick={() => sections.length >= 1 && setShowDownloadModal(true)}
              disabled={sections.length < 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${sections.length < 1 ? (darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed') : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'}`}
            >
              Export
            </button>




          </div>
        </div>

        {/* DOCUMENT TABS */}
        <div className={`px-6 flex items-center gap-2 overflow-x-auto ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
          {documents.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer group relative transition-all transform hover:scale-105 ${activeDocId === doc.id
                ? darkMode ? 'bg-slate-900 text-white border-b-2 border-indigo-500' : 'bg-white text-slate-900 border-b-2 border-indigo-600'
                : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              onClick={() => {
                setActiveDocId(doc.id);
                setSelectedSectionId(null);
              }}
            >
              <FileText size={14} className="transition-transform group-hover:scale-110" />

              <input
                type="text"
                value={doc.name}
                onChange={(e) => {
                  e.stopPropagation();
                  renameDocument(doc.id, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className={`text-sm bg-transparent border-none focus:outline-none w-32 ${activeDocId === doc.id
                  ? darkMode ? 'text-white' : 'text-slate-900'
                  : darkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}
              />
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateDocument(doc.id);
                  }}
                  className={`p-1 rounded transform hover:scale-125 transition-transform ${darkMode ? 'hover:bg-indigo-500 hover:text-white' : 'hover:bg-indigo-500 hover:text-white'}`}
                >
                  <Copy size={12} />
                </button>
                {documents.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                    className="p-1 rounded hover:bg-red-500 hover:text-white transform hover:scale-125 transition-transform"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addDocument}
            className={`p-2 transition-all transform hover:scale-125 hover:rotate-90 ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden app-container">
        {/* LEFT SIDEBAR */}
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

      {/* UNIFIED FOOTER - ADD THIS HERE */}
      {/* UNIFIED FOOTER - REPLACE WITH THIS */}
      <div className={`border-t ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} flex-shrink-0`}>
        <div className="px-6 py-3 flex items-center justify-between text-xs">
          {/* LEFT: Sections count */}
          <div className="flex items-center">
            <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
              {sections.length} section{sections.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* MIDDLE: Characters and Words */}
          <div className="flex items-center gap-6">
            {selectedSection ? (
              <>
                <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                  {totalChars} characters
                </span>
                <span className={darkMode ? 'text-slate-500' : 'text-gray-400'}>•</span>
                <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                  {totalWords} words
                </span>
              </>
            ) : (
              <span className={darkMode ? 'text-slate-500' : 'text-gray-400'}>
                No section selected
              </span>
            )}
          </div>

          {/* RIGHT: Auto-save status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${autoSaveStatus === 'Saving...' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>{autoSaveStatus}</span>
          </div>
        </div>
      </div>

    </div>  // ← Keep this closing div
  );
};

export default DynamicDocumentBuilder;



