import React, { useRef, useState, useEffect } from "react";
import { Plane, useCurtains } from "react-curtains";
import gsap from "gsap";
import { vertexShader, fragmentShader } from "../../shaders/shaders";

import "./index.css";

function Slideshow() {
  const [plane, setPlane] = useState(null);

  const slideshowInner = useRef(null);

  // slideshow states
  const [activeTexture, setActiveTexture] = useState(1);
  const [maxTextures, setMaxTextures] = useState(0);

  const isChanging = useRef(false);
  const tween = useRef(null);

  useEffect(() => {
    if (slideshowInner.current) {
      setMaxTextures(slideshowInner.current.childElementCount - 2);
    }

    let currentTween = tween.current;
    return () => {
      if (currentTween) {
        currentTween.kill();
      }
    };
  }, []);

  const activeTex = useRef(null);
  const nextTex = useRef(null);

  const uniforms = {
    transitionTimer: {
      name: "uTransitionTimer",
      type: "1f",
      value: 0,
    },
  };

  const onLoading = (plane, texture) => {
    // improve texture rendering on small screens with LINEAR_MIPMAP_NEAREST minFilter
    texture.setMinFilter(texture.gl.LINEAR_MIPMAP_NEAREST);
  };

  const onReady = (plane) => {
    setPlane(plane);
  };

  const onClick = () => {
    if (!isChanging.current && plane) {
      isChanging.current = true;

      // check what will be next image
      let nextTextureIndex;
      if (activeTexture < maxTextures) {
        nextTextureIndex = activeTexture + 1;
      } else {
        nextTextureIndex = 1;
      }
      // apply it to our next texture
      nextTex.current.setSource(plane.images[nextTextureIndex]);

      tween.current = gsap.to(plane.uniforms.transitionTimer, {
        duration: 1.75,
        value: 90,
        ease: "power2.inOut",
        onComplete: () => {
          isChanging.current = false;
          tween.current = null;

          plane.uniforms.transitionTimer.value = 0;

          const activeTextureIndex = nextTextureIndex;
          // our next texture becomes our active texture
          activeTex.current.setSource(plane.images[activeTextureIndex]);
          setActiveTexture(activeTextureIndex);
        },
      });
    }
  };

  useCurtains(
    (curtains) => {
      if (plane) {
        // first we set our very first image as the active texture
        activeTex.current = plane.createTexture({
          sampler: "activeTex",
          fromTexture: plane.textures[activeTexture],
        });
        // next we set the second image as next texture but this is not mandatory
        // as we will reset the next texture on slide change
        nextTex.current = plane.createTexture({
          sampler: "nextTex",
          fromTexture: plane.textures[activeTexture + 1],
        });
      }
    },
    [plane]
  );

  return (
    <Plane
      className="Slideshow"
      // plane init parameters
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      // plane events
      onLoading={onLoading}
      onReady={onReady}
      onClick={onClick}
    >
      <div ref={slideshowInner}>
        <span>Click me !</span>
        <img
          src="https://www.curtainsjs.com/examples/medias/displacement.jpg"
          data-sampler="displacement"
          alt=""
        />
        <img src="https://unsplash.it/1920/1080?random=1" alt="" />
        <img src="https://unsplash.it/1920/1080?random=2" alt="" />
        <img src="https://unsplash.it/1920/1080?random=3" alt="" />
        <img src="https://unsplash.it/1920/1080?random=4" alt="" />
      </div>
    </Plane>
  );
}

export default Slideshow;
