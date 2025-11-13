
export enum NodeType {
  FILE = 'FILE',
  DIRECTORY = 'DIRECTORY',
}

export interface File {
  type: NodeType.FILE;
  name: string;
  content: string;
}

export interface Directory {
  type: NodeType.DIRECTORY;
  name: string;
  children: { [name: string]: FileSystemNode };
}

export type FileSystemNode = File | Directory;

export interface Task {
  title: string;
  description: string;
  validate: (fs: Directory, currentPath: string) => boolean;
  successMessage: string;
  hint: string;
}