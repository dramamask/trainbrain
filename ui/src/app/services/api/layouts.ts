import { LayoutNamesData, UiLayout } from "trainbrain-shared";
import { apiCall, apiGet } from "./api";

// Call the server API to get a list of all layout IDs and names
export async function getLayouts(): Promise<LayoutNamesData> {
  const data = await apiGet<LayoutNamesData>("/layouts");
  return data;
}

// Call the server API to switch the active layout
export async function setActiveLayout(newActiveLayoutId: string): Promise<UiLayout> {
  const data = await apiCall<UiLayout>("POST", `/layouts/active/${newActiveLayoutId}`, {});
  return data;
}
