import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DraggableBlock } from './components/DraggableBlock';
import { BlockData, PaletteItem } from './types';
import { GRID_SIZE } from './constants';
import { FileText, Grid3X3, Download } from 'lucide-react';

export default function App() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  
  // Drag state tracking
  const dragItemRef = useRef<PaletteItem | null>(null);
  const dragBlockIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // -- Global Keyboard Events (Delete/Backspace) --
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedBlockId) return;

      // Do not delete if the user is typing in an input/textarea
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );

      if (isInputActive) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault(); // Prevent browser back navigation
        deleteBlock(selectedBlockId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId]);

  // -- Zoom Logic (Ctrl + Wheel) --
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        // Use a small factor for smooth zooming
        const factor = 0.001; 
        
        setScale((prev) => {
           // Basic zoom calculation
           const newScale = prev + delta * factor;
           // Clamp between 0.1 and 5
           return Math.max(0.1, Math.min(newScale, 5));
        });
      }
    };

    // Passive: false is required to prevent browser's default zoom
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
       container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // -- Drag & Drop Logic --

  // 1. Start dragging from Sidebar
  const handleSidebarDragStart = (e: React.DragEvent, item: PaletteItem) => {
    dragItemRef.current = item;
    dragBlockIdRef.current = null;
    dragOffsetRef.current = { x: 0, y: 0 };
    e.dataTransfer.effectAllowed = 'copy';
    // Essential for Firefox to allow dragging
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  // 2. Start dragging existing block on Canvas
  const handleBlockDragStart = (e: React.DragEvent, id: string) => {
    dragBlockIdRef.current = id;
    dragItemRef.current = null;
    setSelectedBlockId(id); // Select automatically when starting to drag
    e.dataTransfer.effectAllowed = 'move';
    // Essential for Firefox to allow dragging
    e.dataTransfer.setData('text/plain', id);

    // Use currentTarget to get the Block's element, not the inner target (like the grip icon)
    if (e.currentTarget instanceof Element) {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate offset in visual coordinates
        dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
  };

  // 3. Drop on Canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate visual position relative to the canvas top-left
    const visualX = e.clientX - rect.left;
    const visualY = e.clientY - rect.top;

    let targetVisualX = visualX;
    let targetVisualY = visualY;

    // Apply offset if moving an existing block
    if (dragBlockIdRef.current) {
        targetVisualX -= dragOffsetRef.current.x;
        targetVisualY -= dragOffsetRef.current.y;
    }

    // Convert visual position to logical position by dividing by scale
    const logicalX = targetVisualX / scale;
    const logicalY = targetVisualY / scale;

    const snappedX = Math.round(logicalX / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(logicalY / GRID_SIZE) * GRID_SIZE;

    // CRITICAL FIX: Capture the current refs into local variables.
    // Inside the setBlocks callback, the ref might have already been reset to null.
    const draggedItem = dragItemRef.current;
    const draggedBlockId = dragBlockIdRef.current;

    if (draggedItem) {
      // Handle creation based on palette item type
      const newId = crypto.randomUUID();
      const newItem: BlockData = {
        id: newId,
        type: draggedItem.type || 'math',
        content: draggedItem.latex,
        position: { x: snappedX, y: snappedY },
      };
      setBlocks((prev) => [...prev, newItem]);
      setSelectedBlockId(newId); // Select the new block
      dragItemRef.current = null;
    } 
    else if (draggedBlockId) {
      // Update existing block position
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === draggedBlockId
            ? { ...b, position: { x: snappedX, y: snappedY } }
            : b
        )
      );
      dragBlockIdRef.current = null;
    }
  }, [scale]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragItemRef.current ? 'copy' : 'move';
  };

  // -- Block Management --

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

  // Deselect when clicking the background canvas
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
                onClick={handleCanvasClick} // Background click deselects
                className="min-w-[2000px] min-h-[2000px] relative transition-transform duration-75 origin-top-left"
                style={{
                    ...gridBackgroundStyle,
                    transform: `scale(${scale})`
                }}
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
