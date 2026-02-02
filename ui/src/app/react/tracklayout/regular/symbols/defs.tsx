import CurveR600A30 from "./curve-r600-a30";
import CurveR600A15 from "./curve-r600-a15";
import CurveR1195A23 from "./curve-r1195-a23";
import StraightL150 from "./straight-l150";
import StraightL300 from "./straight-l300";
import StraightL600 from "./straight-l600";
import SwitchR600A30L300 from "./switch-r600-a30-l300";
import Unknown from "./unknown";

export default function Defs() {
  return (
    <defs>
      <CurveR600A15 />
      <CurveR600A30 />
      <CurveR1195A23 />
      <StraightL150 />
      <StraightL300 />
      <StraightL600 />
      <SwitchR600A30L300 />
      <Unknown />
    </defs>
  )
}
