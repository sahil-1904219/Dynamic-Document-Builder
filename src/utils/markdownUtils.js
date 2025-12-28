

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
  console.log(markdown,generateId);
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