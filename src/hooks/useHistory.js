import { useDocumentContext } from '../context/DocumentContext';

export const useHistory = () => {
  const { 
    history, 
    historyIndex, 
    setHistoryIndex, 
    setDocuments, 
    activeDocId 
  } = useDocumentContext();

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = history[newIndex];
      setDocuments(docs => docs.map(doc =>
        doc.id === activeDocId ? { ...doc, sections: previousState } : doc
      ));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setDocuments(docs => docs.map(doc =>
        doc.id === activeDocId ? { ...doc, sections: nextState } : doc
      ));
    }
  };

  return { 
    undo, 
    redo, 
    canUndo: historyIndex > 0, 
    canRedo: historyIndex < history.length - 1 
  };
};