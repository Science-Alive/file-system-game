import { Directory, NodeType, Task } from './types';
import { getNodeFromPath } from './hooks/useFileSystem';

export const INITIAL_FILESYSTEM: Directory = {
  name: '~',
  type: NodeType.DIRECTORY,
  children: {
    'projects': {
      name: 'projects',
      type: NodeType.DIRECTORY,
      children: {
        'game-engine': {
          name: 'game-engine',
          type: NodeType.DIRECTORY,
          children: {
             'README.md': { name: 'README.md', type: NodeType.FILE, content: 'Project setup instructions.' }
          }
        },
      }
    },
    'documents': {
        name: 'documents',
        type: NodeType.DIRECTORY,
        children: {
            'clue.txt': { name: 'clue.txt', type: NodeType.FILE, content: 'The next step is to create a secret vault. Make a new directory called "vault" inside your current directory (~/documents).' }
        }
    },
    'mystery_box': {
      name: 'mystery_box',
      type: NodeType.DIRECTORY,
      children: {}
    },
    'useless_file.txt': {
      name: 'useless_file.txt',
      type: NodeType.FILE,
      content: 'This file is not useful. You can delete it.'
    },
  },
};


export const TASKS: Task[] = [
  {
    title: "Task 1: The First Step",
    description: "Welcome, agent. Your mission begins in the 'documents' folder. Double-click it to enter.",
    validate: (fs, currentPath) => currentPath === '~/documents',
    successMessage: "Excellent. You're in. Now, let's find the first clue.",
    hint: "How do you usually open folders on a computer?",
  },
  {
    title: "Task 2: Find the Clue",
    description: "There's a file in this directory. Double-click 'clue.txt' to read it. It will tell you what to do next to complete this task.",
    validate: (fs, currentPath) => {
      const node = getNodeFromPath(fs, '~/documents/vault');
      return node?.type === NodeType.DIRECTORY;
    },
    successMessage: "Good work. A secure vault is essential for any secret agent.",
    hint: "You can view a file's contents by double-clicking it, just like opening a folder.",
  },
  {
    title: "Task 3: Plant the Secret",
    description: "Now, inside the new 'vault' directory, create a file named 'secrets.txt'. Right-click on an empty space and choose 'New File'.",
    validate: (fs, currentPath) => {
        const node = getNodeFromPath(fs, '~/documents/vault/secrets.txt');
        return node?.type === NodeType.FILE;
    },
    successMessage: "The secret is planted. But we need to cover our tracks.",
    hint: "Try right-clicking in an empty area to see your options for creating new things.",
  },
  {
    title: "Task 4: Clean Up",
    description: "There's a 'useless_file.txt' in the home directory ('~'). Navigate back there, then right-click the file and delete it.",
    validate: (fs, currentPath) => {
        const node = getNodeFromPath(fs, '~/useless_file.txt');
        return node === null;
    },
    successMessage: "No trace left behind. Your final task is to find your escape route.",
    hint: "Right-clicking on the file itself will show you actions you can take, like deleting it.",
  },
  {
    title: "Task 5: The Escape",
    description: "The escape route is hidden in the 'mystery_box' directory. Navigate into it and create a file called 'escape_plan.txt' to signal you are ready.",
     validate: (fs, currentPath) => {
        const node = getNodeFromPath(fs, '~/mystery_box/escape_plan.txt');
        return node?.type === NodeType.FILE;
    },
    successMessage: "Mission Accomplished! You've mastered the file system and successfully escaped. Congratulations!",
    hint: "Remember how you created a file before? The context menu is your friend.",
  }
];