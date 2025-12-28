import React from 'react';
import { FileText, Moon, Sun, Eye, Maximize2, X } from 'lucide-react';

export const Header = ({ 
  darkMode, 
  onToggleDarkMode, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo, 
  sectionsCount, 
  previewMode, 
  onToggleSplitPreview, 
  onToggleFullPreview, 
  onExport 
}) => {
  return (
    <div className={`${darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200'} flex-shrink-0`}>
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileText
            size={24}
            className={darkMode ? 'text-indigo-100' : 'text-indigo-600'}
          />
          <span
            className={`text-lg font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-600'}`}
          >
            Dynamic Document Builder
          </span>
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg transition-all transform hover:scale-110 hover:rotate-12 ${
              darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg px-2 py-1`}>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                !canUndo 
                  ? (darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed') 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8H12.5M3.5 8L6.5 5M3.5 8L6.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Undo
            </button>

            <div className={`w-px h-5 ${darkMode ? 'bg-white' : 'bg-black'}`} />

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                !canRedo 
                  ? (darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed') 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95'
              }`}
              title="Redo (Ctrl+Y)"
            >
              Redo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.5 8H3.5M12.5 8L9.5 5M12.5 8L9.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <button
            onClick={onToggleSplitPreview}
            disabled={sectionsCount < 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
              sectionsCount < 1
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
            onClick={onToggleFullPreview}
            disabled={sectionsCount < 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
              sectionsCount < 1
                ? darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : previewMode === 'full'
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
            }`}
          >
            {previewMode === 'full' ? <X size={16} /> : <Maximize2 size={16} />} 
            {previewMode === 'full' ? 'Close Preview' : 'Full Preview'}
          </button>

          <button
            onClick={onExport}
            disabled={sectionsCount < 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
              sectionsCount < 1 
                ? (darkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed') 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
            }`}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};