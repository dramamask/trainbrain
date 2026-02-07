/**
 * SVG object definition for a 600mm radius, 30° switch with a 300mm long straight
 */
export default function SwitchR600A30L300() {
  return (
    <symbol id="switchR600A30L300" viewBox="0 0 644 313">
      <g stroke="yellow" strokeWidth="2" fill="none">
        {/* Straight sleepers */}
        <line className="sleeper" x1="0" y1="14" x2="88" y2="14" />
        <line className="sleeper" x1="0" y1="41" x2="88" y2="41" />
        <line className="sleeper" x1="0" y1="68" x2="88" y2="68" />
        <line className="sleeper" x1="0" y1="95" x2="88" y2="95" />
        <line className="sleeper" x1="0" y1="122" x2="102" y2="122" />
        <line className="sleeper" x1="0" y1="149" x2="108" y2="149" />
        <line className="sleeper" x1="0" y1="176" x2="116" y2="176" />
        <line className="sleeper" x1="0" y1="203" x2="124" y2="203" />
        <line className="sleeper" x1="0" y1="230" x2="88" y2="230" />
        <line className="sleeper" x1="0" y1="257" x2="88" y2="257" />
        <line className="sleeper" x1="0" y1="284" x2="88" y2="284" />

        {/* Sleepers rotated to curve */}
        <line className="sleeper" x1="0" y1="0" x2="88" y2="0" transform="rotate(-23.75 644 0)" />
        <line className="sleeper" x1="6" y1="0" x2="88" y2="0" transform="rotate(-26.25 644 0)" />
        <line className="sleeper" x1="12" y1="0" x2="88" y2="0" transform="rotate(-28.75 644 0)" />

        {/* Straight rails */}
        <line className="rail" x1="21" y1="0" x2="21" y2="300" />
        <line className="rail" x1="67" y1="0" x2="67" y2="300" />

        {/* Curved rails
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
          d="M 67 0 A 579 579 0 0 0 144.6 289.5"
        />
        <path
          className="rail"
          d="M 21 0 A 621 621 0 0 0 104.2 311.5"
        />
      </g>
    </symbol>
  )
}
