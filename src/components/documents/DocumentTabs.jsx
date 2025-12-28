import React from 'react';
import { FileText, Copy, X, Plus } from 'lucide-react';

export const DocumentTabs = ({ 
  documents, 
  activeDocId, 
  onDocumentChange, 
  onRenameDocument, 
  onDuplicateDocument, 
  onDeleteDocument, 
  onAddDocument, 
  darkMode 
}) => {
  return (
    <div className={`px-6 flex items-center gap-2 overflow-x-auto ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
      {documents.map(doc => (
        <div
          key={doc.id}
          className={`flex items-center gap-2 px-4 py-2 cursor-pointer group relative transition-all transform hover:scale-105 ${
            activeDocId === doc.id
              ? darkMode ? 'bg-slate-900 text-white border-b-2 border-indigo-500' : 'bg-white text-slate-900 border-b-2 border-indigo-600'
              : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => onDocumentChange(doc.id)}
        >
          <FileText size={14} className="transition-transform group-hover:scale-110" />

          <input
            type="text"
            value={doc.name}
            onChange={(e) => {
              e.stopPropagation();
              onRenameDocument(doc.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm bg-transparent border-none focus:outline-none w-32 ${
              activeDocId === doc.id
                ? darkMode ? 'text-white' : 'text-slate-900'
                : darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}
          />
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateDocument(doc.id);
              }}
              className={`p-1 rounded transform hover:scale-125 transition-transform ${
                darkMode ? 'hover:bg-indigo-500 hover:text-white' : 'hover:bg-indigo-500 hover:text-white'
              }`}
            >
              <Copy size={12} />
            </button>
            {documents.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocument(doc.id);
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
        onClick={onAddDocument}
        className={`p-2 transition-all transform hover:scale-125 hover:rotate-90 ${
          darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};