import { Coordinate, UiLayout } from "trainbrain-shared";
import { apiGet, apiCall } from "./api";

export async function getTrackLayout(): Promise<UiLayout> {
  const data = await apiGet<UiLayout>("/layout");
  return data;
}

export async function setPiece1StartPosition(coordinate: Coordinate) : Promise<UiLayout> {
  const data = await apiCall<UiLayout>("POST", "/piece1startpos", coordinate);
  return data;
}
