import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight, GripVertical, Moon, Sun, Copy, Edit2, Check, Layers, BarChart3 } from 'lucide-react';

// ==================== UTILITIES ====================
const generateId = () => `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const LEVEL_COLORS = [
  { border: 'border-blue-500', bg: 'bg-blue-50', bgDark: 'bg-blue-900/20', text: 'text-blue-700', textDark: 'text-blue-300' },
  { border: 'border-purple-500', bg: 'bg-purple-50', bgDark: 'bg-purple-900/20', text: 'text-purple-700', textDark: 'text-purple-300' },
  { border: 'border-pink-500', bg: 'bg-pink-50', bgDark: 'bg-pink-900/20', text: 'text-pink-700', textDark: 'text-pink-300' },
  { border: 'border-orange-500', bg: 'bg-orange-50', bgDark: 'bg-orange-900/20', text: 'text-orange-700', textDark: 'text-orange-300' },
  { border: 'border-teal-500', bg: 'bg-teal-50', bgDark: 'bg-teal-900/20', text: 'text-teal-700', textDark: 'text-teal-300' }
];

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

const generateMarkdown = (hierarchy, level = 1) => {
  let markdown = '';
  
  const processSection = (section, currentLevel) => {
    const heading = '#'.repeat(currentLevel);
    markdown += `${heading} ${section.name || 'Untitled Section'}\n\n`;
    
    if (section.images && section.images.length > 0) {
      section.images.forEach((img, idx) => {
        markdown += `![Image ${idx + 1}](${img.file.name})\n\n`;
      });
    }
    
    if (section.children && section.children.length > 0) {
      section.children.forEach(child => processSection(child, currentLevel + 1));
    }
  };
  
  hierarchy.forEach(section => processSection(section, level));
  return markdown;
};

const generateMetadata = (hierarchy) => {
  const countSections = (nodes) => {
    let count = nodes.length;
    nodes.forEach(node => {
      if (node.children) count += countSections(node.children);
    });
    return count;
  };

  const buildTree = (nodes) => {
    return nodes.map(node => ({
      id: node.id,
      name: node.name,
      imageCount: node.images ? node.images.length : 0,
      imagePosition: node.imagePosition || 'above',
      children: node.children ? buildTree(node.children) : []
    }));
  };

  return {
    totalSections: countSections(hierarchy),
    generatedAt: new Date().toISOString(),
    hierarchy: buildTree(hierarchy)
  };
};

const generatePDF = (hierarchy) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Document</title>
      <style>
        @page { margin: 2cm; }
        body { 
          font-family: 'Times New Roman', Times, serif; 
          max-width: 210mm; 
          margin: 0 auto; 
          padding: 20px; 
          line-height: 1.6; 
          color: #000;
          background: white;
        }
        h1 { 
          font-size: 18pt; 
          margin-top: 30px; 
          margin-bottom: 15px; 
          font-weight: bold;
          page-break-after: avoid;
        }
        h2 { 
          font-size: 16pt; 
          margin-top: 25px; 
          margin-bottom: 12px; 
          font-weight: bold;
          page-break-after: avoid;
        }
        h3 { 
          font-size: 14pt; 
          margin-top: 20px; 
          margin-bottom: 10px; 
          font-weight: bold;
          page-break-after: avoid;
        }
        h4 { 
          font-size: 12pt; 
          margin-top: 18px; 
          margin-bottom: 8px; 
          font-weight: bold;
          page-break-after: avoid;
        }
        .images {
          margin: 25px 0;
          page-break-inside: avoid;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .image-item {
          text-align: center;
        }
        .image-item img { 
          max-width: 200px;
          max-height: 200px;
          width: auto;
          height: auto; 
          border: 1px solid #000;
        }
        .image-caption {
          margin-top: 8px;
          font-style: italic;
          font-size: 10pt;
        }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
  `;
  
  const renderSection = (section, level = 1) => {
    const tag = `h${Math.min(level, 6)}`;
    
    html += `<div class="section">`;
    html += `<${tag}>${section.name || 'Untitled Section'}</${tag}>`;
    
    if (section.images && section.images.length > 0) {
      html += `<div class="images">`;
      section.images.forEach((img, idx) => {
        const label = String.fromCharCode(65 + idx);
        html += `<div class="image-item">`;
        html += `<img src="${img.preview}" alt="${section.name} - Image ${label}" />`;
        html += `<div class="image-caption">Figure ${label}</div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }
    
    if (section.children && section.children.length > 0) {
      section.children.forEach(child => renderSection(child, level + 1));
    }
    
    html += `</div>`;
  };
  
  hierarchy.forEach(section => renderSection(section, 1));
  html += `</body></html>`;
  
  return html;
};

const parseMarkdown = (content) => {
  const lines = content.split('\n');
  const parsedSections = [];
  const sectionStack = [];

  lines.forEach((line) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      const level = headingMatch[1].length;
      const name = headingMatch[2];
      
      const section = {
        id: generateId(),
        name,
        parentId: null,
        images: [],
        imagePosition: 'above',
        expanded: true
      };

      while (sectionStack.length >= level) {
        sectionStack.pop();
      }

      if (sectionStack.length > 0) {
        section.parentId = sectionStack[sectionStack.length - 1].id;
      }

      sectionStack.push(section);
      parsedSections.push(section);
    }
  });

  return parsedSections;
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

// ==================== COMPONENTS ====================

const Notification = ({ message, onClose, darkMode }) => {
  if (!message) return null;
  
  return (
    <div className={`fixed top-4 right-4 ${darkMode ? 'bg-green-700' : 'bg-green-600'} text-white px-6 py-3 rounded-lg shadow-xl z-50 text-sm animate-slide-in`}>
      <span className="mr-2">✓</span>
      {message}
    </div>
  );
};

const DownloadModal = ({ onClose, onDownload, darkMode }) => {
  const downloadOptions = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'HTML for printing',
      icon: <File className="w-6 h-6" />,
      color: darkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700',
    },
    {
      id: 'markdown',
      name: 'Markdown',
      description: 'Plain text format',
      icon: <FileCode className="w-6 h-6" />,
      color: darkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data',
      icon: <FileJson className="w-6 h-6" />,
      color: darkMode ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-600 hover:bg-purple-700',
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-scale-in`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Export Document</h2>
          <button onClick={onClose} className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-all`}>
            <X size={20} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
          </button>
        </div>
        
        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-6`}>Choose your export format</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

const Preview = ({ sections, darkMode }) => {
  const hierarchy = buildHierarchy(sections);
  
  const renderPreviewSection = (section, level = 1) => {
    const HeadingTag = `h${Math.min(level, 6)}`;
    const colorScheme = LEVEL_COLORS[level - 1] || LEVEL_COLORS[4];
    const imagePosition = section.imagePosition || 'above';
    
    return (
      <div key={section.id} className="mb-8">
        <div 
          className={`p-6 rounded-xl transition-all hover:shadow-lg border-l-4 ${colorScheme.border} ${
            darkMode 
              ? `${colorScheme.bgDark} border border-slate-700 hover:border-slate-600` 
              : `${colorScheme.bg} border border-slate-200 hover:shadow-blue-100`
          }`}
          style={{ marginLeft: `${(level - 1) * 24}px` }}
        >
          {imagePosition === 'above' && section.images && section.images.length > 0 && (
            <div className="mb-5 grid grid-cols-3 gap-4">
              {section.images.map((img, idx) => {
                const label = String.fromCharCode(65 + idx);
                return (
                  <div key={idx} className={`${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'} border-2 p-3 rounded-lg hover:shadow-md transition-all`}>
                    <img
                      src={img.preview}
                      alt={`Image ${label}`}
                      className="w-full h-36 object-contain rounded"
                    />
                    <p className={`text-center text-xs font-semibold mt-2 ${colorScheme.text} ${darkMode ? colorScheme.textDark : ''}`}>
                      Figure {label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <HeadingTag 
            className={`font-bold mb-3 ${
              level === 1 ? 'text-2xl' :
              level === 2 ? 'text-xl' :
              level === 3 ? 'text-lg' :
              'text-base'
            } ${colorScheme.text} ${darkMode ? colorScheme.textDark : ''}`}
          >
            {section.name || 'Untitled Section'}
          </HeadingTag>
          
          {imagePosition === 'below' && section.images && section.images.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-4">
              {section.images.map((img, idx) => {
                const label = String.fromCharCode(65 + idx);
                return (
                  <div key={idx} className={`${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'} border-2 p-3 rounded-lg hover:shadow-md transition-all`}>
                    <img
                      src={img.preview}
                      alt={`Image ${label}`}
                      className="w-full h-36 object-contain rounded"
                    />
                    <p className={`text-center text-xs font-semibold mt-2 ${colorScheme.text} ${darkMode ? colorScheme.textDark : ''}`}>
                      Figure {label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {section.children && section.children.length > 0 && (
          <div className="mt-6 space-y-6">
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
          <p className="text-lg font-medium">No sections to preview</p>
          <p className="text-sm mt-1">Add sections to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-slate-50'}`}>
      <div className="max-w-5xl mx-auto p-8">
        <div className={`text-center mb-10 pb-6 ${darkMode ? 'border-slate-700' : 'border-slate-300'} border-b-2`}>
          <h1 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>DOCUMENT PREVIEW</h1>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <div className="space-y-8">
          {hierarchy.map((section) => renderPreviewSection(section, 1))}
        </div>
      </div>
    </div>
  );
};

const Section = ({ 
  section, 
  sections, 
  level, 
  onUpdate, 
  onDelete, 
  onAddChild, 
  onImageUpload,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  darkMode
}) => {
  const [isExpanded, setIsExpanded] = useState(section.expanded ?? true);
  const [isDragging, setIsDragging] = useState(false);
  const childSections = sections.filter(s => s.parentId === section.id);
  const colorScheme = LEVEL_COLORS[level] || LEVEL_COLORS[4];
  const availableParents = sections.filter(s => 
    s.id !== section.id && 
    !isDescendant(sections, s.id, section.id) &&
    s.parentId !== section.id
  );
  
  function isDescendant(allSections, potentialDescendantId, ancestorId) {
    const desc = allSections.find(s => s.id === potentialDescendantId);
    if (!desc || !desc.parentId) return false;
    if (desc.parentId === ancestorId) return true;
    return isDescendant(allSections, desc.parentId, ancestorId);
  }

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', section.id);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (draggedId === section.id) return;
    
    const draggedSection = sections.find(s => s.id === draggedId);
    const targetSection = section;
    
    if (draggedSection.parentId !== targetSection.parentId) {
      return;
    }
    
    const siblings = sections.filter(s => s.parentId === targetSection.parentId);
    const draggedIndex = siblings.findIndex(s => s.id === draggedId);
    const targetIndex = siblings.findIndex(s => s.id === section.id);
    
    if (draggedIndex < targetIndex) {
      onMoveDown(draggedId);
    } else {
      onMoveUp(draggedId);
    }
  };

  return (
    <div className={`mb-5 ${level > 0 ? 'ml-6' : ''}`}>
      <div 
        className={`rounded-xl border-l-4 ${colorScheme.border} p-5 ${isDragging ? 'opacity-50' : ''} transition-all hover:shadow-xl shadow-md ${
          darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:bg-slate-50'
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className={`cursor-move p-1.5 rounded mt-1 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
              <GripVertical size={18} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
            </div>
            {childSections.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1.5 rounded transition-all mt-1 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                {isExpanded ? <ChevronDown size={18} className={darkMode ? 'text-slate-300' : 'text-slate-600'} /> : <ChevronRight size={18} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />}
              </button>
            )}
            <div className="flex-1">
              <textarea
                value={section.name}
                onChange={(e) => onUpdate(section.id, 'name', e.target.value)}
                placeholder="Section name or content..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all resize-none ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {section.images && section.images.length > 0 && (
            <div className="flex flex-wrap gap-3 ml-12">
              {section.images.map((img, idx) => {
                const label = String.fromCharCode(65 + idx);
                return (
                  <div key={idx} className="relative group">
                    <div className={`p-2 rounded-lg border-2 transition-all ${
                      darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <img
                        src={img.preview}
                        alt={`Image ${label}`}
                        className="w-28 h-28 object-cover rounded"
                      />
                      <p className={`text-xs text-center mt-1.5 font-semibold ${colorScheme.text} ${darkMode ? colorScheme.textDark : ''}`}>
                        Fig. {label}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newImages = section.images.filter((_, i) => i !== idx);
                        onUpdate(section.id, 'images', newImages);
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 text-sm ml-12">
            <label className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer transition-all ${
              darkMode 
                ? 'bg-indigo-900 border-indigo-700 hover:bg-indigo-800' 
                : 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'
            }`}>
              <svg className={`w-4 h-4 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-xs font-medium ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>Add Image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => onImageUpload(section.id, e.target.files[0])}
                className="hidden"
              />
            </label>

            {section.images && section.images.length > 0 && (
              <select
                value={section.imagePosition || 'above'}
                onChange={(e) => onUpdate(section.id, 'imagePosition', e.target.value)}
                className={`px-4 py-2.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <option value="above">📷 Images Above</option>
                <option value="below">📷 Images Below</option>
              </select>
            )}

            {availableParents.length > 0 && (
              <select
                value={section.parentId || ''}
                onChange={(e) => onUpdate(section.id, 'parentId', e.target.value || null)}
                className={`px-4 py-2.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <option value="">🏠 No Parent</option>
                {availableParents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    📁 Under: {parent.name || 'Untitled'}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onAddChild(section.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 shadow-md ${
                darkMode 
                  ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus size={15} />
              Subsection
            </button>

            <button
              onClick={() => onDelete(section.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 shadow-md ${
                darkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {isExpanded && childSections.length > 0 && (
        <div className="mt-5 space-y-4 pl-4 border-l-2 border-dashed" style={{ borderColor: colorScheme.border.replace('border-', '') }}>
          {childSections.map((child, idx) => (
            <Section
              key={child.id}
              section={child}
              sections={sections}
              level={level + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onImageUpload={onImageUpload}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={idx > 0}
              canMoveDown={idx < childSections.length - 1}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DynamicDocumentBuilder = () => {
  const [documents, setDocuments] = useState([
    { id: 'doc_1', name: 'Document 1', sections: [], createdAt: new Date().toISOString() }
  ]);
  const [activeDocId, setActiveDocId] = useState('doc_1');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [notification, setNotification] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editingDocName, setEditingDocName] = useState('');
  const fileInputRef = useRef(null);
  
  const activeDoc = documents.find(d => d.id === activeDocId);
  const sections = activeDoc ? activeDoc.sections : [];

  const setSections = (newSections) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === activeDocId ? { ...doc, sections: typeof newSections === 'function' ? newSections(doc.sections) : newSections } : doc
    ));
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
    showNotification('New document created!');
  };

  const duplicateDocument = (docId) => {
    const docToDuplicate = documents.find(d => d.id === docId);
    if (!docToDuplicate) return;

    const newDoc = {
      ...docToDuplicate,
      id: `doc_${Date.now()}`,
      name: `${docToDuplicate.name} (Copy)`,
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
    if (window.confirm('Delete this document? This cannot be undone.')) {
      const newDocs = documents.filter(d => d.id !== docId);
      setDocuments(newDocs);
      if (activeDocId === docId) {
        setActiveDocId(newDocs[0].id);
      }
      showNotification('Document deleted');
    }
  };

  const renameDocument = (docId, newName) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === docId ? { ...doc, name: newName } : doc
    ));
    setEditingDocId(null);
  };

  const startEditingDoc = (docId, currentName) => {
    setEditingDocId(docId);
    setEditingDocName(currentName);
  };

  const getHierarchyLevel = (section, allSections) => {
    let level = 0;
    let currentSection = section;
    while (currentSection && currentSection.parentId) {
      level++;
      currentSection = allSections.find(s => s.id === currentSection.parentId);
      if (!currentSection || level > 10) break;
    }
    return level;
  };

  const canAddSubsection = (parentId) => {
    const siblings = sections.filter(s => s.parentId === parentId);
    if (siblings.length >= 10) {
      showNotification('⚠️ Maximum 10 subsections per parent');
      return false;
    }
    
    const parent = sections.find(s => s.id === parentId);
    if (parent) {
      const level = getHierarchyLevel(parent, sections);
      if (level >= 4) {
        showNotification('⚠️ Maximum 5 hierarchy levels reached');
        return false;
      }
    }
    
    return true;
  };

  const getDocumentStats = () => {
    const totalImages = sections.reduce((sum, s) => sum + (s.images?.length || 0), 0);
    const hierarchy = buildHierarchy(sections);
    const maxDepth = (nodes, depth = 0) => {
      if (!nodes || nodes.length === 0) return depth;
      return Math.max(...nodes.map(n => maxDepth(n.children, depth + 1)));
    };
    return {
      sections: sections.length,
      images: totalImages,
      depth: hierarchy.length > 0 ? maxDepth(hierarchy) : 0
    };
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const addSection = (parentId = null) => {
    if (parentId && !canAddSubsection(parentId)) {
      return;
    }

    const newSection = {
      id: generateId(),
      name: '',
      parentId,
      images: [],
      imagePosition: 'above',
      expanded: true
    };
    setSections([...sections, newSection]);
    showNotification('✅ Section added!');
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSection = (id) => {
    const childSections = sections.filter(s => s.parentId === id);
    childSections.forEach(child => deleteSection(child.id));
    setSections(sections.filter(s => s.id !== id));
    showNotification('🗑️ Section deleted');
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all sections in this document? This cannot be undone.')) {
      setSections([]);
      showNotification('🧹 Document cleared');
    }
  };

  const handleImageUpload = (id, file) => {
    if (!file) return;

    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const section = sections.find(s => s.id === id);
        const newImage = { file, preview: reader.result };
        const currentImages = section.images || [];
        updateSection(id, 'images', [...currentImages, newImage]);
        showNotification('🖼️ Image added');
      };
      reader.readAsDataURL(file);
    } else {
      showNotification('⚠️ Please upload PNG or JPG');
    }
  };

  const moveSection = (sectionId, direction) => {
    const section = sections.find(s => s.id === sectionId);
    const siblings = sections.filter(s => s.parentId === section.parentId);
    const currentIndex = siblings.findIndex(s => s.id === sectionId);
    
    if (direction === 'up' && currentIndex > 0) {
      const newSections = [...sections];
      const sectionIndex = newSections.findIndex(s => s.id === sectionId);
      const targetIndex = newSections.findIndex(s => s.id === siblings[currentIndex - 1].id);
      
      [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
      setSections(newSections);
      showNotification('⬆️ Section moved up');
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
      const newSections = [...sections];
      const sectionIndex = newSections.findIndex(s => s.id === sectionId);
      const targetIndex = newSections.findIndex(s => s.id === siblings[currentIndex + 1].id);
      
      [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
      setSections(newSections);
      showNotification('⬇️ Section moved down');
    }
  };

  const handleDownload = (format) => {
    if (sections.length === 0) {
      showNotification('⚠️ Add sections first');
      setShowDownloadModal(false);
      return;
    }

    const emptySections = sections.filter(s => !s.name.trim());
    if (emptySections.length > 0) {
      showNotification('⚠️ Fill in all section names');
      setShowDownloadModal(false);
      return;
    }

    const hierarchy = buildHierarchy(sections);

    switch (format) {
      case 'pdf':
        const html = generatePDF(hierarchy);
        downloadFile(html, `${activeDoc.name}.html`, 'text/html');
        showNotification('📄 HTML downloaded! Open and print to PDF');
        break;
      case 'markdown':
        const markdown = generateMarkdown(hierarchy);
        downloadFile(markdown, `${activeDoc.name}.md`);
        showNotification('📝 Markdown downloaded!');
        break;
      case 'json':
        const metadata = generateMetadata(hierarchy);
        downloadFile(JSON.stringify(metadata, null, 2), `${activeDoc.name}.json`, 'application/json');
        showNotification('📊 JSON downloaded!');
        break;
    }

    setShowDownloadModal(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedSections = parseMarkdown(content);
        
        if (parsedSections.length === 0) {
          showNotification('⚠️ No sections found');
          return;
        }

        setSections(parsedSections);
        showNotification(`✅ ${parsedSections.length} sections imported!`);
      } catch (error) {
        showNotification('❌ Error parsing file');
      }
    };
    reader.readAsText(file);
  };

  const topLevelSections = sections.filter(s => !s.parentId);
  const stats = getDocumentStats();

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .tab-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .tab-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .tab-scroll::-webkit-scrollbar-thumb {
          background: #64748b;
          border-radius: 4px;
        }
      `}</style>

      <Notification message={notification} darkMode={darkMode} />

      {showDownloadModal && (
        <DownloadModal
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownload}
          darkMode={darkMode}
        />
      )}

      {/* HEADER */}
      <div className={`${darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-gradient-to-r from-slate-800 to-slate-700'} text-white flex-shrink-0 shadow-xl`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText size={32} className="text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold">Professional Document Builder</h1>
              <p className="text-sm text-slate-300">Multi-document workspace with advanced hierarchy</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-lg transition-all ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 rounded-lg transition-all text-sm font-medium bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-lg hover:shadow-xl ${
                showPreview 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {showPreview ? 'Close Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        {/* DOCUMENT TABS */}
        <div className={`px-6 pb-2 flex items-center gap-2 overflow-x-auto tab-scroll ${darkMode ? 'bg-slate-800' : 'bg-slate-700'}`}>
          {documents.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all cursor-pointer group relative ${
                activeDocId === doc.id
                  ? darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                  : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-650' : 'bg-slate-600 text-slate-200 hover:bg-slate-550'
              }`}
              onClick={() => setActiveDocId(doc.id)}
            >
              {editingDocId === doc.id ? (
                <input
                  type="text"
                  value={editingDocName}
                  onChange={(e) => setEditingDocName(e.target.value)}
                  onBlur={() => renameDocument(doc.id, editingDocName)}
                  onKeyPress={(e) => e.key === 'Enter' && renameDocument(doc.id, editingDocName)}
                  className={`px-2 py-1 text-sm rounded border-2 border-blue-500 focus:outline-none ${
                    darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
                  }`}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <FileText size={16} />
                  <span className="text-sm font-medium whitespace-nowrap">{doc.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingDoc(doc.id, doc.name);
                      }}
                      className={`p-1 rounded hover:bg-opacity-20 ${darkMode ? 'hover:bg-white' : 'hover:bg-black'}`}
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateDocument(doc.id);
                      }}
                      className={`p-1 rounded hover:bg-opacity-20 ${darkMode ? 'hover:bg-white' : 'hover:bg-black'}`}
                      title="Duplicate"
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
                        title="Delete"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          <button
            onClick={addDocument}
            className={`p-2 rounded-t-lg transition-all ${
              darkMode ? 'bg-slate-700 hover:bg-slate-650 text-slate-300' : 'bg-slate-600 hover:bg-slate-550 text-slate-200'
            }`}
            title="New Document"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* SIDEBAR */}
        {!showPreview && (
          <div className={`w-64 border-r p-5 overflow-y-auto flex-shrink-0 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            {/* QUICK ACTIONS */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => addSection()}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white transition-all text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Plus size={18} />
                <span>Add Section</span>
              </button>

              <button
                onClick={() => setShowDownloadModal(true)}
                disabled={sections.length === 0}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white transition-all disabled:cursor-not-allowed text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  sections.length === 0
                    ? darkMode ? 'bg-slate-700' : 'bg-slate-300'
                    : darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Download size={18} />
                <span>Download</span>
              </button>

              <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white transition-all cursor-pointer text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                darkMode ? 'bg-orange-700 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'
              }`}>
                <Upload size={18} />
                <span>Load MD</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* DOCUMENT STATS */}
            <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-slate-750 border border-slate-700' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={18} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Document Stats</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sections:</span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{stats.sections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Images:</span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{stats.images}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Max Depth:</span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>{stats.depth}</span>
                </div>
              </div>
            </div>

            {/* HIERARCHY GUIDE */}
            <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={18} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Hierarchy Guide</h3>
              </div>
              <div className="space-y-2">
                {LEVEL_COLORS.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded border-2 ${color.border}`}></div>
                    <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Level {idx + 1}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-purple-700/50' : 'border-purple-200'}`}>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <strong>Max Limits:</strong><br/>
                  • 10 subsections per parent<br/>
                  • 5 hierarchy levels deep
                </p>
              </div>
            </div>

            {/* PRO TIPS */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-750 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
              <h3 className={`text-xs font-bold mb-3 uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>💡 Pro Tips</h3>
              <ul className={`text-xs space-y-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Drag sections to reorder within same level</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <span>Use subsections to organize content hierarchically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">•</span>
                  <span>Images auto-labeled alphabetically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Toggle image position per section</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 font-bold">•</span>
                  <span>Manage multiple documents with tabs</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* EDITOR OR PREVIEW */}
        {!showPreview ? (
          <div className={`flex-1 overflow-y-auto p-6 min-w-0 ${
            darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50'
          }`}>
            <div className={`rounded-xl shadow-2xl p-8 ${
              darkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
                darkMode ? 'text-slate-100' : 'text-slate-800'
              }`}>
                <span className="text-3xl">📝</span>
                {activeDoc.name}
              </h2>
              
              {sections.length === 0 ? (
                <div className={`text-center py-20 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <FileText size={80} className="mx-auto mb-6 opacity-40" />
                  <p className="text-xl font-semibold mb-2">No sections yet</p>
                  <p className="text-sm">Click "Add Section" in the sidebar to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topLevelSections.map((section, idx) => (
                    <Section
                      key={section.id}
                      section={section}
                      sections={sections}
                      level={0}
                      onUpdate={updateSection}
                      onDelete={deleteSection}
                      onAddChild={addSection}
                      onImageUpload={handleImageUpload}
                      onMoveUp={(id) => moveSection(id, 'up')}
                      onMoveDown={(id) => moveSection(id, 'down')}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < topLevelSections.length - 1}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <Preview sections={sections} darkMode={darkMode} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicDocumentBuilder;