import React, { useState, useRef, useEffect, useCallback, CSSProperties, useSyncExternalStore } from 'react';
import { store as scrollStore } from "@/app/services/stores/scroll";

import styles from "./scrollbar.module.css";

const LIGHT_COLOR = "#f0f0f0";
const DARK_COLOR = "#888888";

const HORIZONTAL = 'horizontal';
const VERTICAL = 'vertical';
type Orientation = 'vertical' | 'horizontal';

interface props {
  orientation?: Orientation;
  disabled: boolean;
  thumbSize?: number; // Pixels
}

/**
 * Standalone Scrollbar React component
 */
export default function StandaloneScrollbar({orientation = 'vertical', disabled, thumbSize = 40}: props) {
  const scrollState = useSyncExternalStore(scrollStore.subscribe, scrollStore.getSnapshot, scrollStore.getServerSnapshot);

  // Scroll calculations
  const [isDragging, setIsDragging] = useState(false);
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
    if (orientation == HORIZONTAL) {
      scrollStore.setXScrollPos(newFactor * 100);
    } else {
      scrollStore.setYScrollPos(newFactor * 100);
    }
  }, [isVertical]);

  // Reset scrollbar position to 0 when the map is zoomed out all the way
  useEffect(() => {
    if (disabled) {
      if (orientation == HORIZONTAL) {
        scrollStore.setXScrollPos(0);
      } else {
        scrollStore.setYScrollPos(0);
      }
    }
  }, [disabled]);

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
  let percentage;
  if (orientation == HORIZONTAL) {
    percentage = scrollState.xScrollPercent;
  } else {
    percentage = scrollState.yScrollPercent;
  }
  const thumbOffset = `calc(${percentage}% - ${(percentage / 100) * thumbSize}px)`;

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
