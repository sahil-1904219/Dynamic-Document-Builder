import React, { useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import { ImageGallery } from '../images/ImageGallery';
import { useDocumentContext } from '../../context/DocumentContext';
import { useSections } from '../../hooks/useSections';
import { useImageManagement } from '../../hooks/useImageManagement';

export const SectionEditor = () => {
  const { selectedSection, selectedSectionId, darkMode } = useDocumentContext();
  const { updateSection } = useSections();
  const { handleImageUpload } = useImageManagement();
  const textareaRef = useRef(null);

  if (!selectedSection) {
    return (
      <div className={`flex-1 flex items-center justify-center ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
        <div className="text-center">
          <FileText size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No section selected</p>
          <p className="text-sm mt-2">Select a section from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
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
          <label className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedSection?.images?.length >= 9
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer active:scale-95'
            }`}>
            <Upload size={14} />
            <span>Add Image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="hidden"
              disabled={selectedSection?.images?.length >= 9}
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

        <ImageGallery />
      </div>
    </div>
  );
};