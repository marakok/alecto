/**
 * Slowed clips, played smoothly. A clip has a fixed number of frames a second; at a third or a sixth of its speed
 * each frame stays up three or six times as long, so the light moves in small steps. Here the clip is drawn on a
 * canvas in its place, and each new frame is crossfaded in over the time it is on screen, so the light glides from
 * one frame to the next. For slow light on a wall this reads as smooth motion.
 *
 * The video keeps playing (hidden, .is-source) and stays in charge: its source (theme-video.js), speed and the
 * opacity a page sets on it (story.js) carry over to the canvas, which takes its classes, so it sits and is styled
 * exactly as the video was. Needs requestVideoFrameCallback; without it the video simply shows as it is.
 */
export function smoothVideo(video) {
  if (!video || video.dataset.smooth || !('requestVideoFrameCallback' in HTMLVideoElement.prototype)) return;
  video.dataset.smooth = '1';
  const canvas = document.createElement('canvas');
  canvas.className = `${video.className} smooth`;
  canvas.setAttribute('aria-hidden', 'true');
  video.after(canvas);
  video.classList.add('is-source');
  const ctx = canvas.getContext('2d');
  const prev = document.createElement('canvas'); // the frame we fade from
  const cur = document.createElement('canvas'); // the frame we fade to
  const pctx = prev.getContext('2d');
  const cctx = cur.getContext('2d');

  let shownAt = 0; // when the current frame arrived (performance.now)
  let hold = 40; // how long it stays up, in ms: frame length / playback rate
  let lastMedia = -1;

  const size = (w, h) => {
    if (!w || !h || (canvas.width === w && canvas.height === h)) return;
    [canvas, prev, cur].forEach((c) => { c.width = w; c.height = h; });
  };
  const onFrame = (now, meta) => {
    size(meta.width || video.videoWidth, meta.height || video.videoHeight);
    pctx.drawImage(cur, 0, 0);
    cctx.drawImage(video, 0, 0, cur.width, cur.height);
    const dm = meta.mediaTime - lastMedia;
    if (lastMedia >= 0 && dm > 0 && dm < 1) hold = (dm / (video.playbackRate || 1)) * 1000;
    lastMedia = meta.mediaTime;
    shownAt = now;
    video.requestVideoFrameCallback(onFrame);
  };
  video.requestVideoFrameCallback(onFrame);
  video.addEventListener('emptied', () => { lastMedia = -1; }); // a new source (theme swap)

  const draw = (now) => {
    if (canvas.width) {
      const k = Math.min(1, (now - shownAt) / hold);
      ctx.globalAlpha = 1;
      ctx.drawImage(prev, 0, 0);
      ctx.globalAlpha = k;
      ctx.drawImage(cur, 0, 0);
    }
    canvas.style.opacity = video.style.opacity; // a page may fade the video (story.js)
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
