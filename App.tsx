import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DraggableBlock } from './components/DraggableBlock';
import { BlockData, PaletteItem } from './types';
import { GRID_SIZE } from './constants';
import { FileText, Grid3X3, Download } from 'lucide-react';

export default function App() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  const dragItemRef = useRef<PaletteItem | null>(null);
  const dragBlockIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedBlockId) return;

      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );

      if (isInputActive) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteBlock(selectedBlockId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId]);

  const handleSidebarDragStart = (e: React.DragEvent, item: PaletteItem) => {
    dragItemRef.current = item;
    dragBlockIdRef.current = null;
    dragOffsetRef.current = { x: 0, y: 0 };
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleBlockDragStart = (e: React.DragEvent, id: string) => {
    dragBlockIdRef.current = id;
    dragItemRef.current = null;
    setSelectedBlockId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);

    if (e.currentTarget instanceof Element) {
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let rawX = e.clientX - rect.left + canvasRef.current.scrollLeft;
    let rawY = e.clientY - rect.top + canvasRef.current.scrollTop;

    if (dragBlockIdRef.current) {
        rawX -= dragOffsetRef.current.x;
        rawY -= dragOffsetRef.current.y;
    }

    const snappedX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;

    const draggedItem = dragItemRef.current;
    const draggedBlockId = dragBlockIdRef.current;

    if (draggedItem) {
      const newId = crypto.randomUUID();
      const newItem: BlockData = {
        id: newId,
        type: draggedItem.type || 'math',
        content: draggedItem.latex,
        position: { x: snappedX, y: snappedY },
      };
      setBlocks((prev) => [...prev, newItem]);
      setSelectedBlockId(newId);
      dragItemRef.current = null;
    } 
    else if (draggedBlockId) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === draggedBlockId
            ? { ...b, position: { x: snappedX, y: snappedY } }
            : b
        )
      );
      dragBlockIdRef.current = null;
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragItemRef.current ? 'copy' : 'move';
  };

  const updateBlockContent = (id: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b))
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const handleCanvasClick = () => {
    setSelectedBlockId(null);
  };

  const handleDownload = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blocks, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "sokurepo_layout.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStartRef.current || !scrollContainerRef.current) return;
    
    e.preventDefault();
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    scrollContainerRef.current.scrollLeft -= dx;
    scrollContainerRef.current.scrollTop -= dy;

    panStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  const gridBackgroundStyle: React.CSSProperties = {
    backgroundColor: '#f4f4f4',
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,.7) 0 0),
      linear-gradient(to bottom, rgba(0,0,0,.7) 0 0),
      repeating-linear-gradient(to right, rgba(0,0,0,.18) 0, rgba(0,0,0,.18) 2px, transparent 2px, transparent 100px),
      repeating-linear-gradient(to bottom, rgba(0,0,0,.18) 0, rgba(0,0,0,.18) 2px, transparent 2px, transparent 100px),
      repeating-linear-gradient(to right, rgba(0,0,0,.08) 0, rgba(0,0,0,.08) 1px, transparent 1px, transparent 20px),
      repeating-linear-gradient(to bottom, rgba(0,0,0,.08) 0, rgba(0,0,0,.08) 1px, transparent 1px, transparent 20px)
    `,
    backgroundSize: `
      2px 100%,
      100% 2px,
      100px 100px,
      100px 100px,
      20px 20px,
      20px 20px
    `,
    backgroundPosition: '0 0',
    backgroundRepeat: 'no-repeat, no-repeat, repeat, repeat, repeat, repeat',
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white text-slate-800 font-sans">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-white">
            <FileText size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">SokuRepo</h1>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                <Grid3X3 size={16} />
                <span>スナップ: {GRID_SIZE}px</span>
             </div>
             <button 
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
             >
                <Download size={16} />
                JSON出力
             </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div 
            ref={scrollContainerRef}
            className={`flex-1 relative overflow-auto bg-slate-50 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                ref={canvasRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleCanvasClick}
                className="min-w-[2000px] min-h-[2000px] relative"
                style={gridBackgroundStyle}
            >
                {blocks.map((block) => (
                    <DraggableBlock
                        key={block.id}
                        block={block}
                        isSelected={block.id === selectedBlockId}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onDelete={deleteBlock}
                        onUpdateContent={updateBlockContent}
                        onDragStart={handleBlockDragStart}
                    />
                ))}
                
                {blocks.length === 0 && (
                    <div className="absolute top-10 left-10 pointer-events-none opacity-40 select-none">
                        <h3 className="text-3xl font-bold text-slate-400">キャンバスエリア</h3>
                        <p className="text-slate-500 mt-2 text-lg">右のパレットからアイテムをドラッグして配置してください</p>
                    </div>
                )}
            </div>
        </div>

        <Sidebar onDragStart={handleSidebarDragStart} />

      </main>
    </div>
  );
}
