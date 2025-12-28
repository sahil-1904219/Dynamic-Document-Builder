// import { 
//   generateId, 
//   buildHierarchy,           // ✅ ADD THIS
//   generateMarkdown, 
//   generateMetadata, 
//   downloadFile, 
//   validateSectionsForExport, 
//   countWords, 
//   countCharacters 
// } from './documentUtils';



// export const renderMarkdown = (text) => {
//     if (!text) return '';

//     let html = text
//         // Bold
//         .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
//         // Italic
//         .replace(/\_(.+?)\_/g, '<em>$1</em>')
//         // Links
//         .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
//         // Horizontal rule
//         .replace(/^---$/gm, '<hr class="my-4 border-gray-300" />')
//         // Bullet lists
//         .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
//         // Numbered lists
//         .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
//         // Line breaks
//         .replace(/\n/g, '<br />');

//     return html;
// };

// export const parseMarkdownToSections = (markdown) => {
//     const lines = markdown.split('\n');
//     const newSections = [];
//     const sectionStack = []; // Stack to track parent sections by level
//     let currentSection = null;
//     let contentBuffer = ''; // Buffer to accumulate content lines

//     const finalizeSection = () => {
//         if (currentSection) {
//             currentSection.content = contentBuffer.trim();
//             contentBuffer = '';
//         }
//     };

//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i];
//         const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
//         const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

//         if (headingMatch) {
//             // Finalize previous section
//             finalizeSection();

//             const level = headingMatch[1].length;
//             const name = headingMatch[2].trim();

//             // Find correct parent based on level
//             let parentId = null;
//             if (level > 1) {
//                 // Find the most recent section at level-1
//                 for (let j = sectionStack.length - 1; j >= 0; j--) {
//                     if (sectionStack[j].level === level - 1) {
//                         parentId = sectionStack[j].id;
//                         break;
//                     }
//                 }
//             }

//             // Remove sections from stack that are at same or deeper level
//             while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
//                 sectionStack.pop();
//             }

//             currentSection = {
//                 id: generateId(),
//                 name: name,
//                 content: '',
//                 parentId: parentId,
//                 images: [],
//                 expanded: true,
//                 fontSize: '16',
//                 imagePosition: 'below'
//             };

//             newSections.push(currentSection);
//             sectionStack.push({ id: currentSection.id, level: level });

//         } else if (imageMatch && currentSection) {
//             // Image found
//             const label = imageMatch[1] || `Fig ${String.fromCharCode(65 + currentSection.images.length)}`;
//             const imageData = imageMatch[2];

//             // If no content has been added yet, images go above
//             if (!contentBuffer.trim()) {
//                 currentSection.imagePosition = 'above';
//             } else {
//                 // Content exists, so images go below
//                 currentSection.imagePosition = 'below';
//             }

//             currentSection.images.push({
//                 file: {
//                     name: label,
//                     type: imageData.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
//                 },
//                 preview: imageData,
//                 label: label
//             });

//         } else if (currentSection && line.trim()) {
//             // Regular content line
//             if (contentBuffer) {
//                 contentBuffer += '\n';
//             }
//             contentBuffer += line;
//         } else if (currentSection && !line.trim() && contentBuffer) {
//             // Preserve empty lines within content
//             contentBuffer += '\n';
//         }
//     }

//     // Finalize last section
//     finalizeSection();

//     setSections(newSections);
//     if (newSections.length > 0) {
//         setSelectedSectionId(newSections[0].id);
//     }

//     const totalImages = newSections.reduce((sum, s) => sum + (s.images?.length || 0), 0);
//     const totalWords = newSections.reduce((sum, s) => sum + countWords(s.content || ''), 0);
//     showNotification(`Loaded ${newSections.length} sections, ${totalImages} images, ${totalWords} words!`);
// };


// export const parseJsonToSections = (metadata) => {
//     if (!metadata.hierarchy || !Array.isArray(metadata.hierarchy)) {
//         showNotification('Invalid metadata structure');
//         return;
//     }

//     const newSections = [];

//     // Recursive function to process hierarchy
//     const processHierarchyNode = (node, parentId = null) => {
//         // Create the current section
//         const section = {
//             id: generateId(),
//             name: node.name || '',
//             content: node.content || '',
//             parentId: parentId,
//             images: [],
//             expanded: true,
//             fontSize: node.fontSize || '16',
//             imagePosition: node.imagePosition || 'below'
//         };

//         // Process images if they exist
//         if (node.images && Array.isArray(node.images)) {
//             section.images = node.images.map(img => ({
//                 file: {
//                     name: img.filename || img.label,
//                     type: img.type || 'image/png'
//                 },
//                 preview: img.base64Data,
//                 label: img.label
//             }));
//         }

//         // Add this section to the flat list
//         newSections.push(section);

//         // Process subsections recursively, passing THIS section's ID as parent
//         if (node.subsections && Array.isArray(node.subsections)) {
//             node.subsections.forEach(child => {
//                 processHierarchyNode(child, section.id);
//             });
//         }

//         return section.id;
//     };

//     // Process all top-level sections (they have no parent)
//     metadata.hierarchy.forEach(topLevelNode => {
//         processHierarchyNode(topLevelNode, null);
//     });

//     setSections(newSections);
//     if (newSections.length > 0) {
//         setSelectedSectionId(newSections[0].id);
//     }

//     const totalImages = newSections.reduce((sum, s) => sum + (s.images?.length || 0), 0);
//     const totalWords = newSections.reduce((sum, s) => sum + countWords(s.content || ''), 0);
//     showNotification(`Loaded ${newSections.length} sections, ${totalImages} images, ${totalWords} words from metadata!`);
// };


// ==================== MARKDOWN UTILITIES ====================

export const renderMarkdown = (text) => {
  if (!text) return '';

  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\_(.+?)\_/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^---$/gm, '<hr class="my-4 border-gray-300" />')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n/g, '<br />');

  return html;
};

export const parseMarkdownToSections = (markdown, generateId) => {
  const lines = markdown.split('\n');
  const newSections = [];
  const sectionStack = [];
  let currentSection = null;
  let contentBuffer = '';

  const finalizeSection = () => {
    if (currentSection) {
      currentSection.content = contentBuffer.trim();
      contentBuffer = '';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (headingMatch) {
      finalizeSection();

      const level = headingMatch[1].length;
      const name = headingMatch[2].trim();

      let parentId = null;
      if (level > 1) {
        for (let j = sectionStack.length - 1; j >= 0; j--) {
          if (sectionStack[j].level === level - 1) {
            parentId = sectionStack[j].id;
            break;
          }
        }
      }

      while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
        sectionStack.pop();
      }

      currentSection = {
        id: generateId(),
        name: name,
        content: '',
        parentId: parentId,
        images: [],
        expanded: true,
        fontSize: '16',
        imagePosition: 'below'
      };

      newSections.push(currentSection);
      sectionStack.push({ id: currentSection.id, level: level });

    } else if (imageMatch && currentSection) {
      const label = imageMatch[1] || `Fig ${String.fromCharCode(65 + currentSection.images.length)}`;
      const imageData = imageMatch[2];

      if (!contentBuffer.trim()) {
        currentSection.imagePosition = 'above';
      } else {
        currentSection.imagePosition = 'below';
      }

      currentSection.images.push({
        file: {
          name: label,
          type: imageData.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
        },
        preview: imageData,
        label: label
      });

    } else if (currentSection && line.trim()) {
      if (contentBuffer) {
        contentBuffer += '\n';
      }
      contentBuffer += line;
    } else if (currentSection && !line.trim() && contentBuffer) {
      contentBuffer += '\n';
    }
  }

  finalizeSection();
  
  // Return data object instead of setting state
  return {
    sections: newSections,
    stats: {
      totalImages: newSections.reduce((sum, s) => sum + (s.images?.length || 0), 0),
      totalWords: newSections.reduce((sum, s) => {
        const text = s.content || '';
        return sum + (text.trim() ? text.trim().split(/\s+/).length : 0);
      }, 0)
    }
  };
};

export const parseJsonToSections = (metadata, generateId) => {
  if (!metadata.hierarchy || !Array.isArray(metadata.hierarchy)) {
    throw new Error('Invalid metadata structure');
  }

  const newSections = [];

  const processHierarchyNode = (node, parentId = null) => {
    const section = {
      id: generateId(),
      name: node.name || '',
      content: node.content || '',
      parentId: parentId,
      images: [],
      expanded: true,
      fontSize: node.fontSize || '16',
      imagePosition: node.imagePosition || 'below'
    };

    if (node.images && Array.isArray(node.images)) {
      section.images = node.images.map(img => ({
        file: {
          name: img.filename || img.label,
          type: img.type || 'image/png'
        },
        preview: img.base64Data,
        label: img.label
      }));
    }

    newSections.push(section);

    if (node.subsections && Array.isArray(node.subsections)) {
      node.subsections.forEach(child => {
        processHierarchyNode(child, section.id);
      });
    }

    return section.id;
  };

  metadata.hierarchy.forEach(topLevelNode => {
    processHierarchyNode(topLevelNode, null);
  });

  // Return data object instead of setting state
  return {
    sections: newSections,
    stats: {
      totalImages: newSections.reduce((sum, s) => sum + (s.images?.length || 0), 0),
      totalWords: newSections.reduce((sum, s) => {
        const text = s.content || '';
        return sum + (text.trim() ? text.trim().split(/\s+/).length : 0);
      }, 0)
    }
  };
};