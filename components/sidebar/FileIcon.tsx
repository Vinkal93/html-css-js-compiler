"use client";

import {
    FileCode2,
    Paintbrush,
    FileJson,
    FileText,
    Folder,
    FolderOpen,
    Image,
    File,
    FileType,
} from "lucide-react";

interface FileIconProps {
    filename: string;
    isFolder?: boolean;
    isOpen?: boolean;
    className?: string;
}

export function FileIcon({ filename, isFolder, isOpen, className = "" }: FileIconProps) {
    if (isFolder) {
        const Icon = isOpen ? FolderOpen : Folder;
        return <Icon className={`w-4 h-4 text-blue-400 ${className}`} />;
    }

    const ext = filename.split('.').pop()?.toLowerCase() || '';

    // HTML files
    if (ext === 'html' || ext === 'htm') {
        return <FileCode2 className={`w-4 h-4 text-orange-400 ${className}`} />;
    }

    // CSS files
    if (ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less') {
        return <Paintbrush className={`w-4 h-4 text-blue-400 ${className}`} />;
    }

    // JavaScript/TypeScript files
    if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') {
        return <FileType className={`w-4 h-4 text-yellow-400 ${className}`} />;
    }

    // JSON files
    if (ext === 'json') {
        return <FileJson className={`w-4 h-4 text-green-400 ${className}`} />;
    }

    // Markdown files
    if (ext === 'md' || ext === 'markdown') {
        return <FileText className={`w-4 h-4 text-purple-400 ${className}`} />;
    }

    // Image files
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
        return <Image className={`w-4 h-4 text-pink-400 ${className}`} />;
    }

    // Default file icon
    return <File className={`w-4 h-4 text-gray-400 ${className}`} />;
}

export function getFileColor(filename: string, isFolder?: boolean): string {
    if (isFolder) return 'text-blue-400';

    const ext = filename.split('.').pop()?.toLowerCase() || '';

    const colorMap: Record<string, string> = {
        'html': 'text-orange-400',
        'htm': 'text-orange-400',
        'css': 'text-blue-400',
        'scss': 'text-pink-400',
        'sass': 'text-pink-400',
        'less': 'text-blue-300',
        'js': 'text-yellow-400',
        'jsx': 'text-yellow-400',
        'ts': 'text-blue-500',
        'tsx': 'text-blue-500',
        'json': 'text-green-400',
        'md': 'text-purple-400',
        'markdown': 'text-purple-400',
        'txt': 'text-gray-400',
    };

    return colorMap[ext] || 'text-gray-400';
}
