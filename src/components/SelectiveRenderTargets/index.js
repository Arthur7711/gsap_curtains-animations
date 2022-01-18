import React, { useRef, useState } from "react";
import {
  Plane,
  RenderTarget,
  ShaderPass,
  useCurtainsEvent,
} from "react-curtains";
import {
  vertexShader,
  fragmentShader,
  distortionFs,
  rgbFs,
  blurFs,
} from "../../shaders/shardersSelective";
import { Vec2 } from "curtainsjs";

import "./index.css";

function SelectiveRenderTargets() {
  const [nbPlanes] = useState(4);

  const planesDeformations = useRef(0);

  useCurtainsEvent("onRender", (curtains) => {
    // update our planes deformation
    // increase/decrease the effect
    planesDeformations.current = curtains.lerp(
      planesDeformations.current,
      0,
      0.075
    );
  });

  useCurtainsEvent("onScroll", (curtains) => {
    // get scroll deltas to apply the effect on scroll
    const delta = curtains.getScrollDeltas();

    // invert value for the effect
    delta.y = -delta.y;

    // threshold
    if (delta.y > 60) {
      delta.y = 60;
    } else if (delta.y < -60) {
      delta.y = -60;
    }

    if (Math.abs(delta.y) > Math.abs(planesDeformations.current)) {
      planesDeformations.current = curtains.lerp(
        planesDeformations.current,
        delta.y,
        0.5
      );
    }
  });

  const passUniforms = {
    scrollEffect: {
      name: "uScrollEffect",
      type: "1f",
      value: 0,
    },
  };

  // render passes
  const onPassRender = (pass) => {
    // update the uniform
    pass.uniforms.scrollEffect.value = planesDeformations.current;
  };

  // additional blur pass
  const blurUniforms = {
    scrollEffect: {
      name: "uScrollEffect",
      type: "1f",
      value: 0,
    },
    resolution: {
      name: "uResolution",
      type: "2f",
      value: new Vec2(),
    },
  };

  const setPassResolution = (pass) => {
    const passBBox = pass.getBoundingRect();
    pass.uniforms.resolution.value = new Vec2(passBBox.width, passBBox.height);
  };

  const buildPlane = (index) => {
    const imageIndex = (index % 4) + 1;

    return (
      <div className="SelectiveRenderTargets-element" key={index}>
        <div className="SelectiveRenderTargets-title">
          {"Title " + (index + 1)}
        </div>
        <div className="SelectiveRenderTargets-element-inner">
          <RenderTarget uniqueKey="distortionTarget">
            <ShaderPass
              fragmentShader={distortionFs}
              uniforms={passUniforms}
              onRender={onPassRender}
            >
              <Plane
                className="SelectiveRenderTargets-plane"
                // plane init parameters
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
              >
                <img
                  src={"https://unsplash.it/1920/1080?random=" + imageIndex}
                  data-sampler="planeTexture"
                  alt=""
                />
              </Plane>
            </ShaderPass>
          </RenderTarget>

          <RenderTarget uniqueKey="rgbTarget">
            <ShaderPass
              fragmentShader={rgbFs}
              depthTest={false}
              uniforms={passUniforms}
              onRender={onPassRender}
            >
              <Plane
                className="SelectiveRenderTargets-small-plane"
                // plane init parameters
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
              >
                <img
                  src={"https://unsplash.it/1920/1080?random=" + imageIndex}
                  data-sampler="planeTexture"
                  alt=""
                />
              </Plane>
            </ShaderPass>
          </RenderTarget>
        </div>
      </div>
    );
  };

  const allPlanes = [];
  for (let i = 0; i < nbPlanes; i++) {
    allPlanes.push(buildPlane(i));
  }

  return (
    <div className="SelectiveRenderTargets">
      <div className="SelectiveRenderTargets-wrapper">
        {allPlanes.map((planeEl) => {
          return planeEl;
        })}

        <ShaderPass
          fragmentShader={blurFs}
          uniforms={blurUniforms}
          onRender={onPassRender}
          onReady={setPassResolution}
          onAfterResize={setPassResolution}
        />
      </div>
    </div>
  );
}

export default SelectiveRenderTargets;
