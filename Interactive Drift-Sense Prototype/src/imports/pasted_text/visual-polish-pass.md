/* Visual polish layer: "scientific instrument" look.
   Import AFTER theme.css / animations.css. Tones: cyan | green | amber | red. */

@theme {
  --animate-breathe: breathe 2s ease-in-out infinite;
  --animate-scan-once: scan-once 0.9s ease-out 1 both;
  --animate-shake: shake 0.45s ease-in-out 1;
  --animate-flash-green: flash-green 0.9s ease-out 1;
  --animate-run-pulse: run-pulse 1.1s ease-in-out infinite;

  @keyframes breathe {
    0%, 100% { box-shadow: 0 0 0 1px var(--tone), 0 0 10px 1px color-mix(in oklab, var(--tone) 45%, transparent), 0 0 28px 4px color-mix(in oklab, var(--tone) 20%, transparent); }
    50%      { box-shadow: 0 0 0 1px var(--tone), 0 0 18px 3px color-mix(in oklab, var(--tone) 70%, transparent), 0 0 46px 10px color-mix(in oklab, var(--tone) 32%, transparent); }
  }
  @keyframes scan-once {
    0%   { top: 0; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-5px); }
    40% { transform: translateX(5px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }
  @keyframes flash-green {
    0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.8); background-color: rgba(16,185,129,0.35); }
    100% { box-shadow: 0 0 0 14px rgba(16,185,129,0); background-color: rgba(16,185,129,0.1); }
  }
  @keyframes run-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.65; }
  }
}

:root, .dark {
  --tone-cyan: #00d4ff;
  --tone-green: #10b981;
  --tone-amber: #f59e0b;
  --tone-red: #ef4444;
}

@layer base {
  /* Depth: near-black to barely-there deep navy */
  body {
    background:
      radial-gradient(1200px 600px at 70% -10%, rgba(0, 120, 200, 0.08), transparent 60%),
      linear-gradient(180deg, #05080d 0%, #060b14 55%, #08101c 100%);
    background-attachment: fixed;
  }
}

@layer components {
  /* ----- Type scale ----- */
  .label-caps {
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--muted-foreground);
  }
  .metric-hero {            /* 56px */
    font-family: var(--font-mono);
    font-size: 3.5rem;
    line-height: 1;
    font-weight: 600;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .metric-value {           /* 24px: hero is >2x this */
    font-family: var(--font-mono);
    font-size: 1.5rem;
    line-height: 1.1;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .metric-unit {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin-left: 0.25rem;
  }

  /* ----- Accent-tinted cards ----- */
  .panel {
    --tone: var(--tone-cyan);
    position: relative;
    background: linear-gradient(180deg, rgba(13, 21, 32, 0.92), rgba(9, 15, 24, 0.92));
    border-radius: var(--radius-lg);
    box-shadow:
      inset 0 0 0 1px color-mix(in oklab, var(--tone) 22%, transparent),
      0 0 22px -6px color-mix(in oklab, var(--tone) 35%, transparent);
    transition: box-shadow 0.3s ease;
  }
  .panel[data-tone="green"] { --tone: var(--tone-green); }
  .panel[data-tone="amber"] { --tone: var(--tone-amber); }
  .panel[data-tone="red"]   { --tone: var(--tone-red); }
  .panel:hover {
    box-shadow:
      inset 0 0 0 1px color-mix(in oklab, var(--tone) 40%, transparent),
      0 0 30px -4px color-mix(in oklab, var(--tone) 50%, transparent);
  }

  /* ----- Glowing vertical divider between panels ----- */
  .divider-glow {
    width: 1px;
    align-self: stretch;
    background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.35), transparent);
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.25);
  }

  /* ----- Detection box ----- */
  .detect-box {
    --tone: var(--tone-cyan);
    position: absolute;
    border-radius: 6px;
    border: 1.5px solid var(--tone);
    background: color-mix(in oklab, var(--tone) 8%, transparent);
    overflow: visible;
  }
  .detect-box[data-tone="green"] { --tone: var(--tone-green); }
  .detect-box[data-tone="amber"] { --tone: var(--tone-amber); }
  .detect-box[data-tone="red"]   { --tone: var(--tone-red); }

  .detect-scan {
    position: absolute;
    left: 0; right: 0; top: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--tone), transparent);
    box-shadow: 0 0 10px 2px var(--tone);
    pointer-events: none;
  }

  /* ----- Confidence bar ----- */
  .conf-track {
    height: 8px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    overflow: visible;
  }
  .conf-fill {
    --tone: var(--tone-cyan);
    height: 100%;
    border-radius: 9999px;
    background: linear-gradient(90deg, color-mix(in oklab, var(--tone) 55%, transparent), var(--tone));
    box-shadow: 0 0 10px 1px var(--tone), 6px 0 14px 2px color-mix(in oklab, var(--tone) 55%, transparent);
    transition: width 800ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .conf-fill[data-tone="green"] { --tone: var(--tone-green); }
  .conf-fill[data-tone="amber"] { --tone: var(--tone-amber); }
  .conf-fill[data-tone="red"]   { --tone: var(--tone-red); }

  /* ----- Run button ----- */
  .run-btn {
    position: relative;
    padding: 0.9rem 1.5rem;
    border-radius: var(--radius-lg);
    font-size: 0.95rem;
    letter-spacing: 0.22em;
    font-weight: 600;
    color: var(--primary-foreground);
    background: linear-gradient(135deg, #00d4ff, #3b82f6);
    box-shadow: 0 0 18px rgba(0, 212, 255, 0.4);
    transition: box-shadow 0.25s ease, transform 0.15s ease;
  }
  .run-btn:hover:not(:disabled) { box-shadow: 0 0 30px rgba(0, 212, 255, 0.65); transform: translateY(-1px); }
  .run-btn:active:not(:disabled) { transform: translateY(0); }
  .run-btn[data-loading="true"] { animation: var(--animate-run-pulse); cursor: progress; }

  /* ----- Slider thumb glow on drag (works with shadcn slider) ----- */
  [data-slot="slider-thumb"] { transition: box-shadow 0.2s ease; }
  [data-slot="slider-thumb"]:hover,
  [data-slot="slider-thumb"]:active,
  [data-slot="slider-thumb"][data-dragging="true"] {
    box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.2), 0 0 14px rgba(0, 212, 255, 0.7);
  }
}
