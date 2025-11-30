"use client";

import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType: 'file' | 'folder';
    itemCount?: number; // For folders, number of items inside
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType,
    itemCount = 0
}: DeleteConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm();
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
                        onKeyDown={handleKeyDown}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass rounded-xl border border-[var(--glass-border)] shadow-2xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <h2 className="text-lg font-semibold">Confirm Delete</h2>
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
                            <p className="text-[var(--text-primary)]">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-red-400">{itemName}</span>?
                            </p>

                            {itemType === 'folder' && itemCount > 0 && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400">
                                        ⚠️ This folder contains {itemCount} item{itemCount !== 1 ? 's' : ''}.
                                        All contents will be permanently deleted.
                                    </p>
                                </div>
                            )}

                            <p className="text-sm text-[var(--text-secondary)]">
                                This action cannot be undone.
                            </p>
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
                                onClick={handleConfirm}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                            >
                                Delete {itemType === 'folder' ? 'Folder' : 'File'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
