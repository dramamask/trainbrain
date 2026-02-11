import { get } from "@/app/config/config";

/**
 * Returns the track piece style for track piecce <use> components
 */
export function getTrackPieceStyle(): React.CSSProperties {
  return (
    {
      "--rail-color": get("rail.color"),
      "--rail-width": get("rail.width"),
      "--sleeper-color": get("sleeper.color"),
      "--sleeper-width": get("sleeper.width"),
    } as React.CSSProperties
  )
}
