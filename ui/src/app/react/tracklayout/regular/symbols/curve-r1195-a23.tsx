/**
 * SVG object definition for a 1195mm radius, 22.5° curved piece
 * Radius is measured through the centre of the track
 */
export default function CurveR1195A23() {
  return (
    <symbol id="curveR1195A23" viewBox="0 0 1239 500">
      <g
        stroke="yellow"
        strokeWidth="2"
        fill="none"
      >
        {/* Sleepers – rotate to curve */}
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-0.64 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-1.96 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-3.28 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-4.6 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-5.92 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-7.24 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-8.56 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-9.88 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-11.2 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-12.52 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-13.84 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-15.16 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-16.48 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-17.8 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-19.12 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-20.44 1239 0)" />
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-21.76 1239 0)" />

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
          d="M 67 0 A 1195 1195 0 0 0 156.5 449.3"
        />
        <path
          className="rail"
          d="M 21 0 A 1195 1195 0 0 0 113.7 466.3"
        />
      </g>
    </symbol>
  )
}
