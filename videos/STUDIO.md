# GEOMETOR Phyllotaxis — Studio Production Overlay (`videos/STUDIO.md`)

This project overlay defines how the unified **PHOTON Studio** engine (`photon_platform.studio`) renders, verifies, archives, and broadcasts botanical growth, golden-angle spiral, and 3D meristem propagation animations for [`geometor/phyllotaxis`](https://github.com/geometor/phyllotaxis).

---

## 1. Channel & Authentication Routing

- **YouTube Channel**: `@geometor`
- **OAuth Token**: `~/.config/photon/youtube_token.json`
- **Default Privacy**: `unlisted` (promoted to `public` explicitly when ready)
- **Channel Verification Guardrail**: `studio broadcast publish` verifies `channels.list(mine=True)` matches `@geometor` before any upload or metadata update proceeds.

```bash
studio broadcast status
studio broadcast auth --channel @geometor
```

---

## 2. Rendering Architecture — Mode 2 (`studio motion`)

Phyllotaxis interactive visualizers live in `docsrc/_templates/` (`demo_2d.html`, `demo_3d.html`) and compile via `publish build` into `docs/demos/`:

- **2D Planar Meristem & Parastichies**: `docs/demos/meristem_2d.html`
- **3D Recursive Node-as-Path & Apical Stem**: `docs/demos/propagation_3d.html`

All continuous growth and orbital camera animations use **Mode 2 (`studio motion`)**:

- **Master 16:9 QHD (VP9 Trigger)**: `2560x1440` at `30.00 fps` (`phyllotaxis_<slug>_1080p.mp4`)
- **Vertical 9:16 Short**: `1080x1920` at `30.00 fps` (`phyllotaxis_<slug>_short.mp4`)
- **Declarative Spec**: Each package directory (`videos/<slug>/`) contains `motion.json` (camera keyframes or deterministic `window.setModelStateAtTime(t)` hooks) and `youtube.json`.
- **Clean FFmpeg Encoding Mandate**:
  - **NEVER** pass `-vf` grain, `fps=`, `setsar=`, or color-matrix overrides (only `-vf vflip` when piping raw `gl.readPixels` RGBA buffers).
  - Always encode H.264 (`libx264`, `-crf 16`, `-pix_fmt yuv420p`, `-movflags +faststart`) with 48 kHz AAC stereo (`-c:a aac -b:a 192k`).

### Common Commands

```bash
# Preview 5 deterministic keyframes without full encode
studio motion videos/unfolding --test-frames

# Full 2560x1440 QHD + 1080x1920 Short WebGL motion render
studio motion videos/unfolding

# Re-encode an existing frames/ sequence with clean FFmpeg flags
studio motion videos/unfolding --encode-only

# FFprobe 1440p VP9 + 9:16 Short verification gatekeeper
studio verify videos/unfolding
```

---

## 3. Three-Tier Storage & Google Drive Archive

1. **Tier 1 — Git-Tracked Source** (`videos/<slug>/`):
   - `STUDIO.md`, `*.scr`, `motion.json`, `camera_path.json`, `youtube.json`
2. **Tier 2 — Master Deliverables** (Git-ignored locally; backed up to Google Drive via `rclone`):
   - `phyllotaxis_<slug>_1080p.mp4`, `phyllotaxis_<slug>_short.mp4`, `*.wav`, `*_thumb.png`, `.tts_cache/`
3. **Tier 3 — Ephemeral Build Scratch** (Git-ignored; safely purged after archive verification):
   - `frames/`, `test_frames/`, `segments/`, `stage.html`, `*_concat.txt`

```bash
# Audit local Tier 1 / Tier 2 / Tier 3 sizes
studio archive scan videos/

# Back up Tier 1 + Tier 2 masters to Google Drive (geometor/phyllotaxis/videos)
studio archive sync videos/ geometor/phyllotaxis/videos

# Reclaim Tier 3 scratch only after remote checksum verification
studio archive clean videos/ --remote geometor/phyllotaxis/videos
```
