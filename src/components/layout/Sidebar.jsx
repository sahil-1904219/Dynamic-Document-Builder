import React from 'react';
import { Search, Plus, FileCode, FileJson } from 'lucide-react';
import { SidebarSection } from '../modals/SidebarSection';
import { useDocumentContext } from '../../context/DocumentContext';
import { useSections } from '../../hooks/useSections';

export const Sidebar = ({ onMarkdownUpload, onJsonUpload }) => {
  const { 
    searchTerm, 
    setSearchTerm, 
    sections, 
    selectedSectionId,
    setSelectedSectionId,
    darkMode,
    sidebarWidth 
  } = useDocumentContext();
  
  const { 
    addSection, 
    deleteSection, 
    duplicateSection, 
    handleDragStart, 
    handleDragOver, 
    handleDrop 
  } = useSections();

  const topLevelSections = sections.filter(s => !s.parentId);

  return (
    <div 
      className={`border-r flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
      style={{ width: `${sidebarWidth}%`, height: '100%' }}
    >
      <div className="p-4 border-b" style={{ borderColor: darkMode ? '#334155' : '#e5e7eb' }}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
          <Search size={16} className={darkMode ? 'text-slate-400' : 'text-gray-400'} />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${
              darkMode ? 'text-slate-200 placeholder-slate-500' : 'text-slate-900 placeholder-gray-400'
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
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg text-sm font-medium cursor-pointer">
              <FileCode size={16} />
              <span>Load Markdown</span>
              <input
                type="file"
                accept=".md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onMarkdownUpload(file);
                  }
                }}
                className="hidden"
              />
            </label>

            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg text-sm font-medium cursor-pointer">
              <FileJson size={16} />
              <span>Load Metadata JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onJsonUpload(file);
                  }
                }}
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
  );
};