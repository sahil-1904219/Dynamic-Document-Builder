import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Upload, FileText, X, File, FileJson, FileCode, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

// ==================== UTILITIES ====================
export const generateId = () => `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

export const generateMarkdown = (hierarchy, level = 1) => {
  let markdown = '';
  
  const processSection = (section, currentLevel) => {
    const heading = '#'.repeat(currentLevel);
    markdown += `${heading} ${section.name || 'Untitled Section'}\n\n`;
    
    if (section.details && section.details.trim()) {
      markdown += `${section.details}\n\n`;
    }
    
    if (section.images && section.images.length > 0) {
      section.images.forEach((img, idx) => {
        markdown += `![Image ${idx + 1}](${img.file.name})\n\n`;
      });
    }
    
    if (section.children && section.children.length > 0) {
      section.children.forEach(child => processSection(child, currentLevel + 1));
    }
  };
  
  hierarchy.forEach(section => processSection(section, level));
  return markdown;
};

export const generateMetadata = (hierarchy) => {
  const countSections = (nodes) => {
    let count = nodes.length;
    nodes.forEach(node => {
      if (node.children) count += countSections(node.children);
    });
    return count;
  };

  const buildTree = (nodes) => {
    return nodes.map(node => ({
      id: node.id,
      name: node.name,
      details: node.details || '',
      imageCount: node.images ? node.images.length : 0,
      children: node.children ? buildTree(node.children) : []
    }));
  };

  return {
    totalSections: countSections(hierarchy),
    generatedAt: new Date().toISOString(),
    hierarchy: buildTree(hierarchy)
  };
};

export const generatePDF = (hierarchy) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Document</title>
      <style>
        @page { margin: 2cm; }
        body { 
          font-family: 'Times New Roman', Times, serif; 
          max-width: 210mm; 
          margin: 0 auto; 
          padding: 20px; 
          line-height: 1.6; 
          color: #000;
          background: white;
        }
        h1 { 
          font-size: 24pt; 
          margin-top: 40px; 
          margin-bottom: 20px; 
          text-align: center;
          font-weight: bold;
          page-break-after: avoid;
        }
        h2 { 
          font-size: 20pt; 
          margin-top: 30px; 
          margin-bottom: 16px; 
          font-weight: bold;
          page-break-after: avoid;
        }
        h3 { 
          font-size: 16pt; 
          margin-top: 25px; 
          margin-bottom: 14px; 
          font-weight: bold;
          page-break-after: avoid;
        }
        h4 { 
          font-size: 14pt; 
          margin-top: 20px; 
          margin-bottom: 12px; 
          font-weight: bold;
          page-break-after: avoid;
        }
        .details {
          text-align: justify;
          margin: 20px 0;
          white-space: pre-wrap;
          line-height: 1.8;
          page-break-inside: avoid;
        }
        .images {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .image-item {
          margin: 20px 0;
          text-align: center;
        }
        .image-item img { 
          max-width: 500px;
          width: 100%;
          height: auto; 
          border: 1px solid #000;
        }
        .image-caption {
          margin-top: 8px;
          font-style: italic;
          font-size: 11pt;
        }
        .section { 
          margin-bottom: 40px; 
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
  `;
  
  const renderSection = (section, level = 1) => {
    const tag = `h${Math.min(level, 6)}`;
    
    html += `<div class="section">`;
    html += `<${tag}>${section.name || 'Untitled Section'}</${tag}>`;
    
    if (section.details && section.details.trim()) {
      html += `<div class="details">${section.details}</div>`;
    }
    
    if (section.images && section.images.length > 0) {
      html += `<div class="images">`;
      section.images.forEach((img, idx) => {
        const label = String.fromCharCode(65 + idx);
        html += `<div class="image-item">`;
        html += `<img src="${img.preview}" alt="${section.name} - Image ${label}" />`;
        html += `<div class="image-caption">Figure ${label}: ${section.name}</div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }
    
    if (section.children && section.children.length > 0) {
      section.children.forEach(child => renderSection(child, level + 1));
    }
    
    html += `</div>`;
  };
  
  hierarchy.forEach(section => renderSection(section, 1));
  html += `</body></html>`;
  
  return html;
};

export const parseMarkdown = (content) => {
  const lines = content.split('\n');
  const parsedSections = [];
  const sectionStack = [];
  let currentSection = null;
  let detailsBuffer = [];

  lines.forEach((line) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      if (currentSection && detailsBuffer.length > 0) {
        currentSection.details = detailsBuffer.join('\n').trim();
        detailsBuffer = [];
      }
      
      const level = headingMatch[1].length;
      const name = headingMatch[2];
      
      const section = {
        id: generateId(),
        name,
        parentId: null,
        images: [],
        details: '',
        expanded: true
      };

      while (sectionStack.length >= level) {
        sectionStack.pop();
      }

      if (sectionStack.length > 0) {
        section.parentId = sectionStack[sectionStack.length - 1].id;
      }

      sectionStack.push(section);
      parsedSections.push(section);
      currentSection = section;
    } else if (currentSection && line.trim() && !line.match(/^!\[.*\]\(.*\)$/)) {
      detailsBuffer.push(line);
    }
  });

  if (currentSection && detailsBuffer.length > 0) {
    currentSection.details = detailsBuffer.join('\n').trim();
  }

  return parsedSections;
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

// ==================== COMPONENTS ====================



