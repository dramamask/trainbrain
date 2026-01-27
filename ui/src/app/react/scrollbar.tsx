import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';

import styles from "./scrollbar.module.css";

const LIGHT_COLOR = "#f0f0f0";
const DARK_COLOR = "#888888";

type Orientation = 'vertical' | 'horizontal';

interface ScrollbarProps {
  orientation?: Orientation;
  onScrollPercentage: (percentage: number) => void;
  disabled: boolean;
  thumbSize?: number; // Pixels
}

const StandaloneScrollbar: React.FC<ScrollbarProps> = ({
  orientation = 'vertical',
  onScrollPercentage,
  disabled,
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
      if (!disabled && isDragging ) {
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

  const trackStyle: CSSProperties = {
    width: isVertical ? '14px' : '100%',
    height: isVertical ? '100%' : '14px',
    backgroundColor: disabled ? DARK_COLOR : LIGHT_COLOR,
    cursor: disabled ? 'default' : 'pointer',
  };

  const thumbStyle: CSSProperties = {
    backgroundColor: DARK_COLOR,
    width: isVertical ? '100%' : `${thumbSize}px`,
    height: isVertical ? `${thumbSize}px` : '100%',
    top: isVertical ? thumbOffset : 0,
    left: isVertical ? 0 : thumbOffset,
    transition: isDragging ? 'none' : 'top 0.1s, left 0.1s', // Smooth jump on click
  };

  return (
    <div
      className={styles.track}
      ref={trackRef}
      style={trackStyle}
      onMouseDown={(e) => {
        setIsDragging(true);
        calculatePercentage(e);
      }}
    >
      <div
        className={styles.thumb}
        style={thumbStyle}
      />
    </div>
  );
};

export default StandaloneScrollbar;
