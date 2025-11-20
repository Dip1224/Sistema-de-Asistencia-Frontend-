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

const HeroVideoDialog = ({
  className = "",
  animationStyle = "fade",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Hero video",
  darkThumbnailSrc
}) => {
  const isDark = useIsDark();
  const [open, setOpen] = useState(false);

  const finalThumb = isDark && darkThumbnailSrc ? darkThumbnailSrc : thumbnailSrc;

  return (
    <div className={`hero-video ${className}`}>
      <button type="button" className="hero-video__thumb" onClick={() => setOpen(true)}>
        <img src={finalThumb} alt={thumbnailAlt} loading="lazy" />
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
