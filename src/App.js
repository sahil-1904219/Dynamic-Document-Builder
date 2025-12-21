import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Eye, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight } from 'lucide-react';
import {
  generateId,
  buildHierarchy,
  generatePDF,
  generateMarkdown,
  generateMetadata,
  downloadFile,
  parseMarkdown,
} from "./utils/documentUtils";

import Notification from "./components/Notifications";
import Preview from "./components/Preview";
import DownloadModal from "./components/DownloadModal";
import Section from "./components/Section";

// Main App Component
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
      <div className="bg-slate-800 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={28} className="text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Professional Document Builder</h1>
              <p className="text-xs text-slate-300">Create formal structured documents</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded transition-all text-sm font-medium ${
                showPreview 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-slate-600 hover:bg-slate-700'
              }`}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <div className="text-xs text-slate-300">
              <div>Sections: {sections.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        {!showPreview && (
          <div className="w-48 bg-white border-r border-slate-200 p-4 overflow-y-auto">
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
              <h3 className="text-xs font-semibold text-slate-700 mb-2">Features</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Drag to reorder sections</li>
                <li>• Unlimited images per section</li>
                <li>• Hierarchical structure</li>
                <li>• Clear indentation in preview</li>
                <li>• Export to PDF/MD/JSON</li>
              </ul>
            </div>
          </div>
        )}

        {/* EDITOR OR PREVIEW */}
        {!showPreview ? (
          <div className="flex-1 overflow-y-auto p-4">
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
          <div className="flex-1 bg-slate-50">
            <Preview sections={sections} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicDocumentBuilder;
