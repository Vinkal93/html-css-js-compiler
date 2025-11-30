import { create } from 'zustand';
import { getTemplate, getLanguageFromExtension } from '@/utils/fileTemplates';

// File node interface for tree structure
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; // Only for files
  language?: string; // html, css, javascript, json, markdown, plaintext
  children?: FileNode[]; // Only for folders
  parentId?: string | null;
  createdAt: Date;
  modifiedAt: Date;
  isModified?: boolean; // Track unsaved changes
}

export type ThemeType = 'dark' | 'light' | 'neon';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type EditorMode = 'practice' | 'expert';

interface EditorState {
  // File System
  fileTree: FileNode[];
  openFiles: string[]; // Array of file IDs
  activeFileId: string | null;
  expandedFolders: Set<string>; // Track which folders are expanded
  searchQuery: string;
  mainHtmlFileId: string | null; // Main HTML file for preview

  // Editor Settings
  editorMode: EditorMode;
  zoomLevel: number; // 50-200
  theme: ThemeType;
  fontSize: number; // Calculated from zoomLevel

  // UI State
  previewOpen: boolean;
  sidebarOpen: boolean;
  deviceView: DeviceType;

  // Actions - File Management
  createFile: (name: string, fileType: string, parentId?: string | null) => string | null;
  createFolder: (name: string, parentId?: string | null) => string | null;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => boolean;
  moveNode: (nodeId: string, newParentId: string | null) => boolean;
  duplicateFile: (id: string) => string | null;
  updateFileContent: (id: string, content: string) => void;

  // Actions - File Operations
  openFile: (id: string) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  toggleFolder: (id: string) => void;
  setMainHtmlFile: (id: string) => void;

  // Actions - Search & Navigation
  setSearchQuery: (query: string) => void;
  getFileById: (id: string) => FileNode | null;
  getFilteredTree: () => FileNode[];

  // Actions - Editor Settings
  setEditorMode: (mode: EditorMode) => void;
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Actions - UI State
  setTheme: (theme: ThemeType) => void;
  togglePreview: () => void;
  toggleSidebar: () => void;
  setDeviceView: (device: DeviceType) => void;

  // Utility
  resetFiles: () => void;
}

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Default file structure
const createDefaultFileTree = (): FileNode[] => {
  const now = new Date();
  const rootId = generateId();
  const htmlId = generateId();
  const cssId = generateId();
  const jsId = generateId();
  const readmeId = generateId();

  return [
    {
      id: rootId,
      name: 'project',
      type: 'folder',
      parentId: null,
      createdAt: now,
      modifiedAt: now,
      children: [
        {
          id: htmlId,
          name: 'index.html',
          type: 'file',
          content: getTemplate('html'),
          language: 'html',
          parentId: rootId,
          createdAt: now,
          modifiedAt: now,
          isModified: false,
        },
        {
          id: cssId,
          name: 'style.css',
          type: 'file',
          content: getTemplate('css'),
          language: 'css',
          parentId: rootId,
          createdAt: now,
          modifiedAt: now,
          isModified: false,
        },
        {
          id: jsId,
          name: 'script.js',
          type: 'file',
          content: getTemplate('javascript'),
          language: 'javascript',
          parentId: rootId,
          createdAt: now,
          modifiedAt: now,
          isModified: false,
        },
        {
          id: readmeId,
          name: 'README.md',
          type: 'file',
          content: getTemplate('markdown'),
          language: 'markdown',
          parentId: rootId,
          createdAt: now,
          modifiedAt: now,
          isModified: false,
        },
      ],
    },
  ];
};

// Helper function to find node in tree
const findNodeInTree = (tree: FileNode[], id: string): FileNode | null => {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to update node in tree
const updateNodeInTree = (tree: FileNode[], id: string, updates: Partial<FileNode>): FileNode[] => {
  return tree.map(node => {
    if (node.id === id) {
      return { ...node, ...updates, modifiedAt: new Date() };
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeInTree(node.children, id, updates),
      };
    }
    return node;
  });
};

// Helper function to delete node from tree
const deleteNodeFromTree = (tree: FileNode[], id: string): FileNode[] => {
  return tree.filter(node => {
    if (node.id === id) return false;
    if (node.children) {
      node.children = deleteNodeFromTree(node.children, id);
    }
    return true;
  });
};

// Helper function to add node to tree
const addNodeToTree = (tree: FileNode[], node: FileNode, parentId: string | null): FileNode[] => {
  if (parentId === null) {
    return [...tree, node];
  }

  return tree.map(n => {
    if (n.id === parentId && n.type === 'folder') {
      return {
        ...n,
        children: [...(n.children || []), node],
      };
    }
    if (n.children) {
      return {
        ...n,
        children: addNodeToTree(n.children, node, parentId),
      };
    }
    return n;
  });
};

// Calculate font size from zoom level
const calculateFontSize = (zoomLevel: number): number => {
  return Math.round(14 * (zoomLevel / 100));
};

export const useEditorStore = create<EditorState>((set, get) => {
  const defaultTree = createDefaultFileTree();
  const firstHtmlFile = findNodeInTree(defaultTree, defaultTree[0].children![0].id);

  return {
    // Initial state
    fileTree: defaultTree,
    openFiles: [defaultTree[0].children![0].id], // Open index.html by default
    activeFileId: defaultTree[0].children![0].id,
    expandedFolders: new Set([defaultTree[0].id]), // Expand root folder
    searchQuery: '',
    mainHtmlFileId: defaultTree[0].children![0].id,

    editorMode: 'expert',
    zoomLevel: 100,
    theme: 'dark',
    fontSize: 14,

    previewOpen: true,
    sidebarOpen: true,
    deviceView: 'desktop',

    // File Management Actions
    createFile: (name, fileType, parentId = null) => {
      const id = generateId();
      const now = new Date();
      const language = getLanguageFromExtension(name);
      const content = getTemplate(fileType);

      const newFile: FileNode = {
        id,
        name,
        type: 'file',
        content,
        language,
        parentId,
        createdAt: now,
        modifiedAt: now,
        isModified: false,
      };

      set(state => ({
        fileTree: addNodeToTree(state.fileTree, newFile, parentId),
      }));

      return id;
    },

    createFolder: (name, parentId = null) => {
      const id = generateId();
      const now = new Date();

      const newFolder: FileNode = {
        id,
        name,
        type: 'folder',
        children: [],
        parentId,
        createdAt: now,
        modifiedAt: now,
      };

      set(state => ({
        fileTree: addNodeToTree(state.fileTree, newFolder, parentId),
        expandedFolders: new Set([...state.expandedFolders, id]),
      }));

      return id;
    },

    deleteNode: (id) => {
      set(state => ({
        fileTree: deleteNodeFromTree(state.fileTree, id),
        openFiles: state.openFiles.filter(fileId => fileId !== id),
        activeFileId: state.activeFileId === id ? (state.openFiles[0] || null) : state.activeFileId,
      }));
    },

    renameNode: (id, newName) => {
      const node = get().getFileById(id);
      if (!node) return false;

      set(state => ({
        fileTree: updateNodeInTree(state.fileTree, id, {
          name: newName,
          language: node.type === 'file' ? getLanguageFromExtension(newName) : undefined,
        }),
      }));

      return true;
    },

    moveNode: (nodeId, newParentId) => {
      const node = get().getFileById(nodeId);
      if (!node) return false;

      // Remove from old location
      let updatedTree = deleteNodeFromTree(get().fileTree, nodeId);

      // Add to new location
      const movedNode = { ...node, parentId: newParentId };
      updatedTree = addNodeToTree(updatedTree, movedNode, newParentId);

      set({ fileTree: updatedTree });
      return true;
    },

    duplicateFile: (id) => {
      const node = get().getFileById(id);
      if (!node || node.type !== 'file') return null;

      const newId = generateId();
      const now = new Date();
      const baseName = node.name.replace(/\.[^/.]+$/, '');
      const ext = node.name.split('.').pop();
      const newName = `${baseName}-copy.${ext}`;

      const duplicatedFile: FileNode = {
        ...node,
        id: newId,
        name: newName,
        createdAt: now,
        modifiedAt: now,
        isModified: false,
      };

      set(state => ({
        fileTree: addNodeToTree(state.fileTree, duplicatedFile, node.parentId || null),
      }));

      return newId;
    },

    updateFileContent: (id, content) => {
      set(state => ({
        fileTree: updateNodeInTree(state.fileTree, id, {
          content,
          isModified: true,
        }),
      }));
    },

    // File Operations
    openFile: (id) => {
      const node = get().getFileById(id);
      if (!node || node.type !== 'file') return;

      set(state => ({
        openFiles: state.openFiles.includes(id) ? state.openFiles : [...state.openFiles, id],
        activeFileId: id,
      }));
    },

    closeFile: (id) => {
      set(state => {
        const newOpenFiles = state.openFiles.filter(fileId => fileId !== id);
        const newActiveFileId = state.activeFileId === id
          ? (newOpenFiles[newOpenFiles.length - 1] || null)
          : state.activeFileId;

        return {
          openFiles: newOpenFiles,
          activeFileId: newActiveFileId,
        };
      });
    },

    setActiveFile: (id) => {
      set({ activeFileId: id });
    },

    toggleFolder: (id) => {
      set(state => {
        const newExpanded = new Set(state.expandedFolders);
        if (newExpanded.has(id)) {
          newExpanded.delete(id);
        } else {
          newExpanded.add(id);
        }
        return { expandedFolders: newExpanded };
      });
    },

    setMainHtmlFile: (id) => {
      set({ mainHtmlFileId: id });
    },

    // Search & Navigation
    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    getFileById: (id) => {
      return findNodeInTree(get().fileTree, id);
    },

    getFilteredTree: () => {
      const { fileTree, searchQuery } = get();
      if (!searchQuery) return fileTree;

      const filterTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(node => {
          if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return true;
          }
          if (node.children) {
            const filteredChildren = filterTree(node.children);
            if (filteredChildren.length > 0) {
              return true;
            }
          }
          return false;
        }).map(node => {
          if (node.children) {
            return {
              ...node,
              children: filterTree(node.children),
            };
          }
          return node;
        });
      };

      return filterTree(fileTree);
    },

    // Editor Settings
    setEditorMode: (mode) => {
      set({ editorMode: mode });
    },

    setZoomLevel: (level) => {
      const clampedLevel = Math.max(50, Math.min(200, level));
      set({
        zoomLevel: clampedLevel,
        fontSize: calculateFontSize(clampedLevel),
      });
    },

    zoomIn: () => {
      const { zoomLevel } = get();
      get().setZoomLevel(zoomLevel + 10);
    },

    zoomOut: () => {
      const { zoomLevel } = get();
      get().setZoomLevel(zoomLevel - 10);
    },

    resetZoom: () => {
      get().setZoomLevel(100);
    },

    // UI State
    setTheme: (theme) => {
      set({ theme });
    },

    togglePreview: () => {
      set(state => ({ previewOpen: !state.previewOpen }));
    },

    toggleSidebar: () => {
      set(state => ({ sidebarOpen: !state.sidebarOpen }));
    },

    setDeviceView: (device) => {
      set({ deviceView: device });
    },

    // Utility
    resetFiles: () => {
      const defaultTree = createDefaultFileTree();
      set({
        fileTree: defaultTree,
        openFiles: [defaultTree[0].children![0].id],
        activeFileId: defaultTree[0].children![0].id,
        expandedFolders: new Set([defaultTree[0].id]),
        mainHtmlFileId: defaultTree[0].children![0].id,
      });
    },
  };
});
