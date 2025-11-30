"use client";

import { useState, useEffect } from "react";
import { X, FileCode2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, fileType: string) => void;
    parentFolderName?: string;
}

const fileTypes = [
    { value: 'html', label: 'HTML', ext: '.html' },
    { value: 'css', label: 'CSS', ext: '.css' },
    { value: 'javascript', label: 'JavaScript', ext: '.js' },
    { value: 'typescript', label: 'TypeScript', ext: '.ts' },
    { value: 'jsx', label: 'React JSX', ext: '.jsx' },
    { value: 'tsx', label: 'React TSX', ext: '.tsx' },
    { value: 'json', label: 'JSON', ext: '.json' },
    { value: 'markdown', label: 'Markdown', ext: '.md' },
    { value: 'txt', label: 'Text', ext: '.txt' },
];

export function FileDialog({ isOpen, onClose, onCreate, parentFolderName }: FileDialogProps) {
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('html');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFileName('');
            setFileType('html');
            setError('');
        }
    }, [isOpen]);

    const handleCreate = () => {
        if (!fileName.trim()) {
            setError('File name is required');
            return;
        }

        // Validate file name
        if (!/^[a-zA-Z0-9-_]+$/.test(fileName)) {
            setError('File name can only contain letters, numbers, hyphens, and underscores');
            return;
        }

        const selectedType = fileTypes.find(t => t.value === fileType);
        const fullName = fileName + (selectedType?.ext || '');

        onCreate(fullName, fileType);
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
                                <FileCode2 className="w-5 h-5 text-[var(--accent-blue)]" />
                                <h2 className="text-lg font-semibold">Create New File</h2>
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

                            {/* File Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    File Type
                                </label>
                                <select
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value)}
                                    className="w-full px-3 py-2 glass rounded-lg border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-blue))] transition-all"
                                >
                                    {fileTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label} ({type.ext})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* File Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    File Name
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={fileName}
                                        onChange={(e) => {
                                            setFileName(e.target.value);
                                            setError('');
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="my-file"
                                        autoFocus
                                        className="flex-1 px-3 py-2 glass rounded-lg border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-blue))] transition-all"
                                    />
                                    <span className="text-[var(--text-secondary)] font-mono">
                                        {fileTypes.find(t => t.value === fileType)?.ext}
                                    </span>
                                </div>
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
                                Create File
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
