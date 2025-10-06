# Viewport Scaling Completion Plan

## 1. Status Toggle (Mode Switch)
- Status: ✅ Completed — `.status-toggle` now exposes viewport-based variables that the track/thumb consume, and the small-height overrides were removed.
- Follow-up: sanity-check the toggle visuals on desktop/tablet/phone.

## 2. Personal Score Grid
- Status: completed
- Result:
  - Added viewport-driven custom properties (`--score-container-*`, `--score-btn-*`) and wired them through the personal grid/buttons.
  - Replaced the pixel caps with `clamp()`/`min()` logic tied to `var(--vh, 1vh)` so the layout scales cleanly across breakpoints.
  - Reworked the coarse-pointer override to retune those props instead of forcing a fixed `min-height`.
- QA: Pending manual verification on desktop, tablet, and phone widths.

## 3. Multi-player Score Buttons
- Status: completed
- Result:
  - Introduced `--multi-row-btn-*` custom properties on `.player-rows-container` and updated `.player-row-btn` to consume them.
  - Replaced the hard-coded `font-size`/`min-height`/`padding` rules in the small-height breakpoints with viewport-aware clamps applied through those variables.
  - Extended the coarse-pointer override to retune the same variables so touch layouts gain extra height, padding, and type size without px fallbacks.
- QA: Playwright regression run across 1440x900, 1024x768, and iPhone 12 viewports confirmed the expected clamp outputs; manual UX sweep still advised.

## 4. Mode Toggle Buttons (`.toggle-btn`)
- Status: completed
- Result:
  - Added `--toggle-btn-*` custom properties on `.mode-toggle` and refactored `.toggle-btn` to consume viewport-clamped padding, font, radius, and width guards.
  - Replaced the legacy breakpoint overrides with variable tweaks that scale for the 800px/700px height scenarios instead of forcing pixel padding/font values.
  - Extended the coarse-pointer media query to inflate the same variables so touch devices receive larger targets without new px caps.
- QA: Playwright sweep (1440x900, 1280x780, 1024x680, iPhone 12) verified padding, font, and width clamps; recommend a quick manual toggle tap-test.

## 5. Validation & Cleanup
- Status: completed
- Result:
  - Swept the personal/multi/toggle styles for leftover fixed px caps; everything now routes through the new viewport-driven custom properties.
  - Automated Playwright checks now cover personal score grid (desktop/tablet/phone), multi-player rows (desktop/tablet/phone), and mode toggle buttons (desktop, short-height desktop, phone). Logs retained in the CLI session.
- Next: optional quick manual UX pass, then archive this plan.
