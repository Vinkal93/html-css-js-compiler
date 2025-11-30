"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import {
    Play, Download, Eye, EyeOff, Monitor, Tablet, Smartphone,
    Sun, Moon, FileCode2, ZoomIn, ZoomOut, RotateCcw, ExternalLink,
    GraduationCap, Zap, Maximize2, Minimize2
} from "lucide-react";
import { motion } from "framer-motion";
import JSZip from "jszip";

export function Topbar() {
    const {
        previewOpen,
        togglePreview,
        deviceView,
        setDeviceView,
        theme,
        setTheme,
        editorMode,
        setEditorMode,
        zoomLevel,
        zoomIn,
        zoomOut,
        resetZoom,
        getFileById,
        mainHtmlFileId,
        fileTree,
    } = useEditorStore();

    const [refreshKey, setRefreshKey] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleRun = () => {
        // Refresh preview by updating key
        setRefreshKey(prev => prev + 1);
    };

    const downloadProject = async () => {
        const zip = new JSZip();

        // Recursively add files to zip
        const addFilesToZip = (nodes: any[], folder: any = zip) => {
            nodes.forEach(node => {
                if (node.type === 'file' && node.content) {
                    folder.file(node.name, node.content);
                } else if (node.type === 'folder' && node.children) {
                    const subFolder = folder.folder(node.name);
                    if (subFolder) {
                        addFilesToZip(node.children, subFolder);
                    }
                }
            });
        };

        addFilesToZip(fileTree);

        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'vin-code-project.zip';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const openPreviewInNewTab = () => {
        const mainHtmlFile = mainHtmlFileId ? getFileById(mainHtmlFileId) : null;

        if (!mainHtmlFile || mainHtmlFile.type !== 'file') {
            alert('No HTML file selected. Please select an HTML file to preview.');
            return;
        }

        // Get all CSS and JS files
        const getAllFiles = (nodes: any[]): any[] => {
            let files: any[] = [];
            nodes.forEach(node => {
                if (node.type === 'file') {
                    files.push(node);
                } else if (node.type === 'folder' && node.children) {
                    files = files.concat(getAllFiles(node.children));
                }
            });
            return files;
        };

        const allFiles = getAllFiles(fileTree);
        const cssFiles = allFiles.filter(f => f.language === 'css');
        const jsFiles = allFiles.filter(f => f.language === 'javascript' || f.language === 'typescript');

        // Combine all CSS
        const combinedCSS = cssFiles.map(f => f.content || '').join('\n\n');

        // Combine all JS
        const combinedJS = jsFiles.map(f => f.content || '').join('\n\n');

        // Create standalone HTML
        let htmlContent = mainHtmlFile.content || '';

        // Embed CSS
        if (combinedCSS) {
            htmlContent = htmlContent.replace('</head>', `<style>\n${combinedCSS}\n</style>\n</head>`);
        }

        // Embed JS
        if (combinedJS) {
            htmlContent = htmlContent.replace('</body>', `<script>\n${combinedJS}\n</script>\n</body>`);
        }

        // Open in new tab
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        }
    };

    const deviceButtons = [
        { icon: Monitor, type: 'desktop' as const, label: 'Desktop' },
        { icon: Tablet, type: 'tablet' as const, label: 'Tablet' },
        { icon: Smartphone, type: 'mobile' as const, label: 'Mobile' },
    ];

    return (
        <div className="h-14 glass border-b border-[var(--glass-border)] flex items-center justify-between px-4 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--accent-blue))] to-[rgb(var(--accent-purple))] flex items-center justify-center">
                        <FileCode2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-[rgb(var(--accent-blue))] to-[rgb(var(--accent-purple))] bg-clip-text text-transparent">
                        Vin Code
                    </span>
                </div>
            </div>

            {/* Center - Actions */}
            <div className="flex items-center gap-2">
                {/* Run Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRun}
                    className="px-3 py-1.5 rounded-lg glass-hover text-sm flex items-center gap-2 font-medium"
                    title="Run Code (Refresh Preview)"
                >
                    <Play className="w-4 h-4" />
                    Run
                </motion.button>

                {/* Download */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadProject}
                    className="px-3 py-1.5 rounded-lg glass-hover text-sm flex items-center gap-2 font-medium"
                    title="Download Project"
                >
                    <Download className="w-4 h-4" />
                    Download
                </motion.button>

                {/* Divider */}
                <div className="w-px h-6 bg-[var(--glass-border)]" />

                {/* Practice/Expert Mode Toggle */}
                <div className="flex items-center gap-1 p-1 glass rounded-lg">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditorMode('practice')}
                        className={`
                            px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2
                            ${editorMode === 'practice'
                                ? 'bg-[var(--tab-active)] text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--tab-hover)]'
                            }
                        `}
                        title="Practice Mode - Basic autocomplete"
                    >
                        <GraduationCap className="w-4 h-4" />
                        Practice
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditorMode('expert')}
                        className={`
                            px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2
                            ${editorMode === 'expert'
                                ? 'bg-[var(--tab-active)] text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--tab-hover)]'
                            }
                        `}
                        title="Expert Mode - Full Emmet & IntelliSense"
                    >
                        <Zap className="w-4 h-4" />
                        Expert
                    </motion.button>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-[var(--glass-border)]" />

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 p-1 glass rounded-lg">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={zoomOut}
                        className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--tab-hover)] hover:text-[var(--text-primary)]"
                        title="Zoom Out (Ctrl -)"
                        disabled={zoomLevel <= 50}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </motion.button>
                    <span className="px-2 text-sm font-medium min-w-[50px] text-center">
                        {zoomLevel}%
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={zoomIn}
                        className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--tab-hover)] hover:text-[var(--text-primary)]"
                        title="Zoom In (Ctrl +)"
                        disabled={zoomLevel >= 200}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetZoom}
                        className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--tab-hover)] hover:text-[var(--text-primary)]"
                        title="Reset Zoom (Ctrl 0)"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>

            {/* Right - Preview & Theme Controls */}
            <div className="flex items-center gap-2">
                {/* Device View */}
                <div className="flex items-center gap-1 p-1 glass rounded-lg">
                    {deviceButtons.map(({ icon: Icon, type, label }) => (
                        <motion.button
                            key={type}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeviceView(type)}
                            className={`
                                p-2 rounded-md transition-colors
                                ${deviceView === type
                                    ? 'bg-[var(--tab-active)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--tab-hover)]'
                                }
                            `}
                            title={label}
                        >
                            <Icon className="w-4 h-4" />
                        </motion.button>
                    ))}
                </div>

                {/* Preview Toggle */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePreview}
                    className={`
                        p-2 rounded-lg transition-colors
                        ${previewOpen ? 'bg-[var(--tab-active)]' : 'glass-hover'}
                    `}
                    title={previewOpen ? 'Hide Preview' : 'Show Preview'}
                >
                    {previewOpen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </motion.button>

                {/* Open in New Tab */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openPreviewInNewTab}
                    className="p-2 rounded-lg glass-hover"
                    title="Open Preview in New Tab"
                >
                    <ExternalLink className="w-4 h-4" />
                </motion.button>

                {/* Theme Toggle */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-lg glass-hover"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.button>

                {/* Fullscreen Toggle */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg glass-hover"
                    title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </motion.button>
            </div>
        </div>
    );
}
