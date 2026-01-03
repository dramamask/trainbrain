import { Layout } from "../layout/layout.js";

export let layout: Layout;

try {
  layout = new Layout();
  layout.init();
} catch(error) {
  console.error("Error message:\n--------------\n" + getErrorMessage(error) + "\n\n");
  console.error("Error details:\n--------------\n", error)
}

function getErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}
