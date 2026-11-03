export function Ornament({ children }: { children: React.ReactNode }) {
  return (
    <div className="ornament caps">
      <OrnamentMark />
      <span>{children}</span>
      <OrnamentMark />
    </div>
  );
}

function OrnamentMark() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M10 2v16M2 10h16" />
      <circle cx="10" cy="10" r="3.4" />
    </svg>
  );
}
