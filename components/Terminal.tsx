import React, { useState, useRef, useEffect } from 'react';

interface TerminalProps {
  onCommand: (command: string) => Promise<string>;
  currentPath: string;
}

interface HistoryItem {
  command: string;
  output: string;
  path: string;
}

export const Terminal: React.FC<TerminalProps> = ({ onCommand, currentPath }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const endOfTerminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (trimmedInput.toLowerCase() === 'clear') {
      setHistory([]);
    } else {
        const output = await onCommand(trimmedInput);
        const newHistoryItem = { command: trimmedInput, output, path: currentPath };
        setHistory(prev => [...prev, newHistoryItem]);
    }
    
    if (trimmedInput) {
        setCommandHistory(prev => [trimmedInput, ...prev.filter(c => c !== trimmedInput)]);
    }
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if(commandHistory.length > 0) {
            const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            const newIndex = Math.max(historyIndex - 1, 0);
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
        } else {
            setHistoryIndex(-1);
            setInput('');
        }
    }
  }

  const focusInput = () => inputRef.current?.focus();

  return (
    <div 
        className="bg-brand-background font-mono text-brand-text h-full flex flex-col p-4 rounded-lg border border-primary/30 shadow-2xl overflow-hidden"
        onClick={focusInput}
    >
        <div className="overflow-y-auto flex-grow pr-2">
            {history.map((item, index) => (
            <div key={index} className="mb-2">
                <div className="flex items-center">
                    <span className="text-primary">{item.path}</span>
                    <span className="text-primary mx-2">$</span>
                    <span className="flex-1">{item.command}</span>
                </div>
                {item.output && <div className="whitespace-pre-wrap">{item.output}</div>}
            </div>
            ))}
            <div ref={endOfTerminalRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex items-center mt-2">
            <span className="text-primary">{currentPath}</span>
            <span className="text-primary mx-2">$</span>
            <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none focus:ring-0 w-full text-brand-text p-0"
            autoFocus
            autoComplete="off"
            spellCheck="false"
            />
        </form>
    </div>
  );
};