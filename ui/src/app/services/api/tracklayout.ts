import { Coordinate, UiLayout } from "trainbrain-shared";
import { apiFetch } from "./api";

export async function getTrackLayout(): Promise<UiLayout>
{
  const data = await apiFetch<UiLayout>("/layout");

  return data;
}
