/**
 * SVG object definition for a 150mm long straight piece
 */
export default function Straight150() {
  return (
    <symbol id="straight150" viewBox="0 0 88 150">
      <g stroke="yellow" strokeWidth="2">
        <line className="sleeper" x1="0" y1="15" x2="88" y2="15" />
        <line className="sleeper" x1="0" y1="41" x2="88" y2="41" />
        <line className="sleeper" x1="0" y1="67" x2="88" y2="67" />
        <line className="sleeper" x1="0" y1="93" x2="88" y2="93" />
        <line className="sleeper" x1="0" y1="119" x2="88" y2="119" />
        <line className="sleeper" x1="0" y1="145" x2="88" y2="145" />
        <line className="rail" x1="21" y1="0" x2="21" y2="150" />
        <line className="rail" x1="67" y1="0" x2="67" y2="150" />
      </g>
    </symbol>
  )
}
