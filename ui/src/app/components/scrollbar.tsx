import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';

type Orientation = 'vertical' | 'horizontal';

interface ScrollbarProps {
  orientation?: Orientation;
  onScrollPercentage: (percentage: number) => void;
  trackStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  thumbSize?: number; // Pixels
}

const StandaloneScrollbar: React.FC<ScrollbarProps> = ({
  orientation = 'vertical',
  onScrollPercentage,
  trackStyle,
  thumbStyle,
  thumbSize = 40,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === 'vertical';

  const calculatePercentage = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();

    // Calculate position relative to track
    const pos = isVertical ? e.clientY - rect.top : e.clientX - rect.left;
    const total = isVertical ? rect.height : rect.width;

    // Clamp 0 to 1 and update
    const newFactor = Math.max(0, Math.min(1, pos / total));
    setPercentage(newFactor);
    onScrollPercentage(newFactor);
  }, [isVertical, onScrollPercentage]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        calculatePercentage(e);
        e.preventDefault();
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // React 19 supports cleanup functions in ref callbacks, but standard
    // useEffect cleanup is still preferred for window-level listeners.
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, calculatePercentage]);

  // Thumb position styling
  const thumbOffset = `calc(${percentage * 100}% - ${percentage * thumbSize}px)`;

  const defaultTrackStyle: CSSProperties = {
    position: 'relative',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    width: isVertical ? '14px' : '100%',
    height: isVertical ? '100%' : '14px',
    ...trackStyle,
  };

  const defaultThumbStyle: CSSProperties = {
    position: 'absolute',
    backgroundColor: '#888',
    borderRadius: '4px',
    width: isVertical ? '100%' : `${thumbSize}px`,
    height: isVertical ? `${thumbSize}px` : '100%',
    top: isVertical ? thumbOffset : 0,
    left: isVertical ? 0 : thumbOffset,
    transition: isDragging ? 'none' : 'top 0.1s, left 0.1s', // Smooth jump on click
    pointerEvents: 'none',
    ...thumbStyle,
  };

  return (
    <div
      ref={trackRef}
      style={defaultTrackStyle}
      onMouseDown={(e) => {
        setIsDragging(true);
        calculatePercentage(e);
      }}
    >
      <div style={defaultThumbStyle} />
    </div>
  );
};

export default StandaloneScrollbar;
