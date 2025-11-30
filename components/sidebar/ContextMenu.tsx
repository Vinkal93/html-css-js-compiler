"use client";

import { useEffect, useRef } from "react";
import {
    Edit2,
    Trash2,
    Copy,
    FilePlus,
    FolderPlus,
    FileCode2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ContextMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    divider?: boolean;
}

interface ContextMenuProps {
    isOpen: boolean;
    x: number;
    y: number;
    onClose: () => void;
    items: ContextMenuItem[];
}

export function ContextMenu({ isOpen, x, y, onClose, items }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Adjust position to keep menu in viewport
    useEffect(() => {
        if (isOpen && menuRef.current) {
            const menu = menuRef.current;
            const rect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let adjustedX = x;
            let adjustedY = y;

            if (rect.right > viewportWidth) {
                adjustedX = viewportWidth - rect.width - 10;
            }

            if (rect.bottom > viewportHeight) {
                adjustedY = viewportHeight - rect.height - 10;
            }

            menu.style.left = `${adjustedX}px`;
            menu.style.top = `${adjustedY}px`;
        }
    }, [isOpen, x, y]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    style={{ left: x, top: y }}
                    className="fixed z-[100] min-w-[200px] glass rounded-lg border border-[var(--glass-border)] shadow-2xl py-1"
                >
                    {items.map((item, index) => (
                        <div key={index}>
                            {item.divider && (
                                <div className="h-px bg-[var(--glass-border)] my-1" />
                            )}
                            <button
                                onClick={() => {
                                    item.onClick();
                                    onClose();
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2 text-sm
                                    transition-colors text-left
                                    ${item.danger
                                        ? 'text-red-400 hover:bg-red-500/10'
                                        : 'text-[var(--text-primary)] hover:bg-[var(--tab-hover)]'
                                    }
                                `}
                            >
                                <span className="w-4 h-4 flex items-center justify-center">
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </button>
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Helper function to create context menu items for files
export function createFileContextMenuItems(
    onRename: () => void,
    onDelete: () => void,
    onDuplicate: () => void,
    isHtml?: boolean,
    onSetMain?: () => void
): ContextMenuItem[] {
    const items: ContextMenuItem[] = [
        {
            label: 'Rename',
            icon: <Edit2 className="w-4 h-4" />,
            onClick: onRename,
        },
        {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: onDuplicate,
        },
    ];

    if (isHtml && onSetMain) {
        items.push({
            label: 'Set as Main',
            icon: <FileCode2 className="w-4 h-4" />,
            onClick: onSetMain,
        });
    }

    items.push({
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: onDelete,
        danger: true,
        divider: true,
    });

    return items;
}

// Helper function to create context menu items for folders
export function createFolderContextMenuItems(
    onRename: () => void,
    onDelete: () => void,
    onNewFile: () => void,
    onNewFolder: () => void
): ContextMenuItem[] {
    return [
        {
            label: 'New File',
            icon: <FilePlus className="w-4 h-4" />,
            onClick: onNewFile,
        },
        {
            label: 'New Folder',
            icon: <FolderPlus className="w-4 h-4" />,
            onClick: onNewFolder,
        },
        {
            label: 'Rename',
            icon: <Edit2 className="w-4 h-4" />,
            onClick: onRename,
            divider: true,
        },
        {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: onDelete,
            danger: true,
        },
    ];
}
