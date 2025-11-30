"use client";

import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useEditorStore } from "@/store/editorStore";

export function CodeEditor() {
    const {
        activeFileId,
        getFileById,
        updateFileContent,
        fontSize,
        editorMode,
        zoomIn,
        zoomOut,
        resetZoom,
    } = useEditorStore();

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const activeFile = activeFileId ? getFileById(activeFileId) : null;

    useEffect(() => {
        // Register keyboard shortcuts for zoom
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey)) {
                // Zoom shortcuts
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    zoomIn();
                } else if (e.key === '-' || e.key === '_') {
                    e.preventDefault();
                    zoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    resetZoom();
                }
            }
        };

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    zoomIn();
                } else {
                    zoomOut();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [zoomIn, zoomOut, resetZoom]);

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Register advanced keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
            editor.trigger('keyboard', 'editor.action.commentLine', {});
        });

        editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => {
            editor.trigger('keyboard', 'editor.action.toggleWordWrap', {});
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            editor.trigger('keyboard', 'editor.action.insertLineAfter', {});
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
            editor.trigger('keyboard', 'editor.action.insertLineBefore', {});
        });

        editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
            editor.trigger('keyboard', 'editor.action.moveLinesUpAction', {});
        });

        editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
            editor.trigger('keyboard', 'editor.action.moveLinesDownAction', {});
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
            editor.trigger('keyboard', 'editor.action.addSelectionToNextFindMatch', {});
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK, () => {
            editor.trigger('keyboard', 'editor.action.deleteLines', {});
        });

        // Enable link detection and clicking
        editor.updateOptions({
            links: true,
        });

        // Configure language-specific features
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.React,
            reactNamespace: 'React',
            allowJs: true,
            typeRoots: ['node_modules/@types'],
        });
    };

    const handleChange = (value: string | undefined) => {
        if (value !== undefined && activeFileId) {
            updateFileContent(activeFileId, value);
        }
    };

    if (!activeFile || activeFile.type !== 'file') {
        return (
            <div className="h-full w-full flex items-center justify-center text-[var(--text-secondary)]">
                <div className="text-center">
                    <p className="text-lg font-medium mb-2">No file selected</p>
                    <p className="text-sm">Select a file from the sidebar to start editing</p>
                </div>
            </div>
        );
    }

    // Practice mode: Basic autocomplete only
    // Expert mode: Full IntelliSense, snippets, Emmet
    const editorOptions = {
        fontSize,
        fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
        fontLigatures: true,
        minimap: { enabled: true },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on' as const,
        lineNumbers: 'on' as const,
        renderWhitespace: 'selection' as const,
        bracketPairColorization: {
            enabled: true
        },
        links: true, // Enable clickable links
        // Practice mode settings
        quickSuggestions: editorMode === 'expert' ? true : {
            other: true,
            comments: false,
            strings: false
        },
        suggestOnTriggerCharacters: editorMode === 'expert',
        acceptSuggestionOnEnter: editorMode === 'expert' ? 'on' as const : 'off' as const,
        tabCompletion: editorMode === 'expert' ? 'on' as const : 'off' as const,
        wordBasedSuggestions: editorMode === 'expert' ? 'matchingDocuments' as const : 'off' as const,
        // Snippets
        snippetSuggestions: editorMode === 'expert' ? 'top' as const : 'none' as const,
        suggest: {
            showSnippets: editorMode === 'expert',
            showWords: true,
            showKeywords: true,
            showFunctions: true,
            showVariables: true,
            showClasses: true,
            showModules: true,
            showProperties: true,
            showMethods: true,
            insertMode: 'replace' as const,
        },
        // Emmet
        quickSuggestionsDelay: 0,
        // Other settings
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: true,
        smoothScrolling: true,
        cursorBlinking: 'smooth' as const,
        cursorSmoothCaretAnimation: 'on' as const,
        roundedSelection: true,
        padding: {
            top: 16,
            bottom: 16,
        },
        // Disable parameter hints in practice mode
        parameterHints: {
            enabled: editorMode === 'expert'
        },
        // Format on paste and type
        formatOnPaste: true,
        formatOnType: true,
        // Auto closing brackets and tags - ENHANCED
        autoClosingBrackets: 'always' as const,
        autoClosingQuotes: 'always' as const,
        autoClosingOvertype: 'always' as const,
        autoSurround: 'languageDefined' as const,
        autoClosingDelete: 'always' as const,
        // Folding
        folding: true,
        foldingStrategy: 'indentation' as const,
        showFoldingControls: 'always' as const,
        // Multi-cursor
        multiCursorModifier: 'ctrlCmd' as const,
        // Find
        find: {
            seedSearchStringFromSelection: 'always' as const,
            autoFindInSelection: 'never' as const,
        },
    };

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                language={activeFile.language || 'plaintext'}
                value={activeFile.content || ''}
                onChange={handleChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={editorOptions}
            />
        </div>
    );
}
