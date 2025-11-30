"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Terminal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [output, setOutput] = useState<string[]>([
        "Welcome to Vin Code Terminal! 🚀",
        "Type your commands below...",
        "",
    ]);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const outputRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const executeCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim();
        if (!trimmedCmd) return;

        setHistory(prev => [...prev, trimmedCmd]);
        setHistoryIndex(-1);

        // Add command to output
        setOutput(prev => [...prev, `$ ${trimmedCmd}`]);

        // Simple command execution (client-side only)
        const parts = trimmedCmd.split(" ");
        const command = parts[0].toLowerCase();

        switch (command) {
            case "clear":
                setOutput([]);
                break;
            case "help":
                setOutput(prev => [
                    ...prev,
                    "Available commands:",
                    "  clear    - Clear terminal",
                    "  help     - Show this help",
                    "  echo     - Print text",
                    "  date     - Show current date/time",
                    "  pwd      - Show current directory",
                    "",
                ]);
                break;
            case "echo":
                setOutput(prev => [...prev, parts.slice(1).join(" "), ""]);
                break;
            case "date":
                setOutput(prev => [...prev, new Date().toString(), ""]);
                break;
            case "pwd":
                setOutput(prev => [...prev, "/project", ""]);
                break;
            default:
                setOutput(prev => [
                    ...prev,
                    `Command not found: ${command}`,
                    "Type 'help' for available commands",
                    "",
                ]);
        }

        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            executeCommand(input);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = historyIndex + 1;
                if (newIndex >= history.length) {
                    setHistoryIndex(-1);
                    setInput("");
                } else {
                    setHistoryIndex(newIndex);
                    setInput(history[newIndex]);
                }
            }
        }
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 z-40 p-3 rounded-lg glass border border-[var(--glass-border)] shadow-lg hover:scale-105 transition-transform"
                    title="Open Terminal"
                >
                    <TerminalIcon className="w-5 h-5" />
                </motion.button>
            )}

            {/* Terminal Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: isMaximized ? "calc(100vh - 56px)" : "300px",
                            opacity: 1
                        }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-[var(--glass-border)] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--glass-border)] bg-[var(--topbar-bg)]">
                            <div className="flex items-center gap-2">
                                <TerminalIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Terminal</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="p-1.5 rounded hover:bg-[var(--tab-hover)] transition-colors"
                                    title={isMaximized ? "Minimize" : "Maximize"}
                                >
                                    {isMaximized ? (
                                        <Minimize2 className="w-4 h-4" />
                                    ) : (
                                        <Maximize2 className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded hover:bg-[var(--tab-hover)] transition-colors"
                                    title="Close Terminal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Output */}
                        <div
                            ref={outputRef}
                            className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black/20"
                        >
                            {output.map((line, index) => (
                                <div key={index} className="text-[var(--text-primary)]">
                                    {line}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex items-center gap-2 px-4 py-2 border-t border-[var(--glass-border)] bg-black/20">
                            <span className="text-[var(--accent-blue)] font-mono text-sm">$</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-[var(--text-primary)]"
                                placeholder="Type a command..."
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
