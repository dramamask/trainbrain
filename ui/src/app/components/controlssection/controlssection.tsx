import PieceDefs from "./piecedefs";

import styles from "./controlssection.module.css";

// The main container for the controlssection
export default function ControlsSection() {
  return (
    <div className={styles.mainContainer}>
      <PieceDefs />
    </div>
  )
}
