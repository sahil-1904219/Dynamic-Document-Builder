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

const generateMarkdown = (hierarchy, level = 1) => {
  let markdown = '';

  const processSection = (section, currentLevel) => {
    if (section.name) {
      const heading = '#'.repeat(currentLevel);
      markdown += `${heading} ${section.name}\n\n`;
    }

    // Handle image position
    const imagePosition = section.imagePosition || 'below';

    // Images ABOVE content
    if (imagePosition === 'above' && section.images && section.images.length > 0) {
      section.images.forEach((img) => {
        markdown += `![${img.label}](${img.preview})\n\n`;
      });
    }

    if (section.content) {
      markdown += `${section.content}\n\n`;
    }

    // Images BELOW content (default)
    if (imagePosition === 'below' && section.images && section.images.length > 0) {
      section.images.forEach((img) => {
        markdown += `![${img.label}](${img.preview})\n\n`;
      });
    }

    if (section.children && section.children.length > 0) {
      section.children.forEach(child => processSection(child, currentLevel + 1));
    }
  };

  hierarchy.forEach(section => processSection(section, level));
  return markdown;
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
    { id: 'markdown', name: 'Markdown', description: 'Plain text format', icon: <FileCode className="w-6 h-6" />, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'json', name: 'JSON', description: 'Structured data', icon: <FileJson className="w-6 h-6" />, color: 'bg-purple-600 hover:bg-purple-700' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Export Document</h2>
          <button onClick={onClose} className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg`}>
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {downloadOptions.map(option => (
            <button
              key={option.id}
              onClick={() => onDownload(option.id)}
              className={`${option.color} text-white p-6 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center gap-3 shadow-lg`}
            >
              {option.icon}
              <div className="text-center">
                <h3 className="font-bold">{option.name}</h3>
                <p className="text-xs opacity-90">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};



const SidebarSection = ({ section, sections, level, onSelect, selectedId, onDelete, onAddChild, onDuplicate, onDragStart, onDragOver, onDrop, searchTerm, darkMode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const childSections = sections.filter(s => s.parentId === section.id);

  // Auto-generate name from content
  const displayName = section.name ||
    (section.content ? section.content.substring(0, 30).trim() || 'Untitled' : 'Untitled');

  const matchesSearch = !searchTerm ||
    displayName.toLowerCase().includes(searchTerm.toLowerCase());

  if (!matchesSearch) return null;

  // Max 5 levels
  const canAddChild = level < 3;

  // Check if section is invalid (only images, no content/heading)
  const hasName = section.name && section.name.trim().length > 0;
  const hasContent = section.content && section.content.trim().length > 0;
  const hasImages = section.images && section.images.length > 0;
  const isInvalid = !hasName && !hasContent && hasImages;

  return (
    <div className="relative">
      <div
        draggable
        onDragStart={(e) => onDragStart(e, section.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, section.parentId)}
className={`group relative flex items-start gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all ${selectedId === section.id
          ? darkMode ? 'bg-indigo-900 bg-opacity-50' : 'bg-indigo-50'
          : darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
          } ${isInvalid ? 'border-2 border-red-500 border-dashed' : ''}`}
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
            {isInvalid && <span className="ml-2 text-red-500 text-xs">⚠️ Needs heading or content</span>}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(section.id);
            }}
            className={`p-1 rounded ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'}`}
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
              className={`p-1 rounded ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'}`}
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
            className="p-1 rounded hover:bg-red-500 hover:text-white"
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

const Preview = ({ sections, darkMode }) => {
  const hierarchy = buildHierarchy(sections);


const renderPreviewSection = (section, level = 1) => {
  const HeadingTag = `h${Math.min(level, 6)}`;
  
  // DEFAULT imagePosition to 'below' if not set
  const imagePosition = section.imagePosition || 'below';

  return (
    <div key={section.id} className="mb-6">
      <div
        className={`p-6 rounded-lg transition-all border ${
          darkMode ? 'border-slate-700 bg-slate-800 bg-opacity-30' : 'border-gray-200 bg-gray-50'
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
                <div className={`px-3 py-2 text-sm font-medium text-center ${
                  darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
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
                <div className={`px-3 py-2 text-sm font-medium text-center ${
                  darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
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
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          Document Preview
        </h1>
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
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Saved');
  const [isResizing, setIsResizing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [rotatingIndex, setRotatingIndex] = useState(null);
  const [swappingIndex, setSwappingIndex] = useState(null);


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
    if (window.confirm('Delete this document?')) {
      const newDocs = documents.filter(d => d.id !== docId);
      setDocuments(newDocs);
      if (activeDocId === docId) {
        setActiveDocId(newDocs[0].id);
        setSelectedSectionId(null);
      }
      showNotification('Document deleted');
    }
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

  // Validation function to check if a section is valid
  const isSectionValid = (section) => {
    const hasName = section.name && section.name.trim().length > 0;
    const hasContent = section.content && section.content.trim().length > 0;
    const hasImages = section.images && section.images.length > 0;

    // Section must have at least name OR content
    // Images alone are not sufficient
    return hasName || hasContent;
  };

  // Validate all sections before export
  const validateSectionsForExport = () => {
    const invalidSections = sections.filter(s => !isSectionValid(s));
    
    if (invalidSections.length > 0) {
      const displayNames = invalidSections.map(s => {
        if (s.images && s.images.length > 0) {
          return `Section with ${s.images.length} image(s) only`;
        }
        return 'Empty section';
      });
      
      return {
        valid: false,
        message: `Please fix these sections before exporting:\n• ${displayNames.join('\n• ')}`
      };
    }
    
    return { valid: true };
  };
  // ADD THIS ENTIRE BLOCK AFTER addSection function

  const handleMarkdownUpload = (file) => {
    if (!file || !file.name.endsWith('.md')) {
      showNotification('Please upload a .md file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      parseMarkdownToSections(content);
    };
    reader.readAsText(file);
  };

const parseMarkdownToSections = (markdown) => {
  const lines = markdown.split('\n');
  const newSections = [];
  let currentSection = null;
  let parentStack = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const headingMatch = line.match(/^(#+)\s+(.+)$/);
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (headingMatch) {
      // New heading found
      const level = headingMatch[1].length;
      const name = headingMatch[2].trim();

      while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
        parentStack.pop();
      }

      const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1].id : null;

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
      parentStack.push({ id: currentSection.id, level: level });
    } else if (imageMatch && currentSection) {
      // Image found
      const label = imageMatch[1] || `Fig ${String.fromCharCode(65 + currentSection.images.length)}`;
      const imageData = imageMatch[2];
      
      // If this is the first image and we haven't seen content yet, it's "above"
      if (currentSection.images.length === 0 && !currentSection.content.trim()) {
        currentSection.imagePosition = 'above';
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
      // Content line
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
    
    i++;
  }

  // Clean up content (remove trailing newlines)
  newSections.forEach(section => {
    if (section.content) {
      section.content = section.content.trim();
    }
  });

  setSections(newSections);
  if (newSections.length > 0) {
    setSelectedSectionId(newSections[0].id);
  }
  
  const totalImages = newSections.reduce((sum, s) => sum + (s.images?.length || 0), 0);
  showNotification(`Loaded ${newSections.length} sections with ${totalImages} images!`);
};

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSection = (id) => {
    if (window.confirm('Delete this section and all its subsections?')) {
      const deleteRecursive = (sectionId) => {
        const children = sections.filter(s => s.parentId === sectionId);
        children.forEach(child => deleteRecursive(child.id));
        setSections(prev => prev.filter(s => s.id !== sectionId));
      };
      deleteRecursive(id);
      if (selectedSectionId === id) {
        setSelectedSectionId(null);
      }
      showNotification('Section deleted');
    }
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
          showNotification('⚠️ Add a heading or content - images alone are not enough');
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
  const insertFormatting = (prefix, suffix = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = selectedSection.content || '';
    const selectedText = content.substring(start, end);

    let newText;
    let newCursorPos = start + prefix.length;

    if (prefix === '[LINK]') {
      const url = prompt('Enter URL:');
      if (url) {
        newText = content.substring(0, start) + `[${selectedText || 'Link Text'}](${url})` + content.substring(end);
        newCursorPos = start + (selectedText ? selectedText.length : 9) + 3;
      } else {
        return;
      }
    } else {
      newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
      newCursorPos = end + prefix.length + suffix.length;
    }

    updateSection(selectedSectionId, 'content', newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
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

  const handleDrop = (e, targetParentId) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedSection = sections.find(s => s.id === draggedId);

    if (!draggedSection || draggedId === targetParentId) return;

    const isDescendant = (parentId, childId) => {
      const parent = sections.find(s => s.id === parentId);
      if (!parent) return false;
      if (parent.parentId === childId) return true;
      if (parent.parentId) return isDescendant(parent.parentId, childId);
      return false;
    };

    if (targetParentId && isDescendant(targetParentId, draggedId)) {
      showNotification('Cannot move to descendant');
      return;
    }

    updateSection(draggedId, 'parentId', targetParentId);
    showNotification('Section moved');
  };

  const handleDownload = (format) => {
    if (sections.length === 0) {
      showNotification('Add sections first');
      setShowDownloadModal(false);
      return;
    }

    // Validate sections before export
    const validation = validateSectionsForExport();
    if (!validation.valid) {
      alert(validation.message);
      setShowDownloadModal(false);
      return;
    }

    const hierarchy = buildHierarchy(sections);

    switch (format) {
      case 'markdown':
        const markdown = generateMarkdown(hierarchy);
        downloadFile(markdown, `${activeDoc.name}.md`);
        showNotification('Markdown downloaded!');
        break;
      case 'json':
        downloadFile(JSON.stringify(hierarchy, null, 2), `${activeDoc.name}.json`, 'application/json');
        showNotification('JSON downloaded!');
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
            <FileText size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
            <span className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Dynamic Document Builder
            </span>
          </div>

            <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`p-2 rounded-lg transition-colors ${historyIndex <= 0
                  ? 'opacity-30 cursor-not-allowed'
                  : darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                title="Undo (Ctrl+Z)"
              >
                <span className="text-lg">↶</span>
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`p-2 rounded-lg transition-colors ${historyIndex >= history.length - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                title="Redo (Ctrl+Y)"
              >
                <span className="text-lg">↷</span>
              </button>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'}`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setPreviewMode(previewMode === 'split' ? 'none' : 'split')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${previewMode === 'split'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Eye size={16} />
              Live Preview
              {previewMode === 'split' && <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded">Real-time</span>}
            </button>
            <button
              onClick={() => setPreviewMode(previewMode === 'full' ? 'none' : 'full')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${previewMode === 'full'
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {previewMode === 'full' ? <X size={16} /> : <Maximize2 size={16} />}
              {previewMode === 'full' ? 'Close Preview' : 'Full Preview'}
            </button>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
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
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer group relative ${activeDocId === doc.id
                ? darkMode ? 'bg-slate-900 text-white border-b-2 border-indigo-500' : 'bg-white text-slate-900 border-b-2 border-indigo-600'
                : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              onClick={() => {
                setActiveDocId(doc.id);
                setSelectedSectionId(null);
              }}
            >
              <FileText size={14} />

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
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateDocument(doc.id);
                  }}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-indigo-500 hover:text-white' : 'hover:bg-indigo-500 hover:text-white'}`}
                >
                  <Copy size={12} />
                </button>
                {documents.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                    className="p-1 rounded hover:bg-red-500 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addDocument}
            className={`p-2 ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        {previewMode !== 'full' && (
          <div className={`w-64 border-r flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-sm font-medium"
              >
                <Plus size={18} />
                Add Section
              </button>
              
              {sections.length === 0 && (
                <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-sm font-medium"
              >
                  <Upload size={16} />
                  <span>Load Markdown</span>
                  <input
                    type="file"
                    accept=".md"
                    onChange={(e) => handleMarkdownUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-2">
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

            <div className={`p-4 border-t text-xs flex items-center justify-between ${darkMode ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-600'
              }`}>
              <span>{sections.length} sections</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>{autoSaveStatus}</span>
              </div>
            </div>
          </div>
        )}

        {/* MAIN EDITOR/PREVIEW */}
        {previewMode === 'full' ? (
          <div className="flex-1">
            <Preview sections={sections} darkMode={darkMode} />
          </div>
        ) : (
          <div className="flex-1 flex main-container overflow-hidden">
            {/* EDITOR */}
            <div
              className={`flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
              style={{ width: previewMode === 'split' ? `${previewWidth}%` : '100%' }}>
                {selectedSection ? (
                <>
                  {/* Validation Warning Banner */}
                  {!isSectionValid(selectedSection) && (
                    <div className="bg-red-500 text-white px-4 py-3 flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <p className="font-semibold">Invalid Section</p>
                        <p className="text-sm">This section needs at least a heading or content. Images alone are not sufficient.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Formatting Toolbar */}
                  <div className={`border-b ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'} p-4`}>
               <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <select
                          value={selectedSection.fontSize || '16'}
                          onChange={(e) => updateSection(selectedSectionId, 'fontSize', e.target.value)}
                          className={`px-3 py-2 rounded-lg border text-sm ${darkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-200'
                            : 'bg-white border-gray-300 text-slate-900'
                            }`}
                        >
                          <option value="12">12px</option>
                          <option value="14">14px</option>
                          <option value="16">16px</option>
                          <option value="18">18px</option>
                          <option value="20">20px</option>
                          <option value="24">24px</option>
                        </select>
                        <div className={`w-px h-8 ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                        <button
                          onClick={() => insertFormatting('**', '**')}
                          className={`px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'hover:bg-slate-700 text-slate-200 bg-slate-750' : 'hover:bg-gray-200 text-gray-700 bg-white border border-gray-300'}`}
                          title="Bold"
                        >
                          <span className="text-base font-bold">𝐁</span>
                        </button>
                        <button
                          onClick={() => insertFormatting('_', '_')}
                          className={`px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'hover:bg-slate-700 text-slate-200 bg-slate-750' : 'hover:bg-gray-200 text-gray-700 bg-white border border-gray-300'}`}
                          title="Italic"
                        >
                          <span className="text-base italic">𝐼</span>
                        </button>
                        <button
                          onClick={() => insertFormatting('[LINK]')}
                          className={`px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'hover:bg-slate-700 text-slate-200 bg-slate-750' : 'hover:bg-gray-200 text-gray-700 bg-white border border-gray-300'}`}
                          title="Insert Link"
                        >
                          <span className="text-base">🔗</span>
                        </button>
                        <button
                          onClick={() => insertFormatting('- ', '')}
                          className={`px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'hover:bg-slate-700 text-slate-200 bg-slate-750' : 'hover:bg-gray-200 text-gray-700 bg-white border border-gray-300'}`}
                          title="Bullet List"
                        >
                          <span className="text-base">•</span>
                        </button>
                        <button
                          onClick={() => insertFormatting('1. ', '')}
                          className={`px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'hover:bg-slate-700 text-slate-200 bg-slate-750' : 'hover:bg-gray-200 text-gray-700 bg-white border border-gray-300'}`}
                          title="Numbered List"
                        >
                          <span className="text-base">1.</span>
                        </button>
                        <button
                          onClick={() => insertFormatting('---\n', '')}
                          className={`px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'hover:bg-slate-700 text-slate-200 bg-slate-750' : 'hover:bg-gray-200 text-gray-700 bg-white border border-gray-300'}`}
                          title="Horizontal Line"
                        >
                          <span className="text-base">─</span>
                        </button>
                      </div>
                      
                      {/* Add Image Button - Right Side */}
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}>
                        <Upload size={16} />
                        <span className="text-sm font-medium">Add Image</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={(e) => handleImageUpload(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={selectedSection.name || ''}
                        onChange={(e) => updateSection(selectedSectionId, 'name', e.target.value)}
                        placeholder="Enter section heading (e.g., Introduction, Chapter 1)"
                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold ${darkMode
                          ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500'
                          : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'
                          }`}
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Section Content
                      </label>
                      <textarea
                        ref={textareaRef}
                        value={selectedSection.content || ''}
                        onChange={(e) => updateSection(selectedSectionId, 'content', e.target.value)}
                        placeholder="Start writing your content..."
                        style={{ fontSize: `${selectedSection.fontSize || 16}px` }}
                        className={`flex-1 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${darkMode
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
                              className={`text-xs px-3 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              Change Position: {selectedSection.imagePosition === 'above' ? 'Above Text' : 'Below Text'}
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
                                      <div
                                        className={`text-[10px] text-center py-0.5
              ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'}`}
                                      >
                                        {img.label}
                                      </div>
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

                    <div className={`border-t px-4 py-3 flex items-center justify-between text-xs ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}>
                      <span>{totalChars} characters</span>
                      <span>{totalWords} words</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>{autoSaveStatus}</span>
                      </div>
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
                  <Preview sections={sections} darkMode={darkMode} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicDocumentBuilder;




