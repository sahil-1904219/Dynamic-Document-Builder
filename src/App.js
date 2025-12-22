// import React, { useState, useRef } from 'react';
// import { Plus, Trash2, GripVertical, Eye, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight } from 'lucide-react';
// import {
//   generateId,
//   buildHierarchy,
//   generatePDF,
//   generateMarkdown,
//   generateMetadata,
//   downloadFile,
//   parseMarkdown,
// } from "./utils/documentUtils";

// import Notification from "./components/Notifications";
// import Preview from "./components/Preview";
// import DownloadModal from "./components/DownloadModal";
// import Section from "./components/Section";

// // Main App Component
// const DynamicDocumentBuilder = () => {
//   const [sections, setSections] = useState([]);
//   const [showDownloadModal, setShowDownloadModal] = useState(false);
//   const [notification, setNotification] = useState('');
//   const [showPreview, setShowPreview] = useState(false);
//   const fileInputRef = useRef(null);

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(''), 3000);
//   };

//   const addSection = (parentId = null) => {
//     const newSection = {
//       id: generateId(),
//       name: '',
//       details: '',
//       parentId,
//       images: [],
//       expanded: true
//     };
//     setSections([...sections, newSection]);
//     showNotification('Section added!');
//   };

//   const updateSection = (id, field, value) => {
//     setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
//   };

//   const deleteSection = (id) => {
//     const childSections = sections.filter(s => s.parentId === id);
//     childSections.forEach(child => deleteSection(child.id));
//     setSections(sections.filter(s => s.id !== id));
//     showNotification('Section deleted');
//   };

//   const handleImageUpload = (id, file) => {
//     if (!file) return;

//     if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const section = sections.find(s => s.id === id);
//         const newImage = { file, preview: reader.result };
//         const currentImages = section.images || [];
//         updateSection(id, 'images', [...currentImages, newImage]);
//         showNotification('Image added');
//       };
//       reader.readAsDataURL(file);
//     } else {
//       showNotification('Please upload PNG or JPG');
//     }
//   };

//   const moveSection = (sectionId, direction) => {
//     const section = sections.find(s => s.id === sectionId);
//     const siblings = sections.filter(s => s.parentId === section.parentId);
//     const currentIndex = siblings.findIndex(s => s.id === sectionId);
    
//     if (direction === 'up' && currentIndex > 0) {
//       const newSections = [...sections];
//       const sectionIndex = newSections.findIndex(s => s.id === sectionId);
//       const targetIndex = newSections.findIndex(s => s.id === siblings[currentIndex - 1].id);
      
//       [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
//       setSections(newSections);
//       showNotification('Section moved up');
//     } else if (direction === 'down' && currentIndex < siblings.length - 1) {
//       const newSections = [...sections];
//       const sectionIndex = newSections.findIndex(s => s.id === sectionId);
//       const targetIndex = newSections.findIndex(s => s.id === siblings[currentIndex + 1].id);
      
//       [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
//       setSections(newSections);
//       showNotification('Section moved down');
//     }
//   };

//   const handleDownload = (format) => {
//     if (sections.length === 0) {
//       showNotification('Add sections first');
//       setShowDownloadModal(false);
//       return;
//     }

//     const emptySections = sections.filter(s => !s.name.trim());
//     if (emptySections.length > 0) {
//       showNotification('Fill in all section names');
//       setShowDownloadModal(false);
//       return;
//     }

//     const hierarchy = buildHierarchy(sections);

//     switch (format) {
//       case 'pdf':
//         const html = generatePDF(hierarchy);
//         downloadFile(html, 'document.html', 'text/html');
//         showNotification('HTML downloaded! Open and print to PDF');
//         break;
//       case 'markdown':
//         const markdown = generateMarkdown(hierarchy);
//         downloadFile(markdown, 'document.md');
//         showNotification('Markdown downloaded!');
//         break;
//       case 'json':
//         const metadata = generateMetadata(hierarchy);
//         downloadFile(JSON.stringify(metadata, null, 2), 'document.json', 'application/json');
//         showNotification('JSON downloaded!');
//         break;
//     }

//     setShowDownloadModal(false);
//   };

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const content = e.target.result;
//         const parsedSections = parseMarkdown(content);
        
//         if (parsedSections.length === 0) {
//           showNotification('No sections found');
//           return;
//         }

//         setSections(parsedSections);
//         showNotification(`${parsedSections.length} sections imported!`);
//       } catch (error) {
//         showNotification('Error parsing file');
//       }
//     };
//     reader.readAsText(file);
//   };

//   const topLevelSections = sections.filter(s => !s.parentId);

//   return (
//     <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
//       <Notification message={notification} />

//       {showDownloadModal && (
//         <DownloadModal
//           onClose={() => setShowDownloadModal(false)}
//           onDownload={handleDownload}
//         />
//       )}

//       {/* HEADER */}
//       <div className="bg-slate-800 text-white px-4 py-3 shadow-lg">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <FileText size={28} className="text-blue-400" />
//             <div>
//               <h1 className="text-xl font-bold">Professional Document Builder</h1>
//               <p className="text-xs text-slate-300">Create formal structured documents</p>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setShowPreview(!showPreview)}
//               className={`px-4 py-2 rounded transition-all text-sm font-medium ${
//                 showPreview 
//                   ? 'bg-purple-600 hover:bg-purple-700' 
//                   : 'bg-slate-600 hover:bg-slate-700'
//               }`}
//             >
//               {showPreview ? 'Hide Preview' : 'Show Preview'}
//             </button>
//             <div className="text-xs text-slate-300">
//               <div>Sections: {sections.length}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* SIDEBAR */}
//         {!showPreview && (
//           <div className="w-48 bg-white border-r border-slate-200 p-4 overflow-y-auto">
//             <div className="space-y-2">
//               <button
//                 onClick={() => addSection()}
//                 className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all text-sm font-medium"
//               >
//                 <Plus size={16} />
//                 <span>Add Section</span>
//               </button>

//               <button
//                 onClick={() => setShowDownloadModal(true)}
//                 disabled={sections.length === 0}
//                 className="w-full flex items-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded transition-all disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium"
//               >
//                 <Download size={16} />
//                 <span>Download</span>
//               </button>

//               <label className="w-full flex items-center gap-2 px-3 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded transition-all cursor-pointer text-sm font-medium">
//                 <Upload size={16} />
//                 <span>Load MD</span>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept=".md,.markdown"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                 />
//               </label>
//             </div>

//             <div className="mt-6 pt-4 border-t border-slate-200">
//               <h3 className="text-xs font-semibold text-slate-700 mb-2">Features</h3>
//               <ul className="text-xs text-slate-600 space-y-1">
//                 <li>• Drag to reorder sections</li>
//                 <li>• Unlimited images per section</li>
//                 <li>• Hierarchical structure</li>
//                 <li>• Clear indentation in preview</li>
//                 <li>• Export to PDF/MD/JSON</li>
//               </ul>
//             </div>
//           </div>
//         )}

//         {/* EDITOR OR PREVIEW */}
//         {!showPreview ? (
//           <div className="flex-1 overflow-y-auto p-4">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
//                 <span>📝</span>
//                 Document Editor
//               </h2>
              
//               {sections.length === 0 ? (
//                 <div className="text-center py-16 text-slate-500">
//                   <FileText size={64} className="mx-auto mb-4 text-slate-300" />
//                   <p className="text-lg font-medium mb-1">No sections yet</p>
//                   <p className="text-sm">Click "Add Section" to get started</p>
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {topLevelSections.map((section, idx) => (
//                     <Section
//                       key={section.id}
//                       section={section}
//                       sections={sections}
//                       level={0}
//                       onUpdate={updateSection}
//                       onDelete={deleteSection}
//                       onAddChild={addSection}
//                       onImageUpload={handleImageUpload}
//                       onMoveUp={(id) => moveSection(id, 'up')}
//                       onMoveDown={(id) => moveSection(id, 'down')}
//                       canMoveUp={idx > 0}
//                       canMoveDown={idx < topLevelSections.length - 1}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="flex-1 bg-slate-50">
//             <Preview sections={sections} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DynamicDocumentBuilder;



import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

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

const generateMarkdown = (hierarchy, level = 1) => {
  let markdown = '';
  
  const processSection = (section, currentLevel) => {
    const heading = '#'.repeat(currentLevel);
    markdown += `${heading} ${section.name || 'Untitled Section'}\n\n`;
    
    if (section.details && section.details.trim()) {
      markdown += `${section.details}\n\n`;
    }
    
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
      details: node.details || '',
      imageCount: node.images ? node.images.length : 0,
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
        .details {
          text-align: justify;
          margin: 15px 0;
          line-height: 1.8;
          page-break-inside: avoid;
          font-size: 11pt;
        }
        .images {
          margin: 25px 0;
          page-break-inside: avoid;
        }
        .image-item {
          margin: 15px 0;
          text-align: center;
        }
        .image-item img { 
          max-width: 400px;
          max-height: 300px;
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
    
    if (section.details && section.details.trim()) {
      html += `<div class="details">${section.details}</div>`;
    }
    
    if (section.images && section.images.length > 0) {
      html += `<div class="images">`;
      section.images.forEach((img, idx) => {
        const label = String.fromCharCode(65 + idx);
        html += `<div class="image-item">`;
        html += `<img src="${img.preview}" alt="${section.name} - Image ${label}" />`;
        html += `<div class="image-caption">Figure ${label}: ${section.name}</div>`;
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
  let currentSection = null;
  let detailsBuffer = [];

  lines.forEach((line) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      if (currentSection && detailsBuffer.length > 0) {
        currentSection.details = detailsBuffer.join('\n').trim();
        detailsBuffer = [];
      }
      
      const level = headingMatch[1].length;
      const name = headingMatch[2];
      
      const section = {
        id: generateId(),
        name,
        parentId: null,
        images: [],
        details: '',
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
      currentSection = section;
    } else if (currentSection && line.trim() && !line.match(/^!\[.*\]\(.*\)$/)) {
      detailsBuffer.push(line);
    }
  });

  if (currentSection && detailsBuffer.length > 0) {
    currentSection.details = detailsBuffer.join('\n').trim();
  }

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

const Notification = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 text-sm">
      <span className="mr-2">✓</span>
      {message}
    </div>
  );
};

const DownloadModal = ({ onClose, onDownload }) => {
  const downloadOptions = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'HTML for printing',
      icon: <File className="w-6 h-6" />,
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      id: 'markdown',
      name: 'Markdown',
      description: 'Plain text format',
      icon: <FileCode className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data',
      icon: <FileJson className="w-6 h-6" />,
      color: 'bg-purple-600 hover:bg-purple-700',
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Export Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-slate-600 mb-6">Choose your export format</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {downloadOptions.map(option => (
            <button
              key={option.id}
              onClick={() => onDownload(option.id)}
              className={`${option.color} text-white p-6 rounded-lg transition-all flex flex-col items-center gap-3`}
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

const Preview = ({ sections }) => {
  const hierarchy = buildHierarchy(sections);
  
  const renderPreviewSection = (section, level = 1) => {
    const HeadingTag = `h${Math.min(level, 6)}`;
    const indentLevel = level - 1;
    
    return (
      <div 
        key={section.id} 
        className="mb-4"
        style={{ marginLeft: `${indentLevel * 40}px` }}
      >
        <HeadingTag 
          className={`font-bold mb-2 ${
            level === 1 ? 'text-base' :
            level === 2 ? 'text-sm' :
            'text-xs'
          }`}
        >
          {section.name || 'Untitled Section'}
        </HeadingTag>
        
        {section.details && section.details.trim() && (
          <p className="mb-3 text-justify leading-relaxed text-xs text-slate-700">
            {section.details}
          </p>
        )}
        
        {section.images && section.images.length > 0 && (
          <div className="mb-4 space-y-3">
            {section.images.map((img, idx) => {
              const label = String.fromCharCode(65 + idx);
              return (
                <div key={idx} className="border border-slate-300 p-3 bg-white rounded">
                  <img
                    src={img.preview}
                    alt={`Image ${label}`}
                    className="max-w-md mx-auto block"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                  <p className="text-center text-xs font-semibold mt-2">
                    Figure {label}: {section.name}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        
        {section.children && section.children.length > 0 && (
          <div>
            {section.children.map((child) => renderPreviewSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-3" />
          <p className="text-base">No sections to preview</p>
          <p className="text-xs mt-1">Add sections to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8 pb-4 border-b-2 border-slate-400">
          <h1 className="text-xl font-bold mb-2">DOCUMENT PREVIEW</h1>
          <p className="text-xs text-slate-600">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        {hierarchy.map((section) => renderPreviewSection(section, 1))}
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
  canMoveDown
}) => {
  const [isExpanded, setIsExpanded] = useState(section.expanded ?? true);
  const [isDragging, setIsDragging] = useState(false);
  const childSections = sections.filter(s => s.parentId === section.id);
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
    <div className="mb-2" style={{ marginLeft: `${level * 20}px` }}>
      <div 
        className={`bg-white rounded border-l-4 ${
          level === 0 ? 'border-blue-500' :
          level === 1 ? 'border-purple-500' :
          level === 2 ? 'border-pink-500' :
          'border-orange-500'
        } p-3 ${isDragging ? 'opacity-50' : ''} transition-all hover:shadow-md shadow-sm`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="cursor-move p-1 hover:bg-slate-100 rounded">
              <GripVertical size={16} className="text-slate-400" />
            </div>
            {childSections.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            <div className="flex-1">
              <input
                type="text"
                value={section.name}
                onChange={(e) => onUpdate(section.id, 'name', e.target.value)}
                placeholder="Section name"
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={() => onDelete(section.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="ml-6">
            <textarea
              value={section.details || ''}
              onChange={(e) => onUpdate(section.id, 'details', e.target.value)}
              placeholder="Section details"
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              rows={2}
            />
          </div>

          {section.images && section.images.length > 0 && (
            <div className="flex flex-wrap gap-2 ml-6">
              {section.images.map((img, idx) => {
                const label = String.fromCharCode(65 + idx);
                return (
                  <div key={idx} className="relative group">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <img
                        src={img.preview}
                        alt={`Image ${label}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <p className="text-xs text-center mt-1 font-medium">Fig. {label}</p>
                    </div>
                    <button
                      onClick={() => {
                        const newImages = section.images.filter((_, i) => i !== idx);
                        onUpdate(section.id, 'images', newImages);
                      }}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm ml-6">
            <label className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-300 rounded cursor-pointer hover:bg-indigo-100">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-indigo-700 text-xs">Add Image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => onImageUpload(section.id, e.target.files[0])}
                className="hidden"
              />
            </label>

            {availableParents.length > 0 && (
              <select
                value={section.parentId || ''}
                onChange={(e) => onUpdate(section.id, 'parentId', e.target.value || null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">No Parent</option>
                {availableParents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    Under: {parent.name || 'Untitled'}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onAddChild(section.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
            >
              <Plus size={14} />
              Subsection
            </button>
          </div>
        </div>
      </div>

      {isExpanded && childSections.map((child, idx) => (
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
        />
      ))}
    </div>
  );
};

const DynamicDocumentBuilder = () => {
  const [sections, setSections] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [notification, setNotification] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const addSection = (parentId = null) => {
    const newSection = {
      id: generateId(),
      name: '',
      details: '',
      parentId,
      images: [],
      expanded: true
    };
    setSections([...sections, newSection]);
    showNotification('Section added!');
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSection = (id) => {
    const childSections = sections.filter(s => s.parentId === id);
    childSections.forEach(child => deleteSection(child.id));
    setSections(sections.filter(s => s.id !== id));
    showNotification('Section deleted');
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all sections? This cannot be undone.')) {
      setSections([]);
      showNotification('Document cleared');
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
        showNotification('Image added');
      };
      reader.readAsDataURL(file);
    } else {
      showNotification('Please upload PNG or JPG');
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
      showNotification('Section moved up');
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
      const newSections = [...sections];
      const sectionIndex = newSections.findIndex(s => s.id === sectionId);
      const targetIndex = newSections.findIndex(s => s.id === siblings[currentIndex + 1].id);
      
      [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
      setSections(newSections);
      showNotification('Section moved down');
    }
  };

  const handleDownload = (format) => {
    if (sections.length === 0) {
      showNotification('Add sections first');
      setShowDownloadModal(false);
      return;
    }

    const emptySections = sections.filter(s => !s.name.trim());
    if (emptySections.length > 0) {
      showNotification('Fill in all section names');
      setShowDownloadModal(false);
      return;
    }

    const hierarchy = buildHierarchy(sections);

    switch (format) {
      case 'pdf':
        const html = generatePDF(hierarchy);
        downloadFile(html, 'document.html', 'text/html');
        showNotification('HTML downloaded! Open and print to PDF');
        break;
      case 'markdown':
        const markdown = generateMarkdown(hierarchy);
        downloadFile(markdown, 'document.md');
        showNotification('Markdown downloaded!');
        break;
      case 'json':
        const metadata = generateMetadata(hierarchy);
        downloadFile(JSON.stringify(metadata, null, 2), 'document.json', 'application/json');
        showNotification('JSON downloaded!');
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
          showNotification('No sections found');
          return;
        }

        setSections(parsedSections);
        showNotification(`${parsedSections.length} sections imported!`);
      } catch (error) {
        showNotification('Error parsing file');
      }
    };
    reader.readAsText(file);
  };

  const topLevelSections = sections.filter(s => !s.parentId);

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      <Notification message={notification} />

      {showDownloadModal && (
        <DownloadModal
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownload}
        />
      )}

      {/* HEADER */}
      <div className="bg-slate-800 text-white px-4 py-3 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={28} className="text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Professional Document Builder</h1>
              <p className="text-xs text-slate-300">Create formal structured documents</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={clearAll}
              className="px-4 py-2 rounded transition-all text-sm font-medium bg-red-600 hover:bg-red-700"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded transition-all text-sm font-medium ${
                showPreview 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {showPreview ? 'Close Preview' : 'Show Preview'}
            </button>
            <div className="text-xs text-slate-300 min-w-[80px]">
              <div>Sections: {sections.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* SIDEBAR */}
        {!showPreview && (
          <div className="w-48 bg-white border-r border-slate-200 p-4 overflow-y-auto flex-shrink-0">
            <div className="space-y-2">
              <button
                onClick={() => addSection()}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all text-sm font-medium"
              >
                <Plus size={16} />
                <span>Add Section</span>
              </button>

              <button
                onClick={() => setShowDownloadModal(true)}
                disabled={sections.length === 0}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded transition-all disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Download size={16} />
                <span>Download</span>
              </button>

              <label className="w-full flex items-center gap-2 px-3 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded transition-all cursor-pointer text-sm font-medium">
                <Upload size={16} />
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

            <div className="mt-6 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-700 mb-2">Tips</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Drag sections to reorder</li>
                <li>• Use subsections to nest</li>
                <li>• Images auto-sized in preview</li>
              </ul>
            </div>
          </div>
        )}

        {/* EDITOR OR PREVIEW */}
        {!showPreview ? (
          <div className="flex-1 overflow-y-auto p-4 min-w-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span>📝</span>
                Document Editor
              </h2>
              
              {sections.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <FileText size={64} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium mb-1">No sections yet</p>
                  <p className="text-sm">Click "Add Section" to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
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
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-slate-50 min-w-0">
            <Preview sections={sections} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicDocumentBuilder;