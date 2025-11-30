"use client";

import { Topbar } from "@/components/topbar/Topbar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { TabBar } from "@/components/editor/TabBar";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { Terminal } from "@/components/terminal/Terminal";
import { useEditorStore } from "@/store/editorStore";
import { useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function Home() {
  const { previewOpen, theme, sidebarOpen } = useEditorStore();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[rgb(var(--background))]">
      {/* Top Bar */}
      <Topbar />

      {/* Main Content with Resizable Panels */}
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden relative">
        {/* Sidebar Panel - Resizable */}
        {sidebarOpen && (
          <>
            <Panel defaultSize={15} minSize={10} maxSize={30}>
              <Sidebar />
            </Panel>

            {/* Sidebar Resize Handle */}
            <PanelResizeHandle className="w-1 bg-[var(--glass-border)] hover:bg-[rgb(var(--accent-blue))] transition-colors cursor-col-resize relative group">
              <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-8 rounded-full bg-[rgb(var(--accent-blue))]" />
              </div>
            </PanelResizeHandle>
          </>
        )}

        {/* Editor and Preview Section */}
        <Panel>
          <PanelGroup direction="horizontal" className="h-full">
            {/* Editor Section */}
            <Panel defaultSize={previewOpen ? 50 : 100} minSize={30}>
              <div className="h-full flex flex-col">
                <TabBar />
                <div className="flex-1 overflow-hidden">
                  <CodeEditor />
                </div>
              </div>
            </Panel>

            {/* Editor-Preview Resize Handle */}
            {previewOpen && (
              <>
                <PanelResizeHandle className="w-1 bg-[var(--glass-border)] hover:bg-[rgb(var(--accent-blue))] transition-colors cursor-col-resize relative group">
                  <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-8 rounded-full bg-[rgb(var(--accent-blue))]" />
                  </div>
                </PanelResizeHandle>

                {/* Preview Section */}
                <Panel defaultSize={50} minSize={30}>
                  <div className="h-full border-l border-[var(--glass-border)] flex flex-col">
                    <div className="h-12 glass border-b border-[var(--glass-border)] flex items-center px-4">
                      <span className="text-sm font-medium text-[var(--text-secondary)]">Live Preview</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <PreviewFrame />
                    </div>
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* Sidebar Toggle Button (when sidebar is closed) */}
      {!sidebarOpen && <Sidebar />}

      {/* Terminal */}
      <Terminal />
    </div>
  );
}
