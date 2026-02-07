/**
 * SVG object definition for a 1195mm radius, 22.5° switch with a 440mm long straight
 */
export default function SwitchR1195A23L440() {
  return (
    <symbol id="switchR1195A23L440" viewBox="0 0 644 500">
      <g stroke="yellow" strokeWidth="2" fill="none">
        {/* Straight sleepers */}
        <line className="sleeper" x1="0" y1="14" x2="88" y2="14" />
        <line className="sleeper" x1="0" y1="41" x2="88" y2="41" />
        <line className="sleeper" x1="0" y1="68" x2="88" y2="68" />
        <line className="sleeper" x1="0" y1="95" x2="88" y2="95" />
        <line className="sleeper" x1="0" y1="122" x2="88" y2="122" />
        <line className="sleeper" x1="0" y1="149" x2="96" y2="149" />
        <line className="sleeper" x1="0" y1="162" x2="96" y2="162" />
        <line className="sleeper" x1="0" y1="189" x2="98" y2="189" />
        <line className="sleeper" x1="0" y1="216" x2="104" y2="216" />
        <line className="sleeper" x1="0" y1="243" x2="110" y2="243" />
        <line className="sleeper" x1="0" y1="270" x2="116" y2="270" />
        <line className="sleeper" x1="0" y1="296" x2="122" y2="296" />
        <line className="sleeper" x1="0" y1="322" x2="128" y2="322" />
        <line className="sleeper" x1="0" y1="348" x2="84" y2="348" />
        <line className="sleeper" x1="0" y1="374" x2="84" y2="374" />
        <line className="sleeper" x1="0" y1="400" x2="84" y2="400" />
        <line className="sleeper" x1="0" y1="426" x2="84" y2="426" />

        {/* Sleepers rotated to curve */}
        <line className="sleeper" x1="10" y1="0" x2="84" y2="0" transform="rotate(-16.9 1239 0)" />
        <line className="sleeper" x1="10" y1="0" x2="84" y2="0" transform="rotate(-18.05 1239 0)" />
        <line className="sleeper" x1="10" y1="0" x2="84" y2="0" transform="rotate(-19.3 1239 0)" />
        <line className="sleeper" x1="10" y1="0" x2="84" y2="0" transform="rotate(-20.55 1239 0)" />
        <line className="sleeper" x1="10" y1="0" x2="84" y2="0" transform="rotate(-21.8 1239 0)" />

        {/* Straight rails */}
        <line className="rail" x1="21" y1="0" x2="21" y2="440" />
        <line className="rail" x1="67" y1="0" x2="67" y2="440" />

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
