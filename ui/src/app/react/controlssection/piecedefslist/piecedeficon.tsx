import { PieceDefData } from "trainbrain-shared";
import StraightL300 from "@/app/react/tracklayout/regular/symbols/straight-l300";
import CurveR600A30 from "@/app/react/tracklayout/regular/symbols/curve-r600-a30";
import SwitchR600A30L300 from "@/app/react/tracklayout/regular/symbols/switch-r600-a30-l300";
import { TRACK_WIDTH as StraightWidth } from "@/app/react/tracklayout/regular/symbols/defs";
import { getTrackPieceStyle } from "../../tracklayout/regular/trackpiece";

const CURVE = "curve";
const STRAIGHT = "straight";
const SWITCH = "switch";
const LEFT = "left";

const iconWorldHeight = 320;
const iconWorldWidth = 313;

interface props {
  pieceDef: PieceDefData;
}

/**
 * Render a piece icon form the track piece def list (where user's click to add a piece to the layout)
 */
export default function PieceDefIcon({pieceDef}: props) {
  return (
    <svg
      height="100%"
      width="100%"
      viewBox={`0 0 ${iconWorldWidth} ${iconWorldHeight}`}
      preserveAspectRatio="xMinYMax slice"
    >
      <g transform={`translate(0 ${iconWorldHeight}) scale(1 -1)`}>
        {(pieceDef.category == STRAIGHT) && getStraight()}
        {(pieceDef.category == CURVE) && getCurve(pieceDef)}
        {(pieceDef.category == SWITCH) && getSwitch(pieceDef)}
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
        style={getTrackPieceStyle()}
        transform={`translate(${iconWorldWidth / 2} 0) translate(-${StraightWidth / 2} 10)`}
      />
    </>
  )
}

function getCurve(pieceDef: PieceDefData) {
  return (
    <>
      <defs>
        <CurveR600A30 />
      </defs>
      <use
        href="#curveR600A30"
        height={313}
        width={644}
        style={getTrackPieceStyle()}
        transform={`translate(${iconWorldWidth / 2} 0) translate(${flip(pieceDef) ? 70 : -70} 0) ${flip(pieceDef) ? "scale(-1, 1)" : ""}`}
      />
    </>
  )
}

function getSwitch(pieceDef: PieceDefData) {
  return (
    <>
      <defs>
        <SwitchR600A30L300 />
      </defs>
      <use
        href="#switchR600A30L300"
        height={313}
        width={644}
        style={getTrackPieceStyle()}
        transform={`translate(${iconWorldWidth / 2} 0) translate(${flip(pieceDef) ? 70 : -70} 0) ${flip(pieceDef) ? "scale(-1, 1)" : ""}`}
      />
    </>
  )
}

/**
 * For certain pieces, return the SVG transform function to flip the piece over the vertical axis.
 * Otherwise just return an empty string.
 */
function flip(pieceDef: PieceDefData): boolean {
  if ('orientation' in pieceDef.attributes && pieceDef.attributes.orientation == LEFT) {
    return true;
  }

  if ('variant' in pieceDef.attributes && pieceDef.attributes.variant == LEFT) {
    return true;
  }

  return false;
}