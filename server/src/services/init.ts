import { Layout } from "../layout/layout.js";

export let layout: Layout;

try {
  layout = new Layout();
  layout.init();
} catch(error) {
  console.error(error);
  throw new Error("Error creating the layout class");
}
