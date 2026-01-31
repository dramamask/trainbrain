import CurveR600A30 from "./curveR600A30";
import Straight150 from "./straight150";
import Straight300 from "./straight300";
import Straight600 from "./straight600";
import Unknown from "./unknown";

export default function Defs() {
  return (
    <defs>
      <CurveR600A30 />
      <Straight150 />
      <Straight300 />
      <Straight600 />
      <Unknown />
    </defs>
  )
}
