import { useEffect, useState } from "react";

function useIsDark() {
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    update();
    return () => observer.disconnect();
  }, []);

  return isDark;
}

const DEFAULT_LIGHT_THUMB = "https://startup-template-sage.vercel.app/hero-light.png";
const DEFAULT_DARK_THUMB = "https://startup-template-sage.vercel.app/hero-dark.png";

const HeroVideoDialog = ({
  className = "",
  animationStyle = "fade",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Hero video",
  darkThumbnailSrc,
  inline = false
}) => {
  const isDark = useIsDark();
  const [open, setOpen] = useState(false);
  const [resolvedThumb, setResolvedThumb] = useState(() => {
    const thumb = isDark && darkThumbnailSrc ? darkThumbnailSrc : thumbnailSrc;
    return thumb || (isDark ? DEFAULT_DARK_THUMB : DEFAULT_LIGHT_THUMB);
  });

  useEffect(() => {
    const thumb = isDark && darkThumbnailSrc ? darkThumbnailSrc : thumbnailSrc;
    setResolvedThumb(thumb || (isDark ? DEFAULT_DARK_THUMB : DEFAULT_LIGHT_THUMB));
  }, [isDark, thumbnailSrc, darkThumbnailSrc]);

  if (inline) {
    return (
      <div className={`hero-video hero-video--inline ${className}`}>
        <div className="hero-video__frame">
          <iframe
            src={videoSrc}
            title="Demo de reconocimiento"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`hero-video ${className}`}>
      <button type="button" className="hero-video__thumb" onClick={() => setOpen(true)}>
        <img
          src={resolvedThumb}
          alt={thumbnailAlt}
          loading="lazy"
          onError={() =>
            setResolvedThumb(prev =>
              prev === (isDark ? DEFAULT_DARK_THUMB : DEFAULT_LIGHT_THUMB)
                ? prev
                : isDark
                  ? DEFAULT_DARK_THUMB
                  : DEFAULT_LIGHT_THUMB
            )
          }
        />
        <span className="hero-video__play">Ver video</span>
      </button>

      {open && (
        <div className="hero-video__overlay" onClick={() => setOpen(false)}>
          <div className={`hero-video__dialog ${animationStyle}`} onClick={event => event.stopPropagation()}>
            <button type="button" className="hero-video__close" onClick={() => setOpen(false)}>
              ×
            </button>
            <div className="hero-video__frame">
              <iframe
                src={videoSrc}
                title="Hero video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroVideoDialog;
