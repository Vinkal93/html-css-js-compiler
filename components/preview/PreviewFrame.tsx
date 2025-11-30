"use client";

import { useEditorStore } from "@/store/editorStore";
import { useEffect, useRef } from "react";

export function PreviewFrame() {
    const { deviceView, mainHtmlFileId, getFileById, fileTree } = useEditorStore();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument;

            if (doc) {
                const mainHtmlFile = mainHtmlFileId ? getFileById(mainHtmlFileId) : null;

                if (!mainHtmlFile || mainHtmlFile.type !== 'file') {
                    // No HTML file, show placeholder
                    doc.open();
                    doc.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {
                                    margin: 0;
                                    padding: 0;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                    font-family: system-ui, sans-serif;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                }
                                .container {
                                    text-align: center;
                                    padding: 2rem;
                                }
                                h1 {
                                    font-size: 2rem;
                                    margin-bottom: 1rem;
                                }
                                p {
                                    opacity: 0.9;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>No HTML File Selected</h1>
                                <p>Create or select an HTML file to see the preview</p>
                            </div>
                        </body>
                        </html>
                    `);
                    doc.close();
                    return;
                }

                // Get all files recursively
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

                // Get all CSS and JS files
                const cssFiles = allFiles.filter(f => f.language === 'css');
                const jsFiles = allFiles.filter(f => f.language === 'javascript' || f.language === 'typescript');

                // Combine all CSS
                const combinedCSS = cssFiles.map(f => f.content || '').join('\n\n');

                // Combine all JS
                const combinedJS = jsFiles.map(f => f.content || '').join('\n\n');

                // Build HTML with embedded CSS and JS
                let htmlContent = mainHtmlFile.content || '';

                // Embed CSS
                if (combinedCSS) {
                    if (htmlContent.includes('</head>')) {
                        htmlContent = htmlContent.replace('</head>', `<style>\n${combinedCSS}\n</style>\n</head>`);
                    } else {
                        htmlContent = `<style>\n${combinedCSS}\n</style>\n` + htmlContent;
                    }
                }

                // Embed JS
                if (combinedJS) {
                    if (htmlContent.includes('</body>')) {
                        htmlContent = htmlContent.replace('</body>', `<script>\n${combinedJS}\n</script>\n</body>`);
                    } else {
                        htmlContent = htmlContent + `\n<script>\n${combinedJS}\n</script>`;
                    }
                }

                doc.open();
                doc.write(htmlContent);
                doc.close();
            }
        }
    }, [mainHtmlFileId, fileTree, getFileById]);

    const getDeviceStyles = () => {
        switch (deviceView) {
            case 'mobile':
                return 'w-[375px] h-[667px]';
            case 'tablet':
                return 'w-[768px] h-[1024px]';
            default:
                return 'w-full h-full';
        }
    };

    return (
        <div className="h-full w-full flex items-center justify-center bg-[rgb(var(--background))] p-4 overflow-auto">
            <div className={`${getDeviceStyles()} transition-all duration-300`}>
                <div className="h-full w-full rounded-lg overflow-hidden shadow-2xl border-2 border-[var(--glass-border)]">
                    <iframe
                        ref={iframeRef}
                        className="w-full h-full bg-white"
                        title="Live Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </div>
        </div>
    );
}
