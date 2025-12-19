import { Coordinate, UiLayout } from "trainbrain-shared";
import { apiGet, apiPost } from "./api";

export async function getTrackLayout(): Promise<UiLayout> {
  const data = await apiGet<UiLayout>("/layout");
  return data;
}

export async function setPiece1StartPosition(coordinate: Coordinate) : Promise<UiLayout> {
  const data = await apiPost<UiLayout>("/piece1startpos", coordinate);
  return data;
}
