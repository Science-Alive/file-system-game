import React, { useState, useEffect } from 'react';
import { FileSystemNode, NodeType } from '../types';

const FolderIcon = ({ large = false }: { large?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`${large ? 'h-16 w-16' : 'h-5 w-5' } text-brand-folder`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
  </svg>
);

const FileIcon = ({ large = false }: { large?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`${large ? 'h-16 w-16' : 'h-5 w-5' } text-brand-muted`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const ContextMenu: React.FC<{
    x: number; y: number; onOutsideClick: () => void;
    actions: { label: string; onClick: () => void; }[];
}> = ({ x, y, onOutsideClick, actions }) => {
    useEffect(() => {
        document.addEventListener('click', onOutsideClick);
        return () => document.removeEventListener('click', onOutsideClick);
    }, [onOutsideClick]);
    
    return (
        <div className="fixed bg-white dark:bg-brand-background border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 text-gray-800 dark:text-white" style={{ top: y, left: x }}>
            <ul className="py-1">
                {actions.map(action => (
                    <li key={action.label} onClick={action.onClick} className={`px-4 py-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer ${action.label === 'Delete' ? 'text-secondary' : ''}`}>
                        {action.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};


const Breadcrumbs: React.FC<{ path: string; onGoToPath: (path: string) => void; }> = ({ path, onGoToPath }) => {
    const parts = path.split('/').filter(p => p);
    
    return (
        <div className="flex items-center text-gray-500 dark:text-brand-muted text-lg mb-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
            {parts.map((part, index) => {
                const currentPath = parts.slice(0, index + 1).join('/');
                return (
                    <React.Fragment key={currentPath}>
                        <span onClick={() => onGoToPath(currentPath)} className="cursor-pointer hover:text-primary">{part}</span>
                        {index < parts.length -1 && <span className="mx-2">/</span>}
                    </React.Fragment>
                )
            })}
        </div>
    );
};


export const FileSystemGUI: React.FC<{
    nodes: FileSystemNode[];
    path: string;
    onNodeDoubleClick: (node: FileSystemNode) => void;
    onGoToPath: (path: string) => void;
    onRequestDelete: (node: FileSystemNode) => void;
    onRequestCreateFile: () => void;
    onRequestCreateFolder: () => void;
}> = ({ nodes, path, onNodeDoubleClick, onGoToPath, onRequestDelete, onRequestCreateFile, onRequestCreateFolder }) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; target: FileSystemNode | null }>({ x: 0, y: 0, visible: false, target: null });

    const handleContextMenu = (e: React.MouseEvent, target: FileSystemNode | null = null) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, visible: true, target });
    };

    const closeContextMenu = () => setContextMenu({ ...contextMenu, visible: false });

    let menuActions = [
        { label: 'New Folder', onClick: () => { onRequestCreateFolder(); closeContextMenu(); } },
        { label: 'New File', onClick: () => { onRequestCreateFile(); closeContextMenu(); } },
    ];
    if (contextMenu.target) {
        menuActions = [{ label: 'Delete', onClick: () => { onRequestDelete(contextMenu.target!); closeContextMenu(); } }];
    }
    
    return (
        <div 
            className="bg-white dark:bg-brand-background border border-gray-200 dark:border-primary/30 rounded-lg p-4 font-mono text-sm text-gray-800 dark:text-brand-text overflow-auto h-[500px] shadow-lg relative"
            onContextMenu={(e) => handleContextMenu(e)}
        >
            <Breadcrumbs path={path} onGoToPath={onGoToPath} />

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                 {nodes.length === 0 && <div className="col-span-full text-center text-gray-500 dark:text-brand-muted mt-8">Directory is empty</div>}
                {nodes.map(node => (
                    <div 
                        key={node.name} 
                        className="flex flex-col items-center p-2 rounded-md hover:bg-primary/10 cursor-pointer"
                        onDoubleClick={() => onNodeDoubleClick(node)}
                        onContextMenu={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, node);
                        }}
                    >
                        {node.type === NodeType.DIRECTORY ? <FolderIcon large /> : <FileIcon large />}
                        <span className="mt-2 text-center break-all">{node.name}</span>
                    </div>
                ))}
            </div>

            {contextMenu.visible && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    onOutsideClick={closeContextMenu}
                    actions={menuActions}
                />
            )}
        </div>
    );
};