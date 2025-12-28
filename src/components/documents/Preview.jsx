import { buildHierarchy } from "../../utils/documentUtils";
import { renderMarkdown } from "../../utils/markdownUtils";
import { FileText, Moon, Sun, Eye, Maximize2, X } from 'lucide-react';
export const Preview = ({ sections, darkMode, activeDoc }) => {
    const hierarchy = buildHierarchy(sections);


    const renderPreviewSection = (section, level = 1) => {
        const HeadingTag = `h${Math.min(level, 6)}`;

        // DEFAULT imagePosition to 'below' if not set
        const imagePosition = section.imagePosition || 'below';

        return (
            <div key={section.id} className="mb-6">
                <div
                    className={`p-6 rounded-lg transition-all border ${darkMode ? 'border-slate-700 bg-slate-800 bg-opacity-30' : 'border-gray-200 bg-gray-50'
                        }`}
                    style={{ marginLeft: `${(level - 1) * 24}px` }}
                >
                    {section.name && (
                        <HeadingTag
                            className={`font-bold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}
                            style={{
                                fontSize: level === 1 ? '2rem' : level === 2 ? '1.5rem' : level === 3 ? '1.25rem' : '1rem'
                            }}
                        >
                            {section.name}
                        </HeadingTag>
                    )}

                    {/* IMAGES ABOVE - Check if images exist AND position is above */}
                    {imagePosition === 'above' && section.images && section.images.length > 0 && (
                        <div className="mb-4 grid grid-cols-3 gap-4">
                            {section.images.map((img, idx) => (
                                <div key={idx} className={`border-2 rounded-lg overflow-hidden ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                                    <img src={img.preview} alt={img.label} className="w-full h-32 object-cover" />
                                    <div className={`px-3 py-2 text-sm font-medium text-center ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {img.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {section.content && (
                        <div
                            className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                            style={{ fontSize: `${section.fontSize || 16}px` }}
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
                        />
                    )}

                    {/* IMAGES BELOW - This is the default, so check for 'below' OR undefined */}
                    {(imagePosition === 'below' || !imagePosition) && section.images && section.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {section.images.map((img, idx) => (
                                <div key={idx} className={`border-2 rounded-lg overflow-hidden ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                                    <img src={img.preview} alt={img.label} className="w-full h-32 object-cover" />
                                    <div className={`px-3 py-2 text-sm font-medium text-center ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {img.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {section.children && section.children.length > 0 && (
                    <div className="mt-2">
                        {section.children.map((child) => renderPreviewSection(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };
    if (sections.length === 0) {
        return (
            <div className={`flex items-center justify-center h-full ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <div className="text-center">
                    <FileText size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No content to preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-full overflow-y-auto p-8 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
            <div className={`max-w-4xl mx-auto p-8 rounded-xl border-2 shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
                }`}>
                {/* <h1 className="text-4xl font-bold mb-8 text-center text-indigo-600">
          {activeDoc?.name || 'Document Preview'}
        </h1> */}

                <h1 className="text-4xl font-bold mb-8 text-center text-slate-800" style={{ color: darkMode ? '#e2e8f0' : '#1e3a8a' }}> {activeDoc?.name || 'Document Preview'} </h1>
                {hierarchy.map((section) => renderPreviewSection(section, 1))}
            </div>
        </div>
    );
};
