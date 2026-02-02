/**
 * SVG object definition for a 150mm long straight piece
 */
export default function StraightL150() {
  return (
    <symbol id="straightL150" viewBox="0 0 88 150">
      <g stroke="yellow" strokeWidth="2">
        {/* Sleepers */}
        <line className="sleeper" x1="0" y1="14" x2="88" y2="14" />
        <line className="sleeper" x1="0" y1="41" x2="88" y2="41" />
        <line className="sleeper" x1="0" y1="68" x2="88" y2="68" />
        <line className="sleeper" x1="0" y1="82" x2="88" y2="82" />
        <line className="sleeper" x1="0" y1="109" x2="88" y2="109" />
        <line className="sleeper" x1="0" y1="136" x2="88" y2="136" />

        {/* Rails */}
        <line className="rail" x1="21" y1="0" x2="21" y2="150" />
        <line className="rail" x1="67" y1="0" x2="67" y2="150" />
      </g>
    </symbol>
  )
}
