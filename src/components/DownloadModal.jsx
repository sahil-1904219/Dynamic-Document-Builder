
import { Plus, Trash2, GripVertical, Eye, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight } from 'lucide-react';
import {
  buildHierarchy,
} from "../utils/documentUtils";

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
    
    // Calculate left margin for clear indentation
    const indentMargin = indentLevel * 40; // 40px per level
    
    // Define border colors for visual hierarchy
    const borderColors = [
      'border-blue-600',
      'border-purple-600', 
      'border-pink-600',
      'border-orange-600',
      'border-green-600'
    ];
    const borderColor = borderColors[indentLevel % borderColors.length];
    
    return (
      <div 
        key={section.id} 
        className="mb-8"
        style={{ marginLeft: `${indentMargin}px` }}
      >
        <div className={`border-l-4 ${borderColor} pl-6 py-2`}>
          <HeadingTag className={`font-bold mb-4 ${
            level === 1 ? 'text-2xl' :
            level === 2 ? 'text-xl' :
            level === 3 ? 'text-lg' : 'text-base'
          }`}>
            {section.name || 'Untitled Section'}
          </HeadingTag>
        </div>
        
        {section.details && section.details.trim() && (
          <div 
            className="mb-6 text-justify whitespace-pre-wrap leading-relaxed pl-6"
            style={{ marginLeft: '0px' }}
          >
            {section.details}
          </div>
        )}
        
        {section.images && section.images.length > 0 && (
          <div className="mb-6 space-y-6 pl-6">
            {section.images.map((img, idx) => {
              const label = String.fromCharCode(65 + idx);
              return (
                <div key={idx} className="border-2 border-slate-300 p-4 bg-white rounded-lg">
                  <img
                    src={img.preview}
                    alt={`Image ${label}`}
                    className="w-full max-w-2xl mx-auto block border border-slate-200"
                  />
                  <p className="text-center text-sm font-semibold mt-3">
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
          <FileText size={64} className="mx-auto mb-4" />
          <p className="text-lg">No sections to preview</p>
          <p className="text-sm mt-2">Add sections to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white font-serif">
      <div className="max-w-5xl mx-auto p-8">
        <div className="text-center mb-12 pb-6 border-b-2 border-slate-400">
          <h1 className="text-4xl font-bold mb-3">DOCUMENT PREVIEW</h1>
          <p className="text-sm text-slate-600">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        {hierarchy.map((section) => renderPreviewSection(section, 1))}
      </div>
    </div>
  );
};

export default DownloadModal;