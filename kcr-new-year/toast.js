(() => {
  "use strict";

  const button = document.querySelector(".toast-button");
  const canvas = document.querySelector(".toast-confetti");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Freesound #573157 (fleurescence, CC0), timed to the contact pose at 325 ms.
  const chime = new Audio("assets/holiday/glass-chime.wav");
  chime.preload = "auto";

  // Size 16, light. Poses, pauses and easing from Figma's Champagne toast variants.
  const poses = {
    resting: {
      leftGlass: "translate(1.8167px, 2.769px) rotate(9.6905deg)",
      rightGlass: "translate(7.3818px, 3.9307px) rotate(-9.6905deg)",
      leftRay: "translate(5.247px, 0.8469px)",
      rightRay: "translate(8.623px, 0.8469px)",
      leftBubble: "translate(0px, 0px)",
      rightBubble: "translate(0px, 0px)",
      rayOpacity: 1,
    },
    lift: {
      leftGlass: "translate(2.1664px, 2.4099px) rotate(10.5505deg)",
      rightGlass: "translate(7.1237px, 3.7361px) rotate(-10.1905deg)",
      leftRay: "translate(5.215px, 0.783px)",
      rightRay: "translate(8.655px, 0.783px)",
      leftBubble: "translate(0.016px, -0.0403px)",
      rightBubble: "translate(-0.0146px, -0.0367px)",
      rayOpacity: 0.96,
    },
    clink: {
      leftGlass: "translate(2.6687px, 2.0742px) rotate(12.0305deg)",
      rightGlass: "translate(6.691px, 3.4927px) rotate(-11.5505deg)",
      leftRay: "translate(5.0551px, 0.5911px)",
      rightRay: "translate(8.8151px, 0.5911px)",
      leftBubble: "translate(0.096px, -0.0806px)",
      rightBubble: "translate(-0.0874px, -0.0734px)",
      rayOpacity: 1,
    },
    straighten: {
      leftGlass: "translate(2.1738px, 2.2285px) rotate(9.5705deg)",
      rightGlass: "translate(7.0945px, 3.301px) rotate(-9.2705deg)",
      leftRay: "translate(4.943px, 0.4949px)",
      rightRay: "translate(8.927px, 0.4949px)",
      leftBubble: "translate(0.192px, -0.2016px)",
      rightBubble: "translate(-0.1747px, -0.1835px)",
      rayOpacity: 0.91,
    },
    rebound: {
      leftGlass: "translate(1.6931px, 2.5645px) rotate(7.5905deg)",
      rightGlass: "translate(7.4897px, 3.4414px) rotate(-7.9405deg)",
      leftRay: "translate(5.0229px, 0.6072px)",
      rightRay: "translate(8.8472px, 0.6072px)",
      leftBubble: "translate(0.048px, -0.1344px)",
      rightBubble: "translate(-0.0437px, -0.1223px)",
      rayOpacity: 0.84,
    },
    settle: {
      leftGlass: "translate(1.8167px, 2.769px) rotate(9.6905deg)",
      rightGlass: "translate(7.3818px, 3.9307px) rotate(-9.6905deg)",
      leftRay: "translate(5.247px, 0.8469px)",
      rightRay: "translate(8.623px, 0.8469px)",
      leftBubble: "translate(0px, 0px)",
      rightBubble: "translate(0px, 0px)",
      rayOpacity: 1,
    },
  };
  const stages = [
    { time: 0, pose: poses.resting, easing: "cubic-bezier(.26, 0, .62, .7)" },
    { time: 178, pose: poses.lift, easing: "linear" },
    { time: 195, pose: poses.lift, easing: "cubic-bezier(.28, .153, .67, .76)" },
    { time: 325, pose: poses.clink, easing: "linear" },
    { time: 342, pose: poses.clink, easing: "cubic-bezier(.27, .088, .62, .735)" },
    { time: 470, pose: poses.straighten, easing: "linear" },
    { time: 487, pose: poses.straighten, easing: "cubic-bezier(.28, .255, .63, 1)" },
    { time: 632, pose: poses.rebound, easing: "linear" },
    { time: 649, pose: poses.rebound, easing: "cubic-bezier(.31, 0, .32, 1)" },
    { time: 963, pose: poses.settle, easing: "linear" },
  ];
  const duration = stages.at(-1).time;

  const tracks = [...button.querySelectorAll("[data-toast-part]")].map((part) => {
    const name = part.dataset.toastPart;
    const hasOpacity = name.endsWith("Ray");
    const frames = stages.map(({ time, pose, easing }) => ({
      offset: time / duration,
      easing,
      transform: pose[name],
      opacity: hasOpacity ? pose.rayOpacity : 1,
    }));
    return { part, frames };
  });

  let animations = [];

  function finishConfetti() {
    canvas.hidden = true;
    button.removeAttribute("aria-disabled");
  }

  function startConfetti() {
    if (reducedMotion.matches || !canvas.getContext("2d")) {
      finishConfetti();
      return;
    }

    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    canvas.hidden = false;
    // Start above the viewport so the pieces drift in at different times.
    new window.Confetti(canvas, {
      numberOfPieces: 420,
      tweenDuration: 3600,
      gravity: 0.048,
      initialVelocityX: 0.8,
      initialVelocityY: { min: 0.6, max: 1.7 },
      confettiSource: { x: 0, y: -32, w: canvas.width, h: 20 },
      recycle: false,
      onConfettiComplete: finishConfetti,
    });
  }

  button.addEventListener("click", () => {
    if (button.getAttribute("aria-disabled") === "true") return;
    chime.currentTime = 0;
    chime.play().catch(() => {});
    if (reducedMotion.matches) return;

    button.setAttribute("aria-disabled", "true");
    for (const animation of animations) animation.cancel();
    animations = tracks.map(({ part, frames }) => part.animate(frames, { duration }));
    // Let the glasses settle, then leave a short pause before the confetti.
    Promise.all(animations.map((animation) => animation.finished)).then(
      () => setTimeout(startConfetti, 400),
      finishConfetti,
    );
  });
})();
