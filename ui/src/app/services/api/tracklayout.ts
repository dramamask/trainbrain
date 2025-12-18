import { Coordinate, UiLayout } from "trainbrain-shared";
import { apiFetch } from "./api";

export async function getTrackLayout(startPos: Coordinate): Promise<UiLayout>
{
  const data = await apiFetch<UiLayout>(
    `/layout?x=${startPos.x}&y=${startPos.y}&heading=${startPos.heading}`
  );

  return data;
}
