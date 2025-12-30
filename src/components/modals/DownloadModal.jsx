import { X, FileJson, FileCode } from 'lucide-react';


export const DownloadModal = ({ onClose, onDownload, darkMode }) => {
  const downloadOptions = [
    {
      id: 'markdown',
      name: 'Markdown Document',
      description: 'Complete markdown with embedded images',
      icon: <FileCode className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      file: 'output.md'
    },
    {
      id: 'metadata',
      name: 'Metadata File',
      description: 'Hierarchy, statistics & image data',
      icon: <FileJson className="w-6 h-6" />,
      color: 'bg-green-600 hover:bg-green-700',
      file: 'metadata.json'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-3xl w-full p-6`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              Export Document
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Download your document files (images embedded as base64)
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${darkMode ? 'hover:bg-red-600' : 'hover:bg-red-500'} rounded-lg transition-all hover:scale-110`}
          >
            <X size={20} className={`${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-white'} transition-colors`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {downloadOptions.map(option => (
            <button
              key={option.id}
              onClick={() => onDownload(option.id)}
              className={`${option.color} text-white p-8 rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl flex flex-col items-center gap-4 shadow-lg`}
            >
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                {option.icon}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">{option.name}</h3>
                <p className="text-xs opacity-90 mb-2">{option.description}</p>
                <div className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-mono">
                  {option.file}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                About these exports
              </h4>
              <ul className={`text-xs space-y-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <li>• <strong>Markdown</strong>: Contains all content with images embedded as base64</li>
                <li>• <strong>Metadata</strong>: Contains document structure, statistics, and image references</li>
                <li>• Both files together provide complete document preservation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};