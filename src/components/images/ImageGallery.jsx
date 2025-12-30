import React from 'react';
import { useDocumentContext } from '../../context/DocumentContext';
import { useSections } from '../../hooks/useSections';
import { useImageManagement } from '../../hooks/useImageManagement';

export const ImageGallery = () => {
  const { selectedSection, selectedSectionId, darkMode, swappingIndex } = useDocumentContext();
  const { updateSection } = useSections();
  const { deleteImage, updateImageLabel, swapImagesWithSpring } = useImageManagement();

  if (!selectedSection?.images?.length) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Images
        </label>
        <button
          onClick={() => updateSection(
            selectedSectionId,
            'imagePosition',
            selectedSection.imagePosition === 'above' ? 'below' : 'above'
          )}
          className={`text-xs px-3 py-1 rounded-lg transition-all transform hover:scale-105 ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Position: {selectedSection.imagePosition === 'above' ? 'Above Text' : 'Below Text'}
        </button>
      </div>

      <div className="flex items-center gap-6 flex-wrap mt-6">
        {selectedSection.images.map((img, idx) => {
          const moveLeft = swappingIndex === idx - 1;
          const moveRight = swappingIndex === idx;

          return (
            <React.Fragment key={idx}>
              {/* IMAGE CARD */}
              <div
                className={`relative group transition-transform duration-[420ms] ${moveLeft ? '-translate-x-[110px]' : ''
                  } ${moveRight ? 'translate-x-[110px]' : ''}`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <div className={`border rounded-md overflow-hidden w-[88px] ${darkMode ? 'border-slate-600' : 'border-gray-300'
                  }`}>
                  <img
                    src={img.preview}
                    alt={img.label}
                    className="w-[88px] h-[88px] object-cover"
                  />
                  <input
                    type="text"
                    value={img.label}
                    onChange={(e) => updateImageLabel(idx, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-[10px] text-center py-0.5 w-full border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
                      }`}
                    placeholder="Image label"
                  />
                </div>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => deleteImage(idx)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>

                {/* EDIT BUTTON */}
                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg ${darkMode ? 'bg-slate-800/70 text-slate-200' : 'bg-white/70 text-gray-700'
                      }`}
                  >
                    ✎
                  </div>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const updatedImages = [...selectedSection.images];
                        updatedImages[idx] = {
                          ...updatedImages[idx],
                          file,
                          preview: reader.result,
                        };
                        updateSection(selectedSectionId, 'images', updatedImages);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              {/* SWAP BUTTON */}
              {idx < selectedSection.images.length - 1 && (
                <button
                  onClick={() => swapImagesWithSpring(idx)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition ${darkMode
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  title="Swap images"
                >
                  ⇄
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};