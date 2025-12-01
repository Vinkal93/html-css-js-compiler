"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileNode, useEditorStore } from "@/store/editorStore";
import { FileIcon } from "./FileIcon";
import { ContextMenu, createFileContextMenuItems, createFolderContextMenuItems } from "./ContextMenu";

interface FileTreeProps {
    nodes: FileNode[];
    level?: number;
    onFileClick: (id: string) => void;
    onRename: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onNewFile: (parentId: string) => void;
    onNewFolder: (parentId: string) => void;
    onSetMain: (id: string) => void;
}

interface FileTreeItemProps {
    node: FileNode;
    level: number;
    onFileClick: (id: string) => void;
    onRename: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onNewFile: (parentId: string) => void;
    onNewFolder: (parentId: string) => void;
    onSetMain: (id: string) => void;
}

function FileTreeItem({
    node,
    level,
    onFileClick,
    onRename,
    onDelete,
    onDuplicate,
    onNewFile,
    onNewFolder,
    onSetMain,
}: FileTreeItemProps) {
    const {
        activeFileId,
        expandedFolders,
        toggleFolder,
        mainHtmlFileId,
    } = useEditorStore();

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const isActive = activeFileId === node.id;
    const isExpanded = node.type === 'folder' && expandedFolders.has(node.id);
    const isMainHtml = mainHtmlFileId === node.id;

    const handleClick = () => {
        if (node.type === 'folder') {
            toggleFolder(node.id);
        } else {
            onFileClick(node.id);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('nodeId', node.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (node.type === 'folder') {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        if (node.type === 'folder') {
            const draggedNodeId = e.dataTransfer.getData('nodeId');
            if (draggedNodeId && draggedNodeId !== node.id) {
                const { moveNode } = useEditorStore.getState();
                moveNode(draggedNodeId, node.id);
            }
        }
    };

    const contextMenuItems = node.type === 'file'
        ? createFileContextMenuItems(
            () => onRename(node.id),
            () => onDelete(node.id),
            () => onDuplicate(node.id),
            node.language === 'html',
            () => onSetMain(node.id)
        )
        : createFolderContextMenuItems(
            () => onRename(node.id),
            () => onDelete(node.id),
            () => onNewFile(node.id),
            () => onNewFolder(node.id)
        );

    return (
        <>
            <div
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onContextMenu={handleContextMenu}
            >
                <motion.div
                    onClick={handleClick}
                    className={`
                        flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer
                        transition-all duration-200 group
                        ${isActive
                            ? 'bg-[var(--tab-active)] text-[var(--text-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--tab-hover)] hover:text-[var(--text-primary)]'
                        }
                        ${dragOver ? 'bg-[rgb(var(--accent-blue))]/20 border-2 border-[rgb(var(--accent-blue))]' : ''}
                    `}
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                    whileHover={{ x: 2 }}
                >
                    {/* Expand/Collapse Icon */}
                    {node.type === 'folder' && (
                        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </span>
                    )}

                    {/* File/Folder Icon */}
                    <FileIcon
                        filename={node.name}
                        isFolder={node.type === 'folder'}
                        isOpen={isExpanded}
                    />

                    {/* Name */}
                    <span className="flex-1 text-sm truncate">
                        {node.name}
                    </span>

                    {/* Main HTML Indicator */}
                    {isMainHtml && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[rgb(var(--accent-blue))]/20 text-[rgb(var(--accent-blue))]">
                            main
                        </span>
                    )}

                    {/* Modified Indicator */}
                    {node.isModified && (
                        <span className="w-2 h-2 rounded-full bg-[rgb(var(--accent-blue))]" />
                    )}
                </motion.div>
            </div>

            {/* Children */}
            {node.type === 'folder' && isExpanded && node.children && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FileTree
                            nodes={node.children}
                            level={level + 1}
                            onFileClick={onFileClick}
                            onRename={onRename}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                            onNewFile={onNewFile}
                            onNewFolder={onNewFolder}
                            onSetMain={onSetMain}
                        />
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Context Menu */}
            <ContextMenu
                isOpen={contextMenu !== null}
                x={contextMenu?.x || 0}
                y={contextMenu?.y || 0}
                onClose={() => setContextMenu(null)}
                items={contextMenuItems}
            />
        </>
    );
}

export function FileTree({
    nodes,
    level = 0,
    onFileClick,
    onRename,
    onDelete,
    onDuplicate,
    onNewFile,
    onNewFolder,
    onSetMain,
}: FileTreeProps) {
    return (
        <div className="space-y-0.5">
            {nodes.map(node => (
                <FileTreeItem
                    key={node.id}
                    node={node}
                    level={level}
                    onFileClick={onFileClick}
                    onRename={onRename}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onNewFile={onNewFile}
                    onNewFolder={onNewFolder}
                    onSetMain={onSetMain}
                />
            ))}
        </div>
    );
}
