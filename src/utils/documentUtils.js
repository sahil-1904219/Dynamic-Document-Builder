export const generateId = () => `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


export const generateMarkdown = (sections) => {
  const hierarchy = buildHierarchy(sections);
  let markdown = '';

  const processSection = (section, level) => {
    // Add heading   
    const heading = '#'.repeat(level);
    markdown += `${heading} ${section.name}\n\n`;

    // Handle image position
    const imagePosition = section.imagePosition || 'below';

    // Images ABOVE content
    if (imagePosition === 'above' && section.images && section.images.length > 0) {
      section.images.forEach((img) => {
        markdown += `![${img.label}](${img.preview})\n\n`;
      });
    }

    // Add content
    if (section.content) {
      markdown += `${section.content}\n\n`;
    }

    // Images BELOW content (default)
    if (imagePosition === 'below' && section.images && section.images.length > 0) {
      section.images.forEach((img) => {
        markdown += `![${img.label}](${img.preview})\n\n`;
      });
    }

    // Process children/subsections recursively
    if (section.children && section.children.length > 0) {
      section.children.forEach(child => processSection(child, level + 1));
    }
  };

  hierarchy.forEach(section => processSection(section, 1));
  return markdown.trim();
};

export const generateMetadata = (sections) => {
  const hierarchy = buildHierarchy(sections);

  const buildMetadataTree = (section) => {
    const tree = {
      id: section.id,
      name: section.name,
      content: section.content || '', // Include content in metadata
      fontSize: section.fontSize || '16',
      imagePosition: section.imagePosition || 'below',
      hasContent: !!(section.content && section.content.trim()),
      wordCount: countWords(section.content || ''),
      characterCount: countCharacters(section.content || ''),
      imageCount: section.images ? section.images.length : 0,
      images: section.images ? section.images.map(img => ({
        label: img.label,
        filename: `${img.label.replace(/\s+/g, '_')}.png`,
        type: img.file.type,
        base64Data: img.preview // Full base64 data URI for preservation
      })) : []
    };

    if (section.children && section.children.length > 0) {
      tree.subsections = section.children.map(child => buildMetadataTree(child));
    }

    return tree;
  };

  // Calculate statistics
  const totalImages = sections.reduce((sum, s) => sum + (s.images?.length || 0), 0);
  const totalWords = sections.reduce((sum, s) => sum + countWords(s.content || ''), 0);
  const totalCharacters = sections.reduce((sum, s) => sum + countCharacters(s.content || ''), 0);

  const metadata = {
    documentInfo: {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      totalSections: sections.length,
      topLevelSections: hierarchy.length,
      totalImages: totalImages,
      totalWords: totalWords,
      totalCharacters: totalCharacters
    },
    hierarchy: hierarchy.map(section => buildMetadataTree(section)),
    imageReferences: sections.flatMap(s =>
      s.images ? s.images.map(img => ({
        sectionId: s.id,
        sectionName: s.name,
        label: img.label,
        filename: `${img.label.replace(/\s+/g, '_')}.png`,
        type: img.file.type,
        base64Data: img.preview
      })) : []
    ),
    sectionsList: sections.map(s => ({
      id: s.id,
      name: s.name || 'Untitled',
      parentId: s.parentId || null,
      depth: s.parentId ? (sections.find(p => p.id === s.parentId)?.parentId ? 2 : 1) : 0,
      hasContent: !!(s.content && s.content.trim()),
      imageCount: s.images ? s.images.length : 0
    }))
  };

  return metadata;
};

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const validateSectionsForExport = (sections, isSectionValid) => {
  const invalidSections = sections.filter(s => !isSectionValid(s));

  if (invalidSections.length > 0) {
    const displayNames = invalidSections.map((s, idx) => {
      // NEW: More specific error message
      if (s.content || (s.images && s.images.length > 0)) {
        return `Section ${idx + 1}: Has content/images but missing heading`;
      }
      return `Section ${idx + 1}: Empty section (heading required)`;
    });

    return {
      valid: false,
      message: `Please add headings to these sections before exporting:\n• ${displayNames.join('\n• ')}`
    };
  }

  return { valid: true };
};


export const countWords = (text) => {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
};

export const countCharacters = (text) => {
  return text.length;
};


export const buildHierarchy = (sections) => {
  const sectionMap = {};
  const hierarchy = [];

  sections.forEach(section => {
    sectionMap[section.id] = { ...section, children: [] };
  });

  sections.forEach(section => {
    if (section.parentId && sectionMap[section.parentId]) {
      sectionMap[section.parentId].children.push(sectionMap[section.id]);
    } else if (!section.parentId) {
      hierarchy.push(sectionMap[section.id]);
    }
  });

  return hierarchy;
};