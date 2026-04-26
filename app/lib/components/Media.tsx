import { useEffect, useRef, useState } from "react";

function Media() {
  return <></>;
}

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

function Img(props: {
  imageProps: React.ImgHTMLAttributes<HTMLImageElement>;
  thumbnailProps: React.ImgHTMLAttributes<HTMLImageElement>;
  resizeType?: "fit" | "fill";
}) {
  const { resizeType = "fill", imageProps, thumbnailProps } = props;
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
        {imageProps.src ? (
          <img
            ref={imageRef}
            alt={loaded ? imageProps.alt || undefined : undefined}
            className={`absolute size-full inset-0 ${
              resizeType === "fit" ? "object-contain" : "object-cover"
            }`}
            onLoad={() => {
              setLoaded(true);
            }}
            {...imageProps}
          />
        ) : null}
        {thumbnailProps.src ? (
          <img
            src={thumbnailProps.src}
            alt=""
            className={`absolute size-full inset-0 transition-opacity duration-500 ${
              resizeType === "fit" ? "object-contain" : "object-cover"
            } ${loaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            aria-hidden="true"
            {...thumbnailProps}
          />
        ) : null}
        {imageProps.src ? (
          <noscript>
            <img
              ref={imageRef}
              src={imageProps.src}
              alt={loaded ? imageProps.alt || undefined : undefined}
              className={`absolute size-full inset-0 ${
                resizeType === "fit" ? "object-contain" : "object-cover"
              }`}
            />
          </noscript>
        ) : null}
      </div>
    </>
  );
}

// TODO: A11y for videos
// Subtitles: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia#implementing_html_video_text_tracks
// Controls: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia#creating_custom_audio_and_video_controls
function Video(props: {
  videoProps?: React.VideoHTMLAttributes<HTMLVideoElement>;
  sourceProps?: React.SourceHTMLAttributes<HTMLSourceElement>;
  thumbnailProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  resizeType?: "fit" | "fill";
}) {
  const {
    resizeType = "fill",
    thumbnailProps = {},
    videoProps = {},
    sourceProps = {},
  } = props;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 3) {
      setLoaded(true);
    }
  }, []);

  return (
    <>
      <div className="relative size-full">
        {sourceProps.src ? (
          <video
            ref={videoRef}
            className={`absolute size-full inset-0 ${
              resizeType === "fit" ? "object-contain" : "object-cover"
            }`}
            onLoadedData={() => {
              if (
                videoRef.current !== null &&
                videoRef.current.readyState >= 3
              ) {
                setLoaded(true);
              }
            }}
            muted={true}
            {...videoProps}
          >
            <source {...sourceProps} />
          </video>
        ) : null}
        {thumbnailProps.src ? (
          <img
            src={thumbnailProps.src}
            alt=""
            className={`absolute size-full inset-0 transition-opacity duration-500 ${
              resizeType === "fit" ? "object-contain" : "object-cover"
            } ${loaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            aria-hidden="true"
            {...thumbnailProps}
          />
        ) : null}
        {sourceProps.src ? (
          <noscript>
            <video
              ref={videoRef}
              className={`absolute size-full inset-0 ${
                resizeType === "fit" ? "object-contain" : "object-cover"
              }`}
              muted={true}
              {...videoProps}
            >
              <source {...sourceProps} />
            </video>
          </noscript>
        ) : null}
      </div>
    </>
  );
}

Media.Img = Img;
Media.Video = Video;
Media.Frame = Frame;

export { Media };
