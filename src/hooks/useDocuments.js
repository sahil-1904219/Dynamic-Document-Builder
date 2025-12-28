// Functions: addDocument, duplicateDocument, deleteDocument, confirmDeleteDocument, renameDocument

import { useDocumentContext } from '../context/DocumentContext';

export const useDocuments = () => {
  const { documents, setDocuments, activeDocId, setActiveDocId, 
          setSelectedSectionId, showNotification } = useDocumentContext();

  // PASTE Lines 68-95 (addDocument)
  // PASTE Lines 97-120 (duplicateDocument)
  // PASTE Lines 122-135 (deleteDocument, confirmDeleteDocument, renameDocument)

  return { addDocument, duplicateDocument, deleteDocument, 
           confirmDeleteDocument, renameDocument };
};