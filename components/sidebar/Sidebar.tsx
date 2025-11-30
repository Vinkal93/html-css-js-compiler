"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import {
    ChevronLeft,
    ChevronRight,
    FilePlus,
    FolderPlus,
    Search,
    X,
    Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileTree } from "./FileTree";
import { FileDialog } from "./FileDialog";
import { FolderDialog } from "./FolderDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { FileUpload } from "./FileUpload";
import { ContextMenu } from "./ContextMenu";

export function Sidebar() {
    const {
        sidebarOpen,
        toggleSidebar,
        getFilteredTree,
        searchQuery,
        setSearchQuery,
        openFile,
        createFile,
        createFolder,
        deleteNode,
        renameNode,
        duplicateFile,
        setMainHtmlFile,
        getFileById,
    } = useEditorStore();

    const [fileDialogOpen, setFileDialogOpen] = useState(false);
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [blankAreaContextMenu, setBlankAreaContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const filteredTree = getFilteredTree();

    const handleNewFile = (parentId?: string) => {
        setSelectedParentId(parentId || null);
        setFileDialogOpen(true);
    };

    const handleNewFolder = (parentId?: string) => {
        setSelectedParentId(parentId || null);
        setFolderDialogOpen(true);
    };

    const handleCreateFile = (name: string, fileType: string) => {
        createFile(name, fileType, selectedParentId);
    };

    const handleCreateFolder = (name: string) => {
        createFolder(name, selectedParentId);
    };

    const handleRename = (id: string) => {
        const node = getFileById(id);
        if (node) {
            setSelectedNodeId(id);
            setNewName(node.name);
            setRenameDialogOpen(true);
        }
    };

    const handleConfirmRename = () => {
        if (selectedNodeId && newName.trim()) {
            renameNode(selectedNodeId, newName.trim());
            setRenameDialogOpen(false);
            setSelectedNodeId(null);
            setNewName('');
        }
    };

    const handleDelete = (id: string) => {
        setSelectedNodeId(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedNodeId) {
            deleteNode(selectedNodeId);
        }
    };

    const handleDuplicate = (id: string) => {
        const newId = duplicateFile(id);
        if (newId) {
            openFile(newId);
        }
    };

    const getParentFolderName = () => {
        if (!selectedParentId) return 'Root';
        const parent = getFileById(selectedParentId);
        return parent?.name || 'Root';
    };

    const getDeleteItemInfo = () => {
        if (!selectedNodeId) return { name: '', type: 'file' as const, count: 0 };
        const node = getFileById(selectedNodeId);
        if (!node) return { name: '', type: 'file' as const, count: 0 };

        const count = node.type === 'folder' && node.children ? node.children.length : 0;
        return { name: node.name, type: node.type, count };
    };

    // Drag and drop handlers for file upload
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);

        const files = Array.from(e.dataTransfer.files);

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                const language = file.name.split('.').pop() || 'plaintext';
                createFile(file.name, language, null);

                // Update content after creation
                setTimeout(() => {
                    const { fileTree, updateFileContent } = useEditorStore.getState();
                    const getAllFiles = (nodes: any[]): any[] => {
                        let allFiles: any[] = [];
                        nodes.forEach(node => {
                            if (node.type === 'file') allFiles.push(node);
                            else if (node.children) allFiles = allFiles.concat(getAllFiles(node.children));
                        });
                        return allFiles;
                    };
                    const allFiles = getAllFiles(fileTree);
                    const newFile = allFiles.find(f => f.name === file.name);
                    if (newFile) {
                        updateFileContent(newFile.id, content);
                    }
                }, 100);
            };
            reader.readAsText(file);
        }
    };

    // Blank area context menu handler
    const handleBlankAreaContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setBlankAreaContextMenu({ x: e.clientX, y: e.clientY });
    };

    const blankAreaMenuItems = [
        {
            label: 'New File',
            icon: <FilePlus className="w-4 h-4" />,
            onClick: () => {
                setBlankAreaContextMenu(null);
                handleNewFile();
            }
        },
        {
            label: 'New Folder',
            icon: <FolderPlus className="w-4 h-4" />,
            onClick: () => {
                setBlankAreaContextMenu(null);
                handleNewFolder();
            }
        },
        {
            label: 'Upload Files',
            icon: <Upload className="w-4 h-4" />,
            onClick: () => {
                setBlankAreaContextMenu(null);
                setUploadDialogOpen(true);
            }
        },
    ];

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`h-full glass border-r border-[var(--glass-border)] overflow-hidden flex flex-col ${isDraggingOver ? 'bg-[rgb(var(--accent-blue))]/10 border-2 border-[rgb(var(--accent-blue))]' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-[var(--glass-border)] space-y-3">
                            {/* Project Name */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                                    PROJECT FILES
                                </h3>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search files..."
                                    className="w-full pl-8 pr-8 py-1.5 text-sm glass rounded-lg border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-blue))] transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[var(--tab-hover)]"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleNewFile()}
                                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass-hover text-xs font-medium transition-colors"
                                    title="New File"
                                >
                                    <FilePlus className="w-3.5 h-3.5" />
                                    <span>File</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleNewFolder()}
                                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass-hover text-xs font-medium transition-colors"
                                    title="New Folder"
                                >
                                    <FolderPlus className="w-3.5 h-3.5" />
                                    <span>Folder</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setUploadDialogOpen(true)}
                                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg glass-hover text-xs font-medium transition-colors"
                                    title="Upload Files"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload</span>
                                </motion.button>
                            </div>

                            {/* Drag & Drop Hint */}
                            {isDraggingOver && (
                                <div className="text-center py-2 text-sm text-[rgb(var(--accent-blue))] font-medium">
                                    Drop files here to upload
                                </div>
                            )}
                        </div>

                        {/* File Tree */}
                        <div
                            className="flex-1 overflow-y-auto p-2"
                            onContextMenu={handleBlankAreaContextMenu}
                        >
                            <FileTree
                                nodes={filteredTree}
                                onFileClick={openFile}
                                onRename={handleRename}
                                onDelete={handleDelete}
                                onDuplicate={handleDuplicate}
                                onNewFile={handleNewFile}
                                onNewFolder={handleNewFolder}
                                onSetMain={setMainHtmlFile}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle button */}
            {!sidebarOpen && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSidebar}
                    className="absolute top-20 left-2 z-10 w-8 h-8 glass rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-lg"
                >
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            )}

            {/* Dialogs */}
            <FileDialog
                isOpen={fileDialogOpen}
                onClose={() => setFileDialogOpen(false)}
                onCreate={handleCreateFile}
                parentFolderName={getParentFolderName()}
            />

            <FolderDialog
                isOpen={folderDialogOpen}
                onClose={() => setFolderDialogOpen(false)}
                onCreate={handleCreateFolder}
                parentFolderName={getParentFolderName()}
            />

            <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={getDeleteItemInfo().name}
                itemType={getDeleteItemInfo().type}
                itemCount={getDeleteItemInfo().count}
            />

            <FileUpload
                isOpen={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                parentId={selectedParentId}
            />

            {/* Blank Area Context Menu */}
            <ContextMenu
                isOpen={blankAreaContextMenu !== null}
                x={blankAreaContextMenu?.x || 0}
                y={blankAreaContextMenu?.y || 0}
                onClose={() => setBlankAreaContextMenu(null)}
                items={blankAreaMenuItems}
            />

            {/* Rename Dialog */}
            <AnimatePresence>
                {renameDialogOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRenameDialogOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass rounded-xl border border-[var(--glass-border)] shadow-2xl z-50"
                        >
                            <div className="p-4 space-y-4">
                                <h2 className="text-lg font-semibold">Rename</h2>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleConfirmRename();
                                        if (e.key === 'Escape') setRenameDialogOpen(false);
                                    }}
                                    autoFocus
                                    className="w-full px-3 py-2 glass rounded-lg border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-blue))]"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setRenameDialogOpen(false)}
                                        className="px-4 py-2 rounded-lg glass-hover"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmRename}
                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--accent-blue))] to-[rgb(var(--accent-purple))] text-white"
                                    >
                                        Rename
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
