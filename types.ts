
export interface Position {
  x: number;
  y: number;
}

export interface BlockData {
  id: string;
  type: 'math' | 'input'; // Added input type
  content: string; // The LaTeX string or text content
  position: Position;
  width?: number; // Optional width for resizing later
}

export interface PaletteItem {
  id: string;
  type?: 'math' | 'input'; // Optional type, defaults to math
  label: string;
  latex: string;
  description: string;
}
