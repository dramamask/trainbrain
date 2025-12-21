import { Coordinate, UiLayout } from "trainbrain-shared";
import { apiGet, apiCall } from "./api";

export async function getTrackLayout(): Promise<UiLayout> {
  const data = await apiGet<UiLayout>("/layout");
  return data;
}

export async function setStartPosition(coordinate: Coordinate) : Promise<UiLayout> {
  const data = await apiCall<UiLayout>("PUT", "/layout/start-position", coordinate);
  return data;
}
