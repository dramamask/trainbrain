import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";

export default function startPosition({position}: {position: Coordinate}) {
  return (
   <g key="0">
    <circle
      cx={position.x}
      cy={position.y}
      r={config.START_POS_INDICATOR_RADIUS}
      fill={config.START_POS_INDICATOR_COLOR}
      stroke={config.START_POS_INDICATOR_COLOR}
      strokeWidth={1}
    />
   </g>
  )
}
