import { Layouts } from "../layout/layouts.js";

export let layouts: Layouts;

try {
  layouts = new Layouts();
  await layouts.init();
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
