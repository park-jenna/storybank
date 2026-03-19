import type { ReactNode } from "react";

interface BrowserFrameProps {
  children: ReactNode;
  url?: string;
  className?: string;
}

export default function BrowserFrame({
  children,
  url = "storybank-star.vercel.app",
  className = "",
}: BrowserFrameProps) {
  return (
    <div className={`browser-frame ${className}`}>
      <div className="browser-frame-bar">
        <div className="browser-frame-dots">
          <span className="browser-dot browser-dot-red" />
          <span className="browser-dot browser-dot-yellow" />
          <span className="browser-dot browser-dot-green" />
        </div>
        <div className="browser-frame-url">{url}</div>
        <div style={{ width: 52 }} />
      </div>
      <div className="browser-frame-body">{children}</div>
    </div>
  );
}

