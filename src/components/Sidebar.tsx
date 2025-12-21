import React, { useState } from 'react';
import type { PaletteItem } from '../types';
import { INITIAL_PALETTE_ITEMS, ADVANCED_PALETTE_ITEMS } from '../constants';
import { MathRender } from './MathRender';
import { GripHorizontal } from 'lucide-react';

interface SidebarProps {
  onDragStart: (e: React.DragEvent, item: PaletteItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  const [mode, setMode] = useState<'sample' | 'advanced'>('sample');

  const itemsToRender = mode === 'sample' ? INITIAL_PALETTE_ITEMS : ADVANCED_PALETTE_ITEMS;

  const getPreviewLatex = (latex: string) => {
    return latex.replace(
      /<<\s*\d+\s*>>/g, 
      '\\htmlClass{math-slot-preview}{\\color{transparent}{00}}'
    );
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20 h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-semibold text-slate-700">パレット</h2>
        
        <div className="flex p-1 bg-slate-200 rounded-lg mt-3">
          <button
            onClick={() => setMode('sample')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'sample'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sample
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'advanced'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {itemsToRender.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="group relative bg-white border border-slate-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <GripHorizontal className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
              </div>

              <div className="bg-slate-50 rounded p-2 flex justify-center items-center border border-slate-100 pointer-events-none min-h-[3rem]">
                {item.latex ? (
                     <MathRender latex={getPreviewLatex(item.latex)} className="text-sm" />
                ) : (
                     <span className="text-slate-400 font-mono bg-white px-2 py-1 rounded border border-dashed border-slate-300 text-xs">
                       [ 数値 ]
                     </span>
                )}
              </div>

              <p className="text-[10px] text-slate-400 mt-2">{item.description}</p>
            </div>
          ))}
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
        <p className="text-xs text-slate-400">SokuRepo Tool v1.0</p>
      </div>
    </aside>
  );
};
