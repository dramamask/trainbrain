import { TrackPieceCategory } from "trainbrain-shared";
import StraightL300 from "@/app/react/tracklayout/regular/symbols/straight-l300";
import CurveR600A30 from "@/app/react/tracklayout/regular/symbols/curve-r600-a30";
import SwitchR600A30L300 from "@/app/react/tracklayout/regular/symbols/switch-r600-a30-l300";
import * as config from "@/app/config/config";

const CURVE = "curve";
const STRAIGHT = "straight";
const SWITCH = "switch";

const iconWorldHeight = 320;
const iconWorldWidth = 313;

interface props {
  category: TrackPieceCategory;
}

/**
 * Render a piece icon form the track piece def list (where user's click to add a piece to the layout)
 */
export default function PieceDefIcon({category}: props) {
  return (
    <svg
      height="100%"
      width="100%"
      viewBox={`0 0 ${iconWorldWidth} ${iconWorldHeight}`}
      preserveAspectRatio="xMinYMax slice"
    >
      <g transform={`translate(0 ${iconWorldHeight}) scale(1 -1)`}>
        {(category == STRAIGHT) && getStraight()}
        {(category == CURVE) && getCurve()}
        {(category == SWITCH) && getSwitch()}
      </g>
    </svg>
  )
}

function getStraight() {
  return (
    <>
      <defs>
        <StraightL300 />
      </defs>
      <use
        href="#straightL300"
        height={300}
        width={88}
        style={{
          "--rail-color": config.RAIL_COLOR,
          "--rail-width": config.RAIL_WIDTH,
          "--sleeper-color": config.SLEEPER_COLOR,
          "--sleeper-width": config.SLEEPER_WIDTH,
        } as React.CSSProperties }
        transform={`translate(${iconWorldWidth / 2} 0) translate(-44 10)`}
      />
    </>
  )
}

function getCurve() {
  return (
    <>
      <defs>
        <CurveR600A30 />
      </defs>
      <use
        href="#curveR600A30"
        height={313}
        width={644}
        style={{
          "--rail-color": config.RAIL_COLOR,
          "--rail-width": config.RAIL_WIDTH,
          "--sleeper-color": config.SLEEPER_COLOR,
          "--sleeper-width": config.SLEEPER_WIDTH,
        } as React.CSSProperties }
        transform={`translate(${iconWorldWidth / 2} 0) translate(-66 0) `}
      />
    </>
  )
}

function getSwitch() {
  return (
    <>
      <defs>
        <SwitchR600A30L300 />
      </defs>
      <use
        href="#switchR600A30L300"
        height={313}
        width={644}
        style={{
          "--rail-color": config.RAIL_COLOR,
          "--rail-width": config.RAIL_WIDTH,
          "--sleeper-color": config.SLEEPER_COLOR,
          "--sleeper-width": config.SLEEPER_WIDTH,
        } as React.CSSProperties }
        transform={`translate(${iconWorldWidth / 2} 0) translate(-66 0) `}
      />
    </>
  )
}