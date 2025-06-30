// Optional: Animated starry background using CSS only
// This script creates a simple star field using CSS for visual polish
// No external dependencies required

document.addEventListener('DOMContentLoaded', function() {
  const starBg = document.getElementById('star-bg');
  if (!starBg) return;
  let stars = '';
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 1.2 + 0.4;
    const delay = Math.random() * 3;
    const duration = 2 + Math.random() * 2; // 2-4s
    // Random color: mostly white, some blue/yellow
    const colors = ['#fff', '#ffe9c4', '#b5caff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = 0.5 + Math.random() * 0.5;
    stars += `<div class="star" style="
      left:${x}vw;top:${y}vh;width:${size}px;height:${size}px;
      background:${color};opacity:${opacity};
      animation-delay:${delay}s;animation-duration:${duration}s"></div>`;
  }
  starBg.innerHTML = stars;
});
