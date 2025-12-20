import React, { useState, useRef, useEffect } from 'react';
import type { BlockData } from '../types';
import { MathRender } from './MathRender';
import { GripVertical, X, Pencil } from 'lucide-react';

interface DraggableBlockProps {
  block: BlockData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onUpdateContent: (id: string, newContent: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  isSelected,
  onSelect,
  onDelete,
  onUpdateContent,
  onDragStart,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<'quick' | 'full'>('full');
  
  const [tempContent, setTempContent] = useState(block.content);
  const [prevBlockContent, setPrevBlockContent] = useState(block.content);

  if (block.content !== prevBlockContent) {
    setPrevBlockContent(block.content);
    if (!isEditing) {
      setTempContent(block.content);
    }
  }
  
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (editMode === 'quick' && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      } else if (editMode === 'full' && textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [isEditing, editMode]);

  const handleSave = () => {
    onUpdateContent(block.id, tempContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent(block.content);
    setIsEditing(false);
  };

  const startEditing = (mode: 'quick' | 'full') => {
    setEditMode(mode);
    setTempContent(block.content);
    setIsEditing(true);
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    onSelect();
  };

  const handleBlockDoubleClick = (e: React.MouseEvent) => {
      if (isEditing) return;
      e.stopPropagation();
      startEditing(block.type === 'input' ? 'quick' : 'full');
  };

  const borderClass = isEditing 
    ? 'border-solid border-blue-500 shadow-xl' 
    : isSelected
        ? 'border-solid border-blue-500 shadow-md z-40'
        : 'border-dashed border-slate-400 hover:border-blue-400';

  const bgClass = isEditing ? 'bg-white z-50' : 'bg-white/90';
  const cursorClass = isEditing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing';

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, block.id)}
      onClick={handleBlockClick}
      onDoubleClick={handleBlockDoubleClick}
      className={`absolute group backdrop-blur-sm transition-colors transition-shadow duration-200 border-2 rounded-lg select-none ${borderClass} ${bgClass} ${cursorClass}`}
      style={{
        left: block.position.x,
        top: block.position.y,
        minWidth: '150px',
        minHeight: '60px',
      }}
    >
      <div 
        className={`absolute -top-4 left-0 right-0 flex justify-center gap-1 transition-opacity ${
            isEditing || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
         <div className="bg-slate-800 text-white rounded-full px-2 py-1 flex items-center gap-2 shadow-md text-xs z-50">
            <GripVertical className="w-3 h-3 cursor-grab active:cursor-grabbing" />
            {!isEditing && (
                <button 
                    onClick={(e) => { e.stopPropagation(); startEditing('full'); }} 
                    className="hover:text-blue-300"
                    title="編集 (LaTeX)"
                >
                    <Pencil className="w-3 h-3" />
                </button>
            )}
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} 
                className="hover:text-red-300"
                title="削除"
            >
                <X className="w-3 h-3" />
            </button>
         </div>
      </div>

      <div className="p-2 flex items-center justify-center h-full w-full min-h-[60px]">
        {isEditing ? (
            editMode === 'quick' ? (
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full h-full bg-transparent text-center text-xl font-mono outline-none text-slate-800 placeholder-slate-300"
                    value={tempContent}
                    onChange={(e) => setTempContent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                    onBlur={handleSave}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0"
                />
            ) : (
                <div className="flex flex-col gap-2 w-64" onClick={(e) => e.stopPropagation()}>
                    <textarea
                        ref={textareaRef}
                        className="w-full h-24 p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white resize-none text-slate-800"
                        value={tempContent}
                        onChange={(e) => setTempContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSave();
                            }
                            if (e.key === 'Escape') handleCancel();
                        }}
                        placeholder="LaTeXを入力..."
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleCancel}
                            className="text-xs px-3 py-1 text-slate-600 hover:bg-slate-200 rounded"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            完了
                        </button>
                    </div>
                </div>
            )
        ) : (
            <div className="pointer-events-none w-full text-center">
                {block.content ? (
                    <MathRender latex={block.content} />
                ) : (
                     <span className="text-slate-300 text-lg font-mono select-none">...</span>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
