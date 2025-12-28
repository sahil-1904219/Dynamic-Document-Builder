import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight, Moon, Sun, Copy, Search, Eye, Maximize2 } from 'lucide-react';

export const ValidationModal = ({ errors, onClose, darkMode }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-lg w-full p-6`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Cannot Export - Incomplete Sections
            </h2>
            <p className={`text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Please complete these sections before exporting:
            </p>
            <ul className={`space-y-2 mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {errors.map((error, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Each section must have a heading. Content and images are optional.
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};