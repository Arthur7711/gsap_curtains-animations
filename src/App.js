import React from "react";
// import SelectiveRenderTargets from "./components/SelectiveRenderTargets";
import gsap from "gsap";
import { useCurtains } from "react-curtains";
import Slideshow from "./components/Slideshow";
import "./styles.css";

export default function App() {
  useCurtains((curtains) => {
    // use gsap ticker to render our curtains scene
    gsap.ticker.add(curtains.render.bind(curtains));
  });
  return (
    <div className="App">
      <Slideshow />
      {/* <SelectiveRenderTargets /> */}
    </div>
  );
}
