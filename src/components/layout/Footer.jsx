import React from 'react';

export const Footer = ({ 
  sectionsCount, 
  selectedSection, 
  totalChars, 
  totalWords, 
  autoSaveStatus, 
  darkMode 
}) => {
  return (
    <div className={`border-t ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} flex-shrink-0`}>
      <div className="px-6 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center">
          <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
            {sectionsCount} section{sectionsCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {selectedSection ? (
            <>
              <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                {totalChars} characters
              </span>
              <span className={darkMode ? 'text-slate-500' : 'text-gray-400'}>•</span>
              <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                {totalWords} words
              </span>
            </>
          ) : (
            <span className={darkMode ? 'text-slate-500' : 'text-gray-400'}>
              No section selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${autoSaveStatus === 'Saving...' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>{autoSaveStatus}</span>
        </div>
      </div>
    </div>
  );
};