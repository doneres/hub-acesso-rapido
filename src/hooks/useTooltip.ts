import { useState, useRef, useCallback } from 'react';
import { Tool, TooltipState } from '../types';

export function useTooltip() {
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    visible: false,
    tool: null,
    x: 0,
    y: 0,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingToolRef = useRef<Tool | null>(null);

  const handleMouseEnter = useCallback((tool: Tool) => {
    pendingToolRef.current = tool;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTooltipState(prev => ({
        ...prev,
        visible: true,
        tool: pendingToolRef.current,
      }));
    }, 450);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const tooltipW = 320;
    const tooltipH = 210;
    const offsetX = 16;
    const offsetY = 16;

    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;

    if (x + tooltipW > window.innerWidth) x = e.clientX - tooltipW - offsetX;
    if (y + tooltipH > window.innerHeight) y = e.clientY - tooltipH - offsetY;

    setTooltipState(prev => ({ ...prev, x, y }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingToolRef.current = null;
    setTooltipState(prev => ({ ...prev, visible: false }));
  }, []);

  return { tooltipState, handleMouseEnter, handleMouseMove, handleMouseLeave };
}
