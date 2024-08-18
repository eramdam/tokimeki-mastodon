/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { BlurhashCanvas } from "react-blurhash";

interface BlurhashImageProps {
  imgClassname?: string;
  canvasClassname?: string;
  src: string;
  width?: number;
  height?: number;
  hash: string;
  description?: string;
  isHidden?: boolean;
  isUncached?: boolean;
}

export function BlurhashImage(props: BlurhashImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <>
      <img
        ref={imgRef}
        src={props.isHidden || props.isUncached ? "" : props.src}
        className={clsx(
          props.imgClassname,
          {
            "opacity-0": !isLoaded || props.isHidden || props.isUncached,
          },
          "text-[0px]",
        )}
        onLoad={() => setIsLoaded(true)}
        width={props.width || 32}
        height={props.height || 32}
        alt={props.description || ""}
      />
      {!isLoaded && (
        <BlurhashCanvas
          className={props.canvasClassname}
          hash={props.hash}
          width={props.width || 32}
          height={props.height || 32}
        ></BlurhashCanvas>
      )}
    </>
  );
}
