"use client";

import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@/store/editorStore";
import { getLanguageFromExtension } from "@/utils/fileTemplates";

interface FileUploadProps {
    isOpen: boolean;
    onClose: () => void;
    parentId?: string | null;
}

export function FileUpload({ isOpen, onClose, parentId = null }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const { createFile } = useEditorStore();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        setUploadedFiles(files);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedFiles(files);
        }
    };

    const handleUpload = async () => {
        for (const file of uploadedFiles) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const language = getLanguageFromExtension(file.name);
                createFile(file.name, language, parentId);

                // Update content after creation
                const { fileTree, getFileById, updateFileContent } = useEditorStore.getState();
                const getAllFiles = (nodes: any[]): any[] => {
                    let files: any[] = [];
                    nodes.forEach(node => {
                        if (node.type === 'file') files.push(node);
                        else if (node.children) files = files.concat(getAllFiles(node.children));
                    });
                    return files;
                };
                const allFiles = getAllFiles(fileTree);
                const newFile = allFiles.find(f => f.name === file.name);
                if (newFile) {
                    updateFileContent(newFile.id, content);
                }
            };
            reader.readAsText(file);
        }

        setUploadedFiles([]);
        onClose();
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass rounded-xl border border-[var(--glass-border)] shadow-2xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
                            <div className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-[var(--accent-blue)]" />
                                <h2 className="text-lg font-semibold">Upload Files</h2>
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
                            {/* Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    border-2 border-dashed rounded-lg p-8 text-center transition-all
                                    ${isDragging
                                        ? 'border-[rgb(var(--accent-blue))] bg-[rgb(var(--accent-blue))]/10'
                                        : 'border-[var(--glass-border)] hover:border-[var(--text-secondary)]'
                                    }
                                `}
                            >
                                <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--text-secondary)]" />
                                <p className="text-lg font-medium mb-2">
                                    {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">or</p>
                                <label className="px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--accent-blue))] to-[rgb(var(--accent-purple))] text-white font-medium cursor-pointer hover:opacity-90 transition-opacity inline-block">
                                    Browse Files
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileInput}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Uploaded Files List */}
                            {uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Selected Files:</p>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 glass rounded-lg"
                                            >
                                                <div className="flex-1 truncate">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {(file.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 rounded hover:bg-[var(--tab-hover)]"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                onClick={handleUpload}
                                disabled={uploadedFiles.length === 0}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--accent-blue))] to-[rgb(var(--accent-purple))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
