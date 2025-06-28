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
    const size = Math.random() * 1.2 + 0.6;
    const delay = Math.random() * 3;
    stars += `<div class="star" style="left:${x}vw;top:${y}vh;width:${size}px;height:${size}px;animation-delay:${delay}s"></div>`;
  }
  starBg.innerHTML = stars;
});
