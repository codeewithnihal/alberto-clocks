import React, { useEffect, useState } from 'react';

/**
 * Alberto Watch Company - Preloader Design 3 (Centered Logo Ring)  -  React / JSX
 *
 * Usage:
 *   import Preloader3 from './Preloader3';
 *
 *   function App() {
 *     const [loading, setLoading] = useState(true);
 *     return (
 *       <>
 *         {loading && <Preloader3 onComplete={() => setLoading(false)} />}
 *         <YourSite />
 *       </>
 *     );
 *   }
 *
 * Props (sab optional):
 *   logoImage    - apne logo ki image ka path (khali ho to SVG "A" monogram use hota hai)
 *   minDuration  - minimum dikhne ka time (ms), default 3000
 *   onComplete   - preloader khatam hone par call hota hai
 *   brand / sub / loadingText - text badalne ke liye
 *   size         - poori preloader ki chaudai, CSS value. Default 'min(380px,82vw,54vh)' (medium)
 *
 * Next.js mein use karna ho to file ke sabse upar  'use client';  laga dein.
 */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Montserrat:wght@300;400;500&display=swap');

.alb3-pre{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(ellipse at 50% 50%,#0b0a09 0%,#030303 55%,#000 100%);
  font-family:'Montserrat',Arial,sans-serif;overflow:hidden;transition:opacity .9s ease,visibility .9s ease}
.alb3-pre.alb3-hide{opacity:0;visibility:hidden}
.alb3-box{width:var(--w);display:flex;flex-direction:column;align-items:center;text-align:center}

.alb3-emblem{position:relative;width:calc(var(--w)*.5);height:calc(var(--w)*.5)}
.alb3-ring{position:absolute;inset:-2%;width:104%;height:104%;overflow:visible;filter:drop-shadow(0 0 6px rgba(240,185,95,.45))}
.alb3-flare{position:absolute;inset:-2%;will-change:transform}
.alb3-flare i{position:absolute;left:50%;top:0;width:calc(var(--w)*.2);height:calc(var(--w)*.05);margin:calc(var(--w)*-.025) 0 0 calc(var(--w)*-.1);border-radius:50%;
  background:radial-gradient(ellipse,rgba(255,244,210,1) 0%,rgba(255,205,115,.55) 28%,rgba(255,205,115,0) 70%);filter:blur(1.5px)}
.alb3-flare b{position:absolute;left:50%;top:0;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:#fff6d8;box-shadow:0 0 10px 3px rgba(255,214,130,.9)}
.alb3-mark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;animation:alb3-rise 1.1s .15s ease forwards}
.alb3-mark svg{width:58%;height:auto;filter:drop-shadow(0 2px 5px rgba(0,0,0,.7))}
.alb3-mark img{width:58%;height:auto;object-fit:contain;filter:drop-shadow(0 2px 5px rgba(0,0,0,.7))}

.alb3-brand{margin-top:calc(var(--w)*.1);font-family:'Cinzel','Trajan Pro',Georgia,serif;font-weight:500;font-size:calc(var(--w)*.148);line-height:1;
  letter-spacing:.2em;margin-right:-.2em;white-space:nowrap;
  background:linear-gradient(180deg,#fbe6b0 0%,#dcae60 50%,#b98736 75%,#f0cd8c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  opacity:0;animation:alb3-rise 1.1s .4s ease forwards}
.alb3-sub{margin-top:calc(var(--w)*.045);font-weight:300;font-size:calc(var(--w)*.041);letter-spacing:.4em;margin-right:-.4em;color:#e7d3a3;white-space:nowrap;
  opacity:0;animation:alb3-rise 1.1s .6s ease forwards}
.alb3-rule{width:calc(var(--w)*.13);height:1px;margin-top:calc(var(--w)*.1);background:linear-gradient(90deg,transparent,#d9ad62,transparent);
  opacity:0;animation:alb3-rise 1.1s .8s ease forwards}
.alb3-loading{margin-top:calc(var(--w)*.1);font-weight:400;font-size:calc(var(--w)*.037);letter-spacing:.5em;margin-right:-.5em;color:#e6d2a2;white-space:nowrap;
  opacity:0;animation:alb3-rise 1.1s .95s ease forwards}

.alb3-bar{position:relative;width:calc(var(--w)*.91);height:calc(var(--w)*.036);margin-top:calc(var(--w)*.035);border-radius:20px;
  background:linear-gradient(180deg,#0b0b0a,#050505);border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 3px rgba(0,0,0,.9);overflow:hidden;
  opacity:0;animation:alb3-rise 1.1s 1.05s ease forwards}
.alb3-fill{position:absolute;left:1px;top:1px;bottom:1px;width:0;border-radius:20px;
  background:linear-gradient(180deg,#fbe9b8 0%,#e9c27c 45%,#b98a3e 100%);box-shadow:0 0 10px rgba(240,190,100,.45)}
.alb3-fill::before{content:'';position:absolute;left:4px;right:4px;top:1px;height:35%;border-radius:20px;background:rgba(255,255,255,.35)}
.alb3-pct{margin-top:calc(var(--w)*.04);font-weight:400;font-size:calc(var(--w)*.04);letter-spacing:.1em;color:#e8d6aa;
  opacity:0;animation:alb3-rise 1.1s 1.15s ease forwards}

@keyframes alb3-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
`;

export default function Preloader3({
  logoImage = '',
  minDuration = 3000,
  onComplete,
  brand = 'ALBERTO',
  sub = 'WATCH COMPANY',
  loadingText = 'LOADING...',
  size = 'min(380px,82vw,54vh)',
}) {
  const [value, setValue] = useState(0);   /* 0 - 100 */
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let pageLoaded = document.readyState === 'complete';
    const onLoad = () => (pageLoaded = true);
    if (!pageLoaded) window.addEventListener('load', onLoad);

    const startTime = performance.now();
    let shown = 0;
    let raf;
    let finished = false;
    const timers = [];

    const tick = () => {
      if (finished) return;
      const elapsed = performance.now() - startTime;
      const timeTarget = Math.min(90, (elapsed / minDuration) * 90);
      const target = pageLoaded && elapsed >= minDuration ? 100 : Math.min(timeTarget, 90);

      if (shown < target) {
        shown = Math.min(target, shown + Math.max(0.35, (target - shown) * 0.06));
        setValue(shown);
      }

      if (shown >= 100) {
        finished = true;
        timers.push(
          setTimeout(() => {
            setHide(true);
            timers.push(
              setTimeout(() => {
                setGone(true);
                if (onComplete) onComplete();
              }, 950)
            );
          }, 450)
        );
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      finished = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('load', onLoad);
      document.documentElement.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDuration]);

  if (gone) return null;

  const pct = Math.round(value);
  const flareOpacity = value >= 100 ? 0 : value > 0.5 ? 1 : value * 2;

  return (
    <div
      className={'alb3-pre' + (hide ? ' alb3-hide' : '')}
      style={{ '--w': size }}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <style>{CSS}</style>

      <div className="alb3-box">
        {/* ---------- logo circle ---------- */}
        <div className="alb3-emblem">
          <svg className="alb3-ring" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="alb3Rg" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff2cc" />
                <stop offset=".35" stopColor="#f1cf8a" />
                <stop offset=".7" stopColor="#cfa04e" />
                <stop offset="1" stopColor="#8a6126" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48.4" fill="none" stroke="rgba(150,105,45,.3)" strokeWidth="1.6" />
            <circle
              cx="50"
              cy="50"
              r="48.4"
              fill="none"
              stroke="url(#alb3Rg)"
              strokeWidth="1.9"
              pathLength="100"
              strokeDasharray={`${value} 100`}
              transform="rotate(-90 50 50)"
            />
          </svg>

          <div className="alb3-flare" style={{ transform: `rotate(${value * 3.6}deg)`, opacity: flareOpacity }}>
            <i />
            <b />
          </div>

          <div className="alb3-mark">
            {logoImage ? (
              <img src={logoImage} alt="" />
            ) : (
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="alb3Ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fbe6b0" />
                    <stop offset=".55" stopColor="#d9aa5b" />
                    <stop offset="1" stopColor="#a97a31" />
                  </linearGradient>
                </defs>
                <text x="50" y="86" textAnchor="middle" fontFamily="Cinzel,Georgia,serif" fontWeight="500" fontSize="94" fill="url(#alb3Ag)">
                  A
                </text>
                <path d="M4 52C22 78 66 80 96 46C80 62 58 66 40 60C28 56 18 56 4 52Z" fill="#050403" opacity=".55" transform="translate(0 1.4)" />
                <path d="M4 52C22 78 66 80 96 46C80 62 58 66 40 60C28 56 18 56 4 52Z" fill="url(#alb3Ag)" />
                <path d="M14 53C30 62 52 66 76 58" fill="none" stroke="#fff0c4" strokeWidth=".7" opacity=".7" />
              </svg>
            )}
          </div>
        </div>

        {/* ---------- texts ---------- */}
        <div className="alb3-brand">{brand}</div>
        <div className="alb3-sub">{sub}</div>
        <div className="alb3-rule" />
        <div className="alb3-loading">{loadingText}</div>

        {/* ---------- progress bar ---------- */}
        <div className="alb3-bar">
          <div className="alb3-fill" style={{ width: `calc(${value}% - 2px)` }} />
        </div>
        <div className="alb3-pct">{pct}%</div>
      </div>
    </div>
  );
}
