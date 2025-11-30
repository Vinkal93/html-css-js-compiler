"use client";

import { useState, useEffect } from "react";
import { X, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
    parentFolderName?: string;
}

export function FolderDialog({ isOpen, onClose, onCreate, parentFolderName }: FolderDialogProps) {
    const [folderName, setFolderName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFolderName('');
            setError('');
        }
    }, [isOpen]);

    const handleCreate = () => {
        if (!folderName.trim()) {
            setError('Folder name is required');
            return;
        }

        // Validate folder name
        if (!/^[a-zA-Z0-9-_\s]+$/.test(folderName)) {
            setError('Folder name can only contain letters, numbers, spaces, hyphens, and underscores');
            return;
        }

        onCreate(folderName.trim());
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreate();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass rounded-xl border border-[var(--glass-border)] shadow-2xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
                            <div className="flex items-center gap-2">
                                <Folder className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg font-semibold">Create New Folder</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-[var(--tab-hover)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-4">
                            {parentFolderName && (
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Creating in: <span className="font-medium text-[var(--text-primary)]">{parentFolderName}</span>
                                </p>
                            )}

                            {/* Folder Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Folder Name
                                </label>
                                <input
                                    type="text"
                                    value={folderName}
                                    onChange={(e) => {
                                        setFolderName(e.target.value);
                                        setError('');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="my-folder"
                                    autoFocus
                                    className="w-full px-3 py-2 glass rounded-lg border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-blue))] transition-all"
                                />
                                {error && (
                                    <p className="mt-2 text-sm text-red-400">{error}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--glass-border)]">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg glass-hover text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--accent-blue))] to-[rgb(var(--accent-purple))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                Create Folder
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
