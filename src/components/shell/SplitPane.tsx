import { useRef, useState, useCallback, type ReactNode, type MouseEvent } from "react";

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
}

export function SplitPane({ left, right, initialSize = 280, minSize = 160, maxSize = 480 }: SplitPaneProps) {
  const [leftSize, setLeftSize] = useState(initialSize);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startSize = useRef(0);

  const onMouseDown = useCallback((e: MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startSize.current = leftSize;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [leftSize]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - startX.current;
    const newSize = Math.min(maxSize, Math.max(minSize, startSize.current + delta));
    setLeftSize(newSize);
  }, [minSize, maxSize]);

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  return (
    <div
      className="flex flex-1 overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{ width: leftSize, minWidth: minSize, maxWidth: maxSize }} className="overflow-hidden flex-shrink-0">
        {left}
      </div>

      <div
        onMouseDown={onMouseDown}
        className="w-[5px] cursor-col-resize flex-shrink-0 relative hover:bg-accent transition-colors active:bg-accent"
        style={{ marginLeft: 0, marginRight: 0 }}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-border" />
      </div>

      <div className="flex-1 overflow-hidden">
        {right}
      </div>
    </div>
  );
}
