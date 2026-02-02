/**
 * SVG object definition for a 300mm long straight piece
 */
export default function StraightL300() {
  return (
    <symbol id="straightL300" viewBox="0 0 88 300">
      <g stroke="yellow" strokeWidth="2">
        {/* Sleepers */}
        <line className="sleeper" x1="0" y1="14" x2="88" y2="14" />
        <line className="sleeper" x1="0" y1="41" x2="88" y2="41" />
        <line className="sleeper" x1="0" y1="68" x2="88" y2="68" />
        <line className="sleeper" x1="0" y1="95" x2="88" y2="95" />
        <line className="sleeper" x1="0" y1="122" x2="88" y2="122" />
        <line className="sleeper" x1="0" y1="149" x2="88" y2="149" />
        <line className="sleeper" x1="0" y1="176" x2="88" y2="176" />
        <line className="sleeper" x1="0" y1="203" x2="88" y2="203" />
        <line className="sleeper" x1="0" y1="230" x2="88" y2="230" />
        <line className="sleeper" x1="0" y1="257" x2="88" y2="257" />
        <line className="sleeper" x1="0" y1="284" x2="88" y2="284" />

        {/* Rails */}
        <line className="rail" x1="21" y1="0" x2="21" y2="300" />
        <line className="rail" x1="67" y1="0" x2="67" y2="300" />
      </g>
    </symbol>
  )
}
