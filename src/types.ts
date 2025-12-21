export interface Position {
  x: number;
  y: number;
}

export interface NestedBlock {
  content: string;
  values: (string | NestedBlock)[];
}

export interface BlockData {
  id: string;
  type: 'math' | 'input';
  content: string;
  values?: (string | NestedBlock)[];
  position: Position;
  width?: number;
}

export interface PaletteItem {
  id: string;
  type?: 'math' | 'input';
  label: string;
  latex: string;
  description: string;
  defaultValues?: string[];
}
