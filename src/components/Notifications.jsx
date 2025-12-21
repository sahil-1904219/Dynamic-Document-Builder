
import { Plus, Trash2, GripVertical, Eye, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight } from 'lucide-react';
const Notification = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 text-sm">
      <span className="mr-2">✓</span>
      {message}
    </div>
  );
};



export default Notification;