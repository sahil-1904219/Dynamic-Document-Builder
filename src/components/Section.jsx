import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Eye, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight } from 'lucide-react';

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
    
    // Only allow reordering within same parent level
    if (draggedSection.parentId !== targetSection.parentId) {
      return;
    }
    
    // Get siblings
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
    <div className="mb-3" style={{ marginLeft: `${level * 24}px` }}>
      <div 
        className={`bg-white rounded-lg shadow border-l-4 ${
          level === 0 ? 'border-blue-500' :
          level === 1 ? 'border-purple-500' :
          level === 2 ? 'border-pink-500' :
          'border-orange-500'
        } p-4 ${isDragging ? 'opacity-50' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="cursor-move p-1 hover:bg-slate-100 rounded">
              <GripVertical size={18} className="text-slate-400" />
            </div>
            {childSections.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            )}
            <input
              type="text"
              value={section.name}
              onChange={(e) => onUpdate(section.id, 'name', e.target.value)}
              placeholder="Section name"
              className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={() => onDelete(section.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <textarea
            value={section.details || ''}
            onChange={(e) => onUpdate(section.id, 'details', e.target.value)}
            placeholder="Section details..."
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
            rows={3}
          />

          {section.images && section.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {section.images.map((img, idx) => {
                const label = String.fromCharCode(65 + idx);
                return (
                  <div key={idx} className="relative group">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <img
                        src={img.preview}
                        alt={`Image ${label}`}
                        className="w-24 h-24 object-cover rounded"
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

          <div className="flex flex-wrap items-center gap-2 text-sm">
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

export default Section;