'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { GripVertical, Plus } from 'lucide-react';

type Point = { x: number; y: number };

export function MovableAddClient({ onAdd }: { onAdd: () => void }) {
  const [position, setPosition] = useState<Point | null>(null);
  const group = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointer: number; offset: Point } | null>(null);

  function clamp(point: Point): Point {
    const width = group.current?.offsetWidth ?? 155;
    const height = group.current?.offsetHeight ?? 46;
    return {
      x: Math.max(8, Math.min(point.x, window.innerWidth - width - 8)),
      y: Math.max(8, Math.min(point.y, window.innerHeight - height - 8)),
    };
  }

  useEffect(() => {
    function onResize() {
      setPosition(current => current ? clamp(current) : null);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    const bounds = group.current?.getBoundingClientRect();
    if (!bounds) return;
    drag.current = { pointer: event.pointerId, offset: { x: event.clientX - bounds.left, y: event.clientY - bounds.top } };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (active?.pointer !== event.pointerId) return;
    setPosition(clamp({ x: event.clientX - active.offset.x, y: event.clientY - active.offset.y }));
  }

  return (
    <div ref={group} className={`client-add-group${position ? ' is-positioned' : ''}`}
      style={position ? { left: position.x, top: position.y } : undefined}>
      <button type="button" className="client-board-primary" onClick={onAdd}><Plus size={17} /> Add client</button>
      <button type="button" className="client-add-grip" aria-label="Move Add client button. Use arrow keys to move or Home to reset."
        title="Drag to move · Home to reset" onPointerDown={start} onPointerMove={move}
        onLostPointerCapture={() => { drag.current = null; }}
        onKeyDown={event => {
          if (event.key === 'Home') {
            event.preventDefault();
            setPosition(null);
            return;
          }
          const offsets: Record<string, Point> = {
            ArrowLeft: { x: -16, y: 0 }, ArrowRight: { x: 16, y: 0 },
            ArrowUp: { x: 0, y: -16 }, ArrowDown: { x: 0, y: 16 },
          };
          const offset = offsets[event.key];
          if (!offset) return;
          event.preventDefault();
          const bounds = group.current?.getBoundingClientRect();
          if (bounds) setPosition(clamp({ x: bounds.left + offset.x, y: bounds.top + offset.y }));
        }}>
        <GripVertical size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
