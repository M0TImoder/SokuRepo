export interface Position {
  x: number;
  y: number;
}

export interface BlockData {
  id: string;
  type: 'math' | 'input';
  content: string;
  position: Position;
  width?: number;
}

export interface PaletteItem {
  id: string;
  type?: 'math' | 'input';
  label: string;
  latex: string;
  description: string;
}
