const DIMENSIONS = {
  full: { width: 104, height: 68 },
  compact: { width: 34, height: 22 },
} as const;

interface LogoProps {
  size?: keyof typeof DIMENSIONS;
  className?: string;
}

export function Logo({ size = "full", className }: LogoProps) {
  const { width, height } = DIMENSIONS[size];

  return (
    <svg width={width} height={height} viewBox="0 8 40 26" className={className} aria-hidden="true">
      <path
        d="M8 14C8 11.5 13 10 20 10C27 10 32 11.5 32 14C32 17 39 19 38 27C38 30 32 32 20 32C8 32 2 30 2 27C1 19 8 17 8 14Z"
        fill="var(--ink)"
      />
      <ellipse cx="20" cy="13.5" rx="8.5" ry="1.8" fill="var(--ink-tint)" />
      <path
        d="M18.1 25.5C17.85 24.3 18.7 23.4 20 23.4C21.3 23.4 22.15 24.3 21.9 25.5C22.15 26.5 21.15 27.3 20 27.3C18.85 27.3 17.85 26.5 18.1 25.5Z"
        fill="var(--accent)"
      />
      <ellipse cx="18.9" cy="21.6" rx="0.9" ry="1.3" fill="var(--accent)" />
      <ellipse cx="21.1" cy="21.6" rx="0.9" ry="1.3" fill="var(--accent)" />
      <ellipse cx="17.1" cy="22.7" rx="0.9" ry="1.1" fill="var(--accent)" />
      <ellipse cx="22.9" cy="22.7" rx="0.9" ry="1.1" fill="var(--accent)" />
    </svg>
  );
}
