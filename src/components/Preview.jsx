import { Plus, Trash2, GripVertical, Eye, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight } from 'lucide-react';
import { buildHierarchy } from '../utils/documentUtils';

const Preview = ({ sections, onClose }) => {
  const hierarchy = buildHierarchy(sections);
  
  const renderPreviewSection = (section, level = 1) => {
    const HeadingTag = `h${Math.min(level, 6)}`;
    const fontSizes = {
      1: 'text-5xl',
      2: 'text-4xl',
      3: 'text-3xl',
      4: 'text-2xl',
      5: 'text-xl',
      6: 'text-lg'
    };
    const fontSize = fontSizes[level] || 'text-base';
    
    const headingStyles = {
      1: 'text-blue-900 border-b-4 border-blue-600 pb-4 mb-6',
      2: 'text-blue-800 border-b-3 border-blue-500 pb-3 mb-5',
      3: 'text-blue-700 border-l-4 border-blue-400 pl-4 mb-4',
      4: 'text-slate-800 mb-4',
      5: 'text-slate-700 mb-3',
      6: 'text-slate-600 mb-3'
    };
    const headingStyle = headingStyles[level] || 'text-slate-600 mb-3';
    
    return (
      <div key={section.id} className="mb-12 animate-fade-in" style={{ marginLeft: `${(level - 1) * 32}px` }}>
        <div className="bg-gradient-to-r from-blue-50 to-transparent p-6 rounded-xl mb-6 border-l-4 border-blue-500 shadow-sm">
          <HeadingTag className={`${fontSize} ${headingStyle} font-bold`}>
            {section.name || 'Untitled Section'}
          </HeadingTag>
        </div>
        
        {section.details && section.details.trim() && (
          <div className="relative mb-8">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-blue-500 to-indigo-500 rounded-full"></div>
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8 ml-4 shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-blue-500 text-white rounded-full p-2">
                  <FileText size={20} />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Details</h4>
              </div>
              <div className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap pl-11">
                {section.details}
              </div>
            </div>
          </div>
        )}
        
        {section.imagePreview && (
          <div className="mb-10 ml-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500 text-white rounded-full p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-800">Diagram / Image</h4>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-inner">
                <img
                  src={section.imagePreview}
                  alt={section.name}
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg border-2 border-slate-300"
                  style={{ maxHeight: '600px', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        )}
        
        {section.children && section.children.length > 0 && (
          <div className="mt-10 space-y-10 border-l-2 border-dashed border-slate-300 pl-8">
            {section.children.map(child => renderPreviewSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-7xl w-full my-8 animate-scale-in">
        <div className="flex justify-between items-center mb-10 pb-8 border-b-4 border-gradient-to-r from-blue-500 to-purple-500">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-4">
            <Eye className="text-blue-600" size={40} />
            Document Preview
          </h2>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 rounded-lg transition-all font-medium flex items-center gap-2 hover:scale-105 transform shadow-md"
          >
            <X size={20} />
            Close
          </button>
        </div>
        
        {hierarchy.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-40 h-40 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText size={100} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-2xl font-medium">No sections added yet</p>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            {hierarchy.map(section => renderPreviewSection(section))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;