"use client";

import { useEditorStore } from "@/store/editorStore";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { FileIcon } from "../sidebar/FileIcon";

export function TabBar() {
    const {
        openFiles,
        activeFileId,
        setActiveFile,
        closeFile,
        getFileById,
    } = useEditorStore();

    const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        closeFile(fileId);
    };

    const handleMiddleClick = (e: React.MouseEvent, fileId: string) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            closeFile(fileId);
        }
    };

    if (openFiles.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 px-2 py-1 bg-[var(--topbar-bg)] border-b border-[var(--glass-border)] overflow-x-auto scrollbar-thin">
            {openFiles.map((fileId) => {
                const file = getFileById(fileId);
                if (!file || file.type !== 'file') return null;

                const isActive = activeFileId === fileId;

                return (
                    <motion.div
                        key={fileId}
                        onClick={() => setActiveFile(fileId)}
                        onMouseDown={(e) => handleMiddleClick(e, fileId)}
                        className={`
                            relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                            transition-all duration-200 group min-w-0 max-w-[200px] cursor-pointer
                            ${isActive
                                ? 'bg-[var(--tab-active)] text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--tab-hover)]'
                            }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* File Icon */}
                        <FileIcon filename={file.name} className="flex-shrink-0" />

                        {/* File Name */}
                        <span className="truncate flex-1">{file.name}</span>

                        {/* Modified Indicator */}
                        {file.isModified && (
                            <span className="w-2 h-2 rounded-full bg-[rgb(var(--accent-blue))] flex-shrink-0" />
                        )}

                        {/* Close Button - Changed from button to div */}
                        <div
                            onClick={(e) => handleCloseTab(e, fileId)}
                            className={`
                                flex-shrink-0 p-0.5 rounded hover:bg-[var(--glass-border)] transition-colors cursor-pointer
                                ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            `}
                            title="Close (Middle-click)"
                        >
                            <X className="w-3.5 h-3.5" />
                        </div>

                        {/* Active Tab Indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[rgb(var(--accent-blue))] to-[rgb(var(--accent-purple))]"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
