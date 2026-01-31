/**
 * SVG object definition for a 600mm radius, 15° curved piece
 * Radius is measured through the centre of the track
 */
export default function CurveR600A15() {
  return (
    <symbol id="curveR600A15" viewBox="0 0 644 161">
      <g
        stroke="yellow"
        strokeWidth="2"
        fill="none"
      >
        {/* Sleepers – rotate to curve */}
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-1.25 644 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-3.75 644 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-6.25 644 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-8.75 644 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-11.25 644 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-13.75 644 0)" />

        {/* Rails
            M = Move: x, y
            A = Arc: rx ry xAxisRotation largeArcFlag sweepFlag x y
            rx and ry are the x and y radius of the rails (600 minus 23 for one 600 plus 23 for the other)
            xAxisRotation - rotation of the elipse's axes. We have a circle (rx and ry are the same) so this doesn't matter.
            largeArcFlag - 0 draws the short shorter arc (≤ 180°). 1 draws the longer arc (> 180°).
            sweepflag = 1 is clockwise. 0 is counter-clockwise.
            x and y are the end point of the arc. Precalculated using sin and cos. For reasons unknown I had to adjust the calculate x and y by 2 pixels.
        */}
        <path
          className="rail"
          d="M 67 0 A 579 579 0 0 0 86.7 149.9"
        />
        <path
          className="rail"
          d="M 21 0 A 621 621 0 0 0 42.2 160.7"
        />
      </g>
    </symbol>
  )
}
