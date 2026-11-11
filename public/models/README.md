# 3D models

The hero now uses the supplied **Gold Diver** model, which is code (`src/components/GoldDiverWatch.jsx`, rendered by
`src/components/HeroWatch3D.jsx`), so no model file is needed for it.

`two_tone_luxury_dive_watch.glb` (supplied earlier) is kept here with the `Watch3DViewer` component
(`src/components/Watch3DViewer.jsx`), but is **no longer used on any page**: the standalone viewer was removed from
the home page as requested. Delete both if you do not need them, or reuse them on a product page with
`<Watch3DViewer src={assetUrl("models/two_tone_luxury_dive_watch.glb")} alt="…" />`.
