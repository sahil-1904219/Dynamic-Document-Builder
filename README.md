# Dynamic Document Builder

Live demo: [https://sahil-1904219.github.io/Dynamic-Document-Builder/](https://sahil-1904219.github.io/Dynamic-Document-Builder/)

A small, focused React app that lets users create structured documents with dynamic sections, subsections, images, and export to Markdown + metadata JSON. Designed to be simple, responsive, and easy to extend.

---

## Quick links

* Live site: [https://sahil-1904219.github.io/Dynamic-Document-Builder/](https://sahil-1904219.github.io/Dynamic-Document-Builder/)

---

## Getting started (run locally)

1. Clone the repo

```bash
git clone <your-repo-url>
cd Dynamic-Document-Builder
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Start the dev server

```bash
npm start
# or
yarn start
```

## What this project contains (overview)

This app implements a dynamic section editor where:

* Users can add/remove sections and subsections (via a parentId-based hierarchy).
* Upload PNG/JPG images per section (images are stored as base64 previews in the UI and included in exports).
* Real-time preview (split view) and full preview modes.
* Export as `output.md` (markdown with embedded images) and `metadata.json` (tree + stats + image references).
* Load a previously exported Markdown (.md) or metadata JSON (.json) to repopulate the editor.

---

## Design choices

* **Framework**: React (v18.3.1) — chosen for component-based UI and easy state composition.

* **Styling**: Tailwind CSS (v3.4.1) with PostCSS (v8.4.35) and Autoprefixer (v10.4.17).

* **Editors**: TipTap (v3.14.0) for rich text handling and `react-quill` (v2.0.0) where lightweight editing is sufficient.

* **Routing**: `react-router-dom` (v7.11.0) for client-side routing.

* **Icons**: `lucide-react` (v0.263.1) for clean, accessible icons.

* **Build tooling**: `react-scripts` (v5.0.1) via Create React App.

* **Deployment**: GitHub Pages using `gh-pages` (v6.3.0).

* **Hierarchy management**: Keep sections in a *flat array* where each section has a `parentId` (or `null` for top-level). A `buildHierarchy(sections)` utility converts the flat array into a nested tree when needed (preview, export, metadata generation).

* **Markdown & metadata generation**:

  * `generateMarkdown(sections)` builds a heading hierarchy (`#`, `##`, `###`, ...) by walking the nested tree and embeds images as data URIs so the markdown is self-contained.
  * `generateMetadata(sections)` returns JSON with document statistics (total words, characters, images), the hierarchical tree, and image references (filename, MIME type, base64).

* **Image handling**: Images are read client-side via the FileReader API and stored as base64 `data:` URIs inside the section objects. This simplifies export (images embedded in markdown and metadata) and allows the app to be purely client-side.

* **Validation**: Headings are required for export. Content and images are optional but the app warns the user if a section contains content/images but no heading.

* **UX decisions**: split preview, undo/redo (history snapshotting), and inline document tabs for multiple documents.

---

## Hierarchy approach (flat → tree)

The document hierarchy is managed using a **flat data structure with parent references**, which is later transformed into a nested tree only when required.

**Flat structure (single source of truth):**

```
[
  { id: 1, title: "Introduction", parentId: null },
  { id: 2, title: "Overview",     parentId: 1 },
  { id: 3, title: "Details",      parentId: 1 },
  { id: 4, title: "Conclusion",   parentId: null }
]
```

**Converted hierarchical structure (used for preview & export):**

```
Introduction
├── Overview
└── Details

Conclusion
```

**Conversion logic:**

1. All sections are stored in a flat array with `id` and `parentId`
2. A lookup map (`id → section`) is created
3. Each section is attached to its parent’s `children` array
4. Sections with `parentId = null` become root nodes
5. The resulting tree is traversed recursively to:

   * Assign correct heading levels (`#`, `##`, `###`, …)
   * Maintain parent–child ordering
   * Generate Markdown and metadata outputs

## Assumptions

* A section **must have a heading** to be considered valid; sections without headings are not allowed.
* **Duplicate section names are allowed**, as each section is uniquely identified internally using an `id`.
* A maximum of **5 levels of subsections** (sub-sections of sub-sections) can be added to maintain readability and usability.
* Each section can contain a maximum of **9 images**.
* Images are by default rendered **below the content area by default** to keep text flow consistent and predictable.


---

## Project structure (important files)

```
src/
├── components/
│   ├── DynamicDocumentBuilder.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   ├── sections/
│   │   └── SectionEditor.jsx
│   ├── images/
│   │   └── ImageGallery.jsx
│   ├── documents/
│   │   ├── DocumentTabs.jsx
│   │   └── Preview.jsx
│   ├── modals/
│   │   ├── SidebarSection.jsx
│   │   ├── DownloadModal.jsx
│   │   ├── DeleteModal.jsx
│   │   ├── ValidateModal.jsx
│   │   └── Notification.jsx
├── context/
│   └── DocumentContext.jsx
├── hooks/
│   ├── useDocuments.js
│   ├── useSections.js
│   ├── useHistory.js
│   ├── useImageManagement.js
│   └── useResizable.js
└── utils/
    ├── documentUtils.js
    └── markdownUtils.js
```



