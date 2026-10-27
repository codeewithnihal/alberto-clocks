import { useEffect, useState } from "react";

/** <img> that shows a quiet placeholder instead of a broken icon if the file cannot be loaded. */
export default function SafeImage({ label = "Image unavailable", className, ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [props.src]);
  if (failed) {
    return (
      <span className="img-missing" role="img" aria-label={props.alt || label}>
        {label}
      </span>
    );
  }
  return <img className={className} {...props} onError={() => setFailed(true)} />;
}
