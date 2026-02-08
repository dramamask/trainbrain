import { store as measureStore } from "@/app/services/stores/measure";
import { useSyncExternalStore } from "react";
import * as config from "@/app/config/config";

export default function Measure() {
  const measureState = useSyncExternalStore(measureStore.subscribe, measureStore.getSnapshot, measureStore.getServerSnapshot);

  if (!measureState.enabled) {
    return false;
  }

  const pos1 = measureState.pos1;
  const pos2 = measureState.pos2;
  return (
    <>
      { pos1 &&
        <line
            x1={pos1.x}
            y1={pos1.y - (config.MEASURE_LINE_HEIGHT / 2)}
            x2={pos1.x}
            y2={pos1.y + (config.MEASURE_LINE_HEIGHT / 2)}
            stroke={config.MEASURE_COLOR}
            strokeWidth={config.MEASURE_STROKE_WIDTH}
        />
      }
      { pos2 &&
        <line
            x1={pos2.x}
            y1={pos2.y - (config.MEASURE_LINE_HEIGHT / 2)}
            x2={pos2.x}
            y2={pos2.y + (config.MEASURE_LINE_HEIGHT / 2)}
            stroke={config.MEASURE_COLOR}
            strokeWidth={config.MEASURE_STROKE_WIDTH}
        />
      }
      { pos1 && pos2 &&
        <line
            x1={pos1.x}
            y1={pos1.y}
            x2={pos2.x}
            y2={pos2.y}
            stroke={config.MEASURE_COLOR}
            strokeWidth={config.MEASURE_STROKE_WIDTH}
        />
      }
    </>
  )
}
