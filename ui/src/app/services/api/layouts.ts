import { LayoutNamesData } from "trainbrain-shared";
import { apiGet } from "./api";

// Call the server API to get a list of all layout IDs and names
export async function getLayouts(): Promise<LayoutNamesData> {
  const data = await apiGet<LayoutNamesData>("/layouts");
  return data;
}
