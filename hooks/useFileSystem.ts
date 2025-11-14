import { useState, useCallback } from 'react';
import { Directory, File, FileSystemNode, NodeType } from '../types';
import { INITIAL_FILESYSTEM } from '../constants';

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const getNodeFromPath = (root: Directory, path: string): FileSystemNode | null => {
  if (path === '~' || path === '~/') return root;
  
  const parts = path.startsWith('~/') ? path.substring(2).split('/') : path.split('/');
  if (parts.length === 1 && parts[0] === '') return root;

  let currentNode: FileSystemNode = root;
  for (const part of parts) {
    if (currentNode.type === NodeType.DIRECTORY) {
      const child = currentNode.children[part];
      if (child) {
        currentNode = child;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  return currentNode;
};

export default function useFileSystem() {
  const [fs, setFs] = useState<Directory>(deepClone(INITIAL_FILESYSTEM));
  const [currentPath, setCurrentPath] = useState('~');
  const [history, setHistory] = useState<Directory[]>([]);

  const ls = useCallback((): FileSystemNode[] => {
    const node = getNodeFromPath(fs, currentPath);
    if (node && node.type === NodeType.DIRECTORY) {
      return Object.values(node.children)
        .sort((a, b) => (a.type === b.type) ? a.name.localeCompare(b.name) : (a.type === NodeType.DIRECTORY ? -1 : 1));
    }
    return [];
  }, [fs, currentPath]);

  const cd = useCallback((dirName: string) => {
    const newPath = currentPath === '~' ? `~/${dirName}` : `${currentPath}/${dirName}`;
    const node = getNodeFromPath(fs, newPath);
    if (node && node.type === NodeType.DIRECTORY) {
      setCurrentPath(newPath);
    }
  }, [currentPath, fs]);
  
  const goToPath = useCallback((path: string) => {
    const node = getNodeFromPath(fs, path);
    if (node && node.type === NodeType.DIRECTORY) {
      setCurrentPath(path);
    }
  }, [fs]);

  const mkdir = useCallback((name: string) => {
    if (!name) return;
    setFs(currentFs => {
      const newFs = deepClone(currentFs);
      const parentNode = getNodeFromPath(newFs, currentPath);
      if (parentNode && parentNode.type === NodeType.DIRECTORY && !parentNode.children[name]) {
        parentNode.children[name] = { name, type: NodeType.DIRECTORY, children: {} };
        setHistory(prev => [...prev, currentFs]);
        return newFs;
      }
      return currentFs;
    });
  }, [currentPath]);

  const touch = useCallback((name: string) => {
    if (!name) return;
    setFs(currentFs => {
      const newFs = deepClone(currentFs);
      const parentNode = getNodeFromPath(newFs, currentPath);
      if (parentNode && parentNode.type === NodeType.DIRECTORY && !parentNode.children[name]) {
        parentNode.children[name] = { name, type: NodeType.FILE, content: '' };
        setHistory(prev => [...prev, currentFs]);
        return newFs;
      }
      return currentFs;
    });
  }, [currentPath]);

  const rm = useCallback((name: string) => {
    setFs(currentFs => {
      const newFs = deepClone(currentFs);
      const parentNode = getNodeFromPath(newFs, currentPath);
      if (parentNode && parentNode.type === NodeType.DIRECTORY && parentNode.children[name]) {
        delete parentNode.children[name];
        setHistory(prev => [...prev, currentFs]);
        return newFs;
      }
      return currentFs;
    });
  }, [currentPath]);
  
  const undo = useCallback(() => {
    if (history.length === 0) return;

    const lastState = history[history.length - 1];
    setFs(lastState);

    // If current path no longer exists in the restored state, go to home directory
    const node = getNodeFromPath(lastState, currentPath);
    if (!node || node.type !== NodeType.DIRECTORY) {
        setCurrentPath('~');
    }

    setHistory(prevHistory => prevHistory.slice(0, -1));
  }, [history, currentPath]);

  const canUndo = history.length > 0;

  const cat = useCallback((fileName: string): string | null => {
      const nodePath = currentPath === '~' ? `~/${fileName}` : `${currentPath}/${fileName}`;
      const node = getNodeFromPath(fs, nodePath);
      if(node && node.type === NodeType.FILE) {
          return node.content;
      }
      return null;
  }, [fs, currentPath]);

  const reset = useCallback(() => {
    setFs(deepClone(INITIAL_FILESYSTEM));
    setCurrentPath('~');
    setHistory([]);
  }, []);

  return { fs, currentPath, ls, cd, mkdir, touch, rm, cat, goToPath, undo, canUndo, reset };
}
