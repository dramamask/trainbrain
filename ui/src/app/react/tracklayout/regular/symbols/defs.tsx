import CurveR600A30 from "./curve-r600-a30";
import CurveR600A15 from "./curve-r600-a15";
import CurveR1195A23 from "./curve-r1195-a23";
import Straight150 from "./straight150";
import Straight300 from "./straight300";
import Straight600 from "./straight600";
import Unknown from "./unknown";

export default function Defs() {
  return (
    <defs>
      <CurveR600A15 />
      <CurveR600A30 />
      <CurveR1195A23 />
      <Straight150 />
      <Straight300 />
      <Straight600 />
      <Unknown />
    </defs>
  )
}
