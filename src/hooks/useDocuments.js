import { useDocumentContext } from '../context/DocumentContext';
import { generateId } from '../utils/documentUtils';

export const useDocuments = () => {
  const { 
    documents, 
    setDocuments, 
    activeDocId, 
    setActiveDocId,
    setSelectedSectionId,
    showNotification,
    docToDelete,
    setDocToDelete,
    setShowDeleteDocModal
  } = useDocumentContext();

  const addDocument = () => {
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: `Document ${documents.length + 1}`,
      sections: [],
      createdAt: new Date().toISOString()
    };
    setDocuments([...documents, newDoc]);
    setActiveDocId(newDoc.id);
    setSelectedSectionId(null);
    showNotification('New document created!');
  };

  const duplicateDocument = (docId) => {
    const docToDuplicate = documents.find(d => d.id === docId);
    if (!docToDuplicate) return;

    const duplicateSection = (section) => ({
      ...section,
      id: generateId()
    });

    const newDoc = {
      ...docToDuplicate,
      id: `doc_${Date.now()}`,
      name: `${docToDuplicate.name} (Copy)`,
      sections: docToDuplicate.sections.map(duplicateSection),
      createdAt: new Date().toISOString()
    };
    setDocuments([...documents, newDoc]);
    setActiveDocId(newDoc.id);
    showNotification('Document duplicated!');
  };

  const deleteDocument = (docId) => {
    if (documents.length === 1) {
      showNotification('Cannot delete last document');
      return;
    }
    setDocToDelete(docId);
    setShowDeleteDocModal(true);
  };

  const confirmDeleteDocument = () => {
    if (!docToDelete) return;

    const newDocs = documents.filter(d => d.id !== docToDelete);
    setDocuments(newDocs);
    
    if (activeDocId === docToDelete) {
      setActiveDocId(newDocs[0].id);
      setSelectedSectionId(null);
    }
    
    showNotification('Document deleted');
    setShowDeleteDocModal(false);
    setDocToDelete(null);
  };

  const renameDocument = (docId, newName) => {
    setDocuments(docs => docs.map(doc =>
      doc.id === docId ? { ...doc, name: newName } : doc
    ));
  };

  return {
    documents,
    activeDocId,
    addDocument,
    duplicateDocument,
    deleteDocument,
    confirmDeleteDocument,
    renameDocument,
    setActiveDocId
  };
};