import { Coordinate, UiLayout } from "trainbrain-shared";
import { apiGet, apiCall } from "./api";

// Get the track layuot structure
export async function getTrackLayout(): Promise<UiLayout> {
  const data = await apiGet<UiLayout>("/layout");
  return data;
}

// Set the start position of the track layout. This includes the heading (i.e the orientation)
export async function setStartPosition(coordinate: Coordinate) : Promise<UiLayout> {
  const data = await apiCall<UiLayout>("PUT", "/layout/start-position", coordinate);
  return data;
}
