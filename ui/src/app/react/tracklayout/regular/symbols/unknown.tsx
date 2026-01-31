/**
 * SVG object shown when we have an object that we don't have a symbol for
 */
export default function Unknwon() {
  return (
    <symbol id="unknown" viewBox="0 0 100 100">
      <g stroke="red" strokeWidth="20">
        <line x1="0" y1="0" x2="100" y2="100" />
        <line x1="100" y1="0" x2="0" y2="100" />
      </g>
    </symbol>
  )
}
