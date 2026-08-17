VISUAL POLISH PASS — Drift-Sense

The functionality is working correctly, but the visual design needs a serious upgrade. It currently reads as a generic dark dashboard template. Push it toward a premium, purpose-built scientific instrument aesthetic — think Bloomberg Terminal meets a semiconductor fab's inspection software, not a generic SaaS admin panel. Fix the following specific issues and apply the design system below.

BUGS / CLUTTER TO FIX FIRST
- The image annotation overlay currently shows TWO overlapping markers on the detected region (a white crosshair labeled "REF · 75.3%" AND a separate cyan box with an orange up-arrow underneath it). Merge these into ONE clean, unambiguous marker. Remove the redundant crosshair — keep a single glowing bounding box with the confidence label attached to its corner, not floating separately.
- "Session History" shows "1 runs" — fix pluralization so it correctly reads "1 run" vs "3 runs" etc.
- The zoom/pan thumbnail strip at the very top-left is cut off and unclear — either give it proper padding and a visible frame, or redesign it as a small labeled minimap in a corner of the main viewer.
- Right-side metric cards (Confidence, Drift X, Drift Y, Drift Magnitude, Correction Vector, Proc. Time, Method) are visually flat and repetitive — differentiate the PRIMARY metric (Confidence) from secondary ones with size, not just color.

TYPOGRAPHY
- Use a monospace font (e.g. JetBrains Mono or IBM Plex Mono) exclusively for all numeric/technical readouts (percentages, nm values, coordinates, timestamps) to reinforce the instrumentation feel.
- Use a clean geometric sans-serif (e.g. Inter or Space Grotesk) for all labels, headers, and buttons.
- Establish a real type scale: hero metric (Confidence %) should be noticeably larger than everything else on the page — at least 2x the size of secondary metric values.
- Increase letter-spacing on all-caps labels (CONFIDENCE, DRIFT X, etc.) slightly more for a more "instrument panel" feel.

COLOR & DEPTH SYSTEM
- Move away from flat solid-color cards. Give each card a subtle 1px inner border with a soft outer glow that matches its accent color (cyan for neutral/info, amber for medium confidence, green for high confidence, red for low/no-match).
- Add a very subtle vertical gradient to the main background (near-black to a barely-there deep navy) instead of flat black, so the UI has depth.
- Add a soft glow/bloom effect around the detected bounding box on the image itself — it should look like it's actively "lit up" by the analysis, not just a plain stroked rectangle.
- The confidence progress bar should have a subtle glow trailing the fill, and should animate filling from 0 to the final value over ~800ms when results appear, not snap instantly.

IMAGE VIEWER / ANNOTATION UPGRADE
- Redesign the detected-region marker as: a single rounded-corner bounding box with an animated pulsing glow (slow breathe animation, 2s loop), a small corner tag showing the confidence %, and a thin animated scan-line that sweeps across the box once when results first appear.
- Add a small radial gradient "spotlight" dimming the rest of the image slightly around the detected region so the eye is drawn there immediately.
- Improve the confidence heatmap overlay so it uses a proper multi-stop gradient (deep blue → teal → yellow → red) with a small legend/colorbar in a corner when toggled on, instead of a flat tint.
- Add subtle grid coordinate labels (e.g. faint nm rulers) along the top and left edge of the image viewer for a more technical/instrumentation feel.

LAYOUT & SPACING
- Increase breathing room between the three panels (config / image / results) — add clear vertical divider lines with a subtle glow rather than hard borders.
- Group the two toggle switches (Confidence Heatmap, View: Corrected/Pre-Correction) into a single small "Display Options" card with a header, rather than floating loose.
- Give the "RUN ANALYSIS" button more visual weight — larger, with a subtle animated gradient border or glow when idle, and a clear loading/pulsing state while processing.

MICRO-INTERACTIONS
- Metric numbers should count up/tween from 0 to their final value over ~600-900ms when a new result lands, not appear instantly.
- Hovering a session history entry should highlight the corresponding region on the image (if that run's image is still loaded) or at least show a tooltip with full details.
- Slider handles should have a soft glow on drag and show a live floating value tooltip above the thumb while dragging.
- Add a subtle success animation (brief green flash/pulse across the "MATCH FOUND" badge) the moment a run completes successfully, and a red shake/pulse for "no match found."

OVERALL GOAL
Everything should feel intentional, alive, and precise — like the user is looking at real-time output from a working AI inspection system, not a static Figma layout. Prioritize the image viewer and the confidence/results panel as the visual centerpieces; the configuration panel can stay more utilitarian since it's a control surface, not the "wow" moment.