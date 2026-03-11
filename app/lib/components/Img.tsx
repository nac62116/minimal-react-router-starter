import { useEffect, useRef, useState } from "react";

const FRAME_VARIANTS = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "1:1": "aspect-square",
  portrait: "aspect-[2/3]",
  "9:16": "aspect-[9/16]",
} as const;

type FrameVariant = keyof typeof FRAME_VARIANTS;

function Frame(props: {
  variant: FrameVariant;
  rounded?: boolean;
  divProps?: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const { variant, rounded = true, divProps, children } = props;
  const { className = "", ...restDivProps } = divProps || {};
  const aspectClass = FRAME_VARIANTS[variant];
  return (
    <div
      className={`relative overflow-hidden ${aspectClass}${rounded ? " rounded-md" : ""}${className !== "" ? ` ${className}` : ""}`}
      {...restDivProps}
    >
      {children}
    </div>
  );
}

export type ImageProps = {
  src?: string;
  alt?: string;
  thumbnailSrc?: string;
  resizeType?: "fit" | "fill";
};

function Img(props: ImageProps) {
  const { resizeType = "fill" } = props;
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    if (img.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <>
      <div className="relative size-full">
        {props.src ? (
          <img
            ref={imageRef}
            src={props.src}
            alt={loaded ? props.alt || "" : ""}
            className={`absolute size-full inset-0 ${
              resizeType === "fit" ? "object-contain" : "object-cover"
            }`}
            onLoad={() => {
              setLoaded(true);
            }}
          />
        ) : null}
        {props.thumbnailSrc ? (
          <img
            src={props.thumbnailSrc}
            alt=""
            className={`absolute size-full inset-0 transition-opacity duration-500 ${
              resizeType === "fit" ? "object-contain" : "object-cover"
            } ${loaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </>
  );
}

Img.Frame = Frame;

export { Img };
