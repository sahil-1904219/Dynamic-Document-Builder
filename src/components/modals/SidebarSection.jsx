import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react';

export const SidebarSection = ({
  section,
  sections,
  level,
  onSelect,
  selectedId,
  onDelete,
  onAddChild,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDrop,
  searchTerm,
  darkMode
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const childSections = sections.filter(s => s.parentId === section.id);

  const displayName = section.name && section.name.trim()
    ? section.name
    : 'Untitled';

  const matchesSearch = !searchTerm ||
    displayName.toLowerCase().includes(searchTerm.toLowerCase());

  if (!matchesSearch) return null;

  const canAddChild = level < 4;

  const hasName = section.name && section.name.trim().length > 0;
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
            className={`p-1 rounded transform hover:scale-125 transition-transform ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
              }`}
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
              className={`p-1 rounded transform hover:scale-125 hover:rotate-90 transition-all ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                }`}
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