import React, { useState, useCallback, useEffect } from 'react';
import useFileSystem from './hooks/useFileSystem';
import { TASKS } from './constants';
import { FileSystemGUI } from './components/FileExplorer';
import { FileSystemNode, NodeType, Task } from './types';

const useTheme = (): [string, () => void] => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return [theme, toggleTheme];
};

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const TaskDisplay: React.FC<{ task: Task; onHint: () => void; onUndo: () => void; canUndo: boolean; }> = ({ task, onHint, onUndo, canUndo }) => (
  <div className="bg-white dark:bg-brand-background border border-gray-200 dark:border-primary/30 rounded-lg p-4 mb-4 shadow-lg">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-xl font-bold text-primary">{task.title}</h2>
       <div className="flex items-center gap-2">
         <button
            onClick={onUndo}
            disabled={!canUndo}
            className="bg-gray-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button 
            onClick={onHint} 
            className="bg-primary text-white font-bold py-1 px-3 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 text-sm"
          >
            Get Hint
          </button>
       </div>
    </div>
    <p className="text-gray-700 dark:text-brand-text whitespace-pre-wrap font-mono">{task.description}</p>
  </div>
);

const SuccessOverlay: React.FC<{ message: string, onNext: () => void }> = ({ message, onNext }) => (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-brand-background border-2 border-primary rounded-lg p-8 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-primary mb-4">Task Complete!</h2>
            <p className="text-xl text-gray-800 dark:text-white mb-6">{message}</p>
            <button
                onClick={onNext}
                className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            >
                Next Task
            </button>
        </div>
    </div>
);

const FileViewerModal: React.FC<{ file: FileSystemNode | null; onClose: () => void; }> = ({ file, onClose }) => {
    if (!file || file.type !== NodeType.FILE) return null;
    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-background border border-gray-300 dark:border-gray-600 rounded-lg p-6 font-mono w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                    <h3 className="text-lg font-bold text-primary">{file.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">&times;</button>
                </div>
                <pre className="whitespace-pre-wrap text-gray-700 dark:text-brand-text">{file.content}</pre>
            </div>
        </div>
    );
};

const InputPromptModal: React.FC<{ title: string; onClose: () => void; onSubmit: (name: string) => void; }> = ({ title, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
        }
    };

    return (
         <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-brand-background border border-gray-300 dark:border-gray-600 rounded-lg p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">Create</button>
                </div>
            </form>
        </div>
    );
};


export default function App() {
  const { fs, currentPath, ls, cd, mkdir, touch, rm, cat, goToPath, undo, canUndo } = useFileSystem();
  const [taskIndex, setTaskIndex] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [viewingFile, setViewingFile] = useState<FileSystemNode | null>(null);
  const [prompt, setPrompt] = useState<{type: 'file' | 'folder', visible: boolean}>({type: 'file', visible: false});
  const [hint, setHint] = useState<string | null>(null);
  const [theme, toggleTheme] = useTheme();


  const currentTask = TASKS[taskIndex];

  const checkCompletion = useCallback(() => {
    // A small delay to allow React state to propagate before validating
    setTimeout(() => {
        const isComplete = currentTask.validate(fs, currentPath);
        if (isComplete) {
            setTaskCompleted(true);
        }
    }, 100);
  }, [currentTask, fs, currentPath]);

  const handleAction = useCallback((actionFn: () => any) => {
    actionFn();
    checkCompletion();
  }, [checkCompletion]);


  const handleNextTask = () => {
    setTaskCompleted(false);
    setHint(null);
    if (taskIndex < TASKS.length - 1) {
      setTaskIndex(taskIndex + 1);
    }
  };

  const handleGetHint = () => {
    const hintText = currentTask.hint;
    setHint(`🧠 HINT: ${hintText}`);
    setTimeout(() => setHint(null), 5000); // Hint disappears after 5 seconds
  };
  
  const handleNodeDoubleClick = (node: FileSystemNode) => {
      if (node.type === NodeType.DIRECTORY) {
          handleAction(() => cd(node.name));
      } else {
          setViewingFile(node);
          checkCompletion(); // Check completion after viewing a file
      }
  };
  
  const handleCreate = (name: string) => {
    if (prompt.type === 'file') {
        handleAction(() => touch(name));
    } else {
        handleAction(() => mkdir(name));
    }
    setPrompt({ type: 'file', visible: false });
  };


  return (
    <div className="font-sans min-h-screen flex flex-col p-4 gap-4">
      <header className="text-center relative">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-wider">
          File System <span className="text-primary">Escape</span>
        </h1>
        <p className="text-gray-500 dark:text-brand-muted">Learn file management by solving puzzles in this interactive GUI.</p>
        <button
          onClick={toggleTheme}
          className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </header>
      <main className="flex-grow flex flex-col md:flex-row gap-4 min-h-0">
        <div className="w-full mx-auto max-w-4xl flex flex-col gap-4">
            <TaskDisplay task={currentTask} onHint={handleGetHint} onUndo={undo} canUndo={canUndo} />
            {hint && <div className="bg-primary/10 border border-primary text-primary dark:text-white p-3 rounded-lg">{hint}</div>}
            <FileSystemGUI 
                nodes={ls()}
                path={currentPath}
                onNodeDoubleClick={handleNodeDoubleClick}
                onGoToPath={(path) => handleAction(() => goToPath(path))}
                onRequestDelete={(node) => handleAction(() => rm(node.name))}
                onRequestCreateFile={() => setPrompt({type: 'file', visible: true})}
                onRequestCreateFolder={() => setPrompt({type: 'folder', visible: true})}
            />
        </div>
      </main>
      {taskCompleted && <SuccessOverlay message={currentTask.successMessage} onNext={handleNextTask} />}
      {viewingFile && <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />}
      {prompt.visible && <InputPromptModal title={`Create New ${prompt.type === 'file' ? 'File' : 'Folder'}`} onClose={() => setPrompt({type: 'file', visible: false})} onSubmit={handleCreate} />}
    </div>
  );
}
