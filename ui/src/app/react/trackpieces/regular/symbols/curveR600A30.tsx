/**
 * SVG object definition for a 600mm radius, 30° curved piece
 * Radius is measured through the centre of the track
 */
export default function CurveR600A30() {
  return (
    <symbol id="curveR600A30" viewBox="-50 -50 750 750">
      <g
        stroke="yellow"
        strokeWidth="2"
        fill="none"
      >
        {/* Sleepers – tangent to curve */}
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(2.5)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(5)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(7.5)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(10)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(12.5)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(15)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(17.5)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(20)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(22.5)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(25)" />
        <line className="sleeper" x1="556" y1="0" x2="638" y2="0" transform="rotate(27.5)" />

        {/* Rails */}
        <path
          className="rail"
          d="M 576 0 A 576 576 0 0 1 499.3 288"
        />
        <path
          className="rail"
          d="M 624 0 A 624 624 0 0 1 541.0 312"
        />
      </g>
    </symbol>
  )
}
