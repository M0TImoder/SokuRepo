import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { BlockData, NestedBlock, PaletteItem } from '../types';
import { MathRender } from './MathRender';
import { GripVertical, X, Pencil } from 'lucide-react';

interface DraggableBlockProps {
  block: BlockData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onUpdateContent: (id: string, newContent: string) => void;
  onUpdateValues: (id: string, newValues: (string | NestedBlock)[]) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const renderRecursiveLatex = (
    content: string, 
    values: (string | NestedBlock)[] | undefined, 
    path: number[] = []
): string => {
  if (!values || !Array.isArray(values)) return content;

  let latex = content;
  values.forEach((val, idx) => {
    const currentPath = [...path, idx];
    const pathStr = currentPath.join('-');
    const regex = new RegExp(`<<\\s*${idx}\\s*>>`, 'g');

    if (typeof val === 'string') {
        const displayVal = val || '\\color{transparent}{00}'; 
        const classNames = val ? 'math-slot' : 'math-slot math-slot-empty';
        latex = latex.replace(regex, () => 
            `\\htmlClass{${classNames} slot-id-${pathStr}}{${displayVal}}`
        );
    } else if (val && typeof val === 'object') {
        const innerLatex = renderRecursiveLatex(val.content, val.values, currentPath);
        latex = latex.replace(regex, () => innerLatex);
    }
  });
  return latex;
};

const updateNestedValue = (
    values: (string | NestedBlock)[], 
    path: number[], 
    newValue: string | NestedBlock
): (string | NestedBlock)[] => {
    const idx = path[0];
    if (idx < 0 || idx >= values.length) return values;

    if (path.length === 1) {
        const newArr = [...values];
        newArr[idx] = newValue;
        return newArr;
    }
    
    const newArr = [...values];
    const target = newArr[idx];
    
    if (target && typeof target !== 'string') {
        newArr[idx] = {
            ...target,
            values: updateNestedValue(target.values, path.slice(1), newValue)
        };
    }
    return newArr;
};

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  isSelected,
  onSelect,
  onDelete,
  onUpdateContent,
  onUpdateValues,
  onDragStart,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<'quick' | 'full'>('full');
  
  const [editingPath, setEditingPath] = useState<number[] | null>(null);
  const [slotRect, setSlotRect] = useState<DOMRect | null>(null);
  const [slotValue, setSlotValue] = useState('');
  
  const [tempContent, setTempContent] = useState(block.content);
  const [prevBlockContent, setPrevBlockContent] = useState(block.content);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slotInputRef = useRef<HTMLInputElement>(null);

  if (block.content !== prevBlockContent) {
    setPrevBlockContent(block.content);
    if (!isEditing) {
      setTempContent(block.content);
    }
  }
  
  const isTemplateBlock = Array.isArray(block.values);

  const displayLatex = useMemo(() => {
    if (!isTemplateBlock || !block.values) return block.content;
    try {
        return renderRecursiveLatex(block.content, block.values);
    } catch (e) {
        console.error("Render error", e);
        return "\\text{Error}";
    }
  }, [block.content, block.values, isTemplateBlock]);

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

  useEffect(() => {
    if (editingPath && slotInputRef.current) {
      slotInputRef.current.focus();
      slotInputRef.current.select();
    }
  }, [editingPath]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isTemplateBlock || isEditing) return;

    const getSlotElement = (target: EventTarget | null): HTMLElement | null => {
        if (!target) return null;
        let el = target as HTMLElement;
        if (el.nodeType === Node.TEXT_NODE) {
            el = el.parentElement as HTMLElement;
        }
        return el.closest('.math-slot');
    };

    const handleSlotClick = (e: MouseEvent) => {
      const slotElement = getSlotElement(e.target);
      if (slotElement) {
        e.stopPropagation();
        const classes = slotElement.className.split(' ');
        const slotIdClass = classes.find(c => c.startsWith('slot-id-'));
        
        if (slotIdClass) {
          const pathStr = slotIdClass.replace('slot-id-', '');
          const path = pathStr.split('-').map(n => parseInt(n, 10));
          
          let currentValues: (string | NestedBlock)[] | undefined = block.values;
          let targetValue = '';
          let isValid = true;
          
          for (let i = 0; i < path.length - 1; i++) {
             const item: string | NestedBlock | undefined = currentValues?.[path[i]];
             if (item && typeof item !== 'string') {
                 currentValues = item.values;
             } else {
                 isValid = false;
                 break;
             }
          }
          
          if (isValid && currentValues) {
             const lastIdx = path[path.length - 1];
             const lastItem = currentValues[lastIdx];
             if (typeof lastItem === 'string') targetValue = lastItem;
             
             setEditingPath(path);
             setSlotRect(slotElement.getBoundingClientRect());
             setSlotValue(targetValue);
          }
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
        if (getSlotElement(e.target)) {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'copy';
            }
        }
    };

    const handleDrop = (e: DragEvent) => {
        const slotElement = getSlotElement(e.target);
        if (!slotElement) return;

        e.preventDefault();
        e.stopPropagation();

        if (!block.values || !e.dataTransfer) return;

        const jsonData = e.dataTransfer.getData('application/json');
        if (!jsonData) return;

        try {
            const item: PaletteItem = JSON.parse(jsonData);
            const classes = slotElement.className.split(' ');
            const slotIdClass = classes.find(c => c.startsWith('slot-id-'));
            
            if (slotIdClass) {
                const pathStr = slotIdClass.replace('slot-id-', '');
                const path = pathStr.split('-').map(n => parseInt(n, 10));

                const newNestedBlock: NestedBlock = {
                    content: item.latex,
                    values: item.defaultValues ? [...item.defaultValues] : []
                };

                const newValues = updateNestedValue(block.values, path, newNestedBlock);
                onUpdateValues(block.id, newValues);
            }
        } catch (err) {
            console.error('Drop processing error:', err);
        }
    };

    container.addEventListener('click', handleSlotClick);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('click', handleSlotClick);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [isTemplateBlock, isEditing, block.values, block.id, onUpdateValues]);

  const handleSave = () => {
    onUpdateContent(block.id, tempContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent(block.content);
    setIsEditing(false);
  };

  const startEditing = (mode: 'quick' | 'full') => {
    if (isTemplateBlock) return;
    setEditMode(mode);
    setTempContent(block.content);
    setIsEditing(true);
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    if (isEditing || editingPath) return;
    e.stopPropagation();
    onSelect();
  };

  const handleBlockDoubleClick = (e: React.MouseEvent) => {
      if (isEditing || editingPath) return;
      e.stopPropagation();
      startEditing(block.type === 'input' ? 'quick' : 'full');
  };

  const handleSlotSave = () => {
    if (editingPath !== null && block.values) {
      const newValues = updateNestedValue(block.values, editingPath, slotValue);
      onUpdateValues(block.id, newValues);
      setEditingPath(null);
      setSlotRect(null);
    }
  };

  const borderClass = isEditing || editingPath
    ? 'border-solid border-blue-500 shadow-xl' 
    : isSelected
        ? 'border-solid border-blue-500 shadow-md z-40'
        : 'border-dashed border-slate-400 hover:border-blue-400';

  const bgClass = (isEditing || editingPath) ? 'bg-white z-50' : 'bg-white/90';
  const cursorClass = (isEditing || editingPath) ? 'cursor-default' : 'cursor-grab active:cursor-grabbing';

  return (
    <>
      <div
        ref={containerRef}
        draggable={!isEditing && !editingPath}
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
              isEditing || isSelected || editingPath ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
           <div className="bg-slate-800 text-white rounded-full px-2 py-1 flex items-center gap-2 shadow-md text-xs z-50">
              <GripVertical className="w-3 h-3 cursor-grab active:cursor-grabbing" />
              {!isEditing && !isTemplateBlock && (
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
              <div className="w-full text-center">
                  {displayLatex ? (
                      <MathRender latex={displayLatex} />
                  ) : (
                       <span className="text-slate-300 text-lg font-mono select-none">...</span>
                  )}
              </div>
          )}
        </div>
      </div>

      {editingPath && slotRect && (
        <div 
          className="fixed z-[100]"
          style={{
            left: slotRect.left,
            top: slotRect.top,
            width: Math.max(slotRect.width, 40),
            height: slotRect.height
          }}
        >
          <input
            ref={slotInputRef}
            type="text"
            className="w-full h-full bg-white border border-blue-500 rounded shadow-lg text-center font-mono outline-none text-xs px-1 min-w-[40px]"
            value={slotValue}
            onChange={(e) => setSlotValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSlotSave();
              if (e.key === 'Escape') {
                  setEditingPath(null);
                  setSlotRect(null);
              }
            }}
            onBlur={handleSlotSave}
          />
        </div>
      )}
    </>
  );
};
