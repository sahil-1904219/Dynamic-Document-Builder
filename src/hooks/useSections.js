import { useDocumentContext } from '../context/DocumentContext';
import { generateId } from '../utils/documentUtils';

export const useSections = () => {
  const {
    sections,
    setSections,
    selectedSectionId,
    setSelectedSectionId,
    showNotification,
    sectionToDelete,
    setSectionToDelete,
    showDeleteModal,
    setShowDeleteModal
  } = useDocumentContext();

  const addSection = (parentId = null) => {
    const newSection = {
      id: generateId(),
      name: '',
      content: '',
      parentId,
      images: [],
      expanded: true,
      fontSize: '16'
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
    showNotification('Section added!');
  };

  const isSectionValid = (section) => {
    const hasName = section.name && section.name.trim().length > 0;
    return hasName;
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSection = (id) => {
    setSectionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!sectionToDelete) return;

    // Collect all IDs to delete (section + all descendants)
    const idsToDelete = new Set();

    const collectIds = (sectionId) => {
      idsToDelete.add(sectionId);
      const children = sections.filter(s => s.parentId === sectionId);
      children.forEach(child => collectIds(child.id));
    };

    collectIds(sectionToDelete);

    // Delete all collected sections in one operation
    setSections(prev => prev.filter(s => !idsToDelete.has(s.id)));

    if (selectedSectionId === sectionToDelete || idsToDelete.has(selectedSectionId)) {
      setSelectedSectionId(null);
    }

    showNotification('Section deleted');
    setShowDeleteModal(false);
    setSectionToDelete(null);
  };

  const duplicateSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // Map to store old ID -> new ID mappings
    const idMap = new Map();
    const newSections = [];

    // Recursive function to duplicate a section and all its children
    const duplicateSectionRecursive = (srcSection, newParentId = null) => {
      const newId = generateId();
      idMap.set(srcSection.id, newId);

      const duplicated = {
        ...srcSection,
        id: newId,
        parentId: newParentId,
        name: srcSection.id === sectionId ? `${srcSection.name} (Copy)` : srcSection.name,
      };

      newSections.push(duplicated);

      // Find and duplicate all children
      const children = sections.filter(s => s.parentId === srcSection.id);
      children.forEach(child => {
        duplicateSectionRecursive(child, newId);
      });

      return newId;
    };

    // Start duplication from the selected section
    const newRootId = duplicateSectionRecursive(section, section.parentId);

    setSections([...sections, ...newSections]);
    setSelectedSectionId(newRootId);
    showNotification(`Section duplicated with ${newSections.length} item(s)!`);
  };

  const handleDragStart = (e, sectionId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSectionId) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedSection = sections.find(s => s.id === draggedId);
    const targetSection = sections.find(s => s.id === targetSectionId);

    if (!draggedSection || !targetSection || draggedId === targetSectionId) return;

    // Check if target is a descendant of dragged section
    const isDescendant = (parentId, childId) => {
      const parent = sections.find(s => s.id === parentId);
      if (!parent) return false;
      if (parent.parentId === childId) return true;
      if (parent.parentId) return isDescendant(parent.parentId, childId);
      return false;
    };

    if (isDescendant(targetSectionId, draggedId)) {
      showNotification('Cannot move to descendant');
      return;
    }

    // Make dragged section a sibling of target (same parent as target)
    updateSection(draggedId, 'parentId', targetSection.parentId);
    showNotification('Section moved');
  };

  return {
    addSection,
    updateSection,
    deleteSection,
    confirmDelete,
    duplicateSection,
    isSectionValid,
    handleDragStart,
    handleDragOver,
    handleDrop
  };
};