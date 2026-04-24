export function getRandomNeonColor() {
  const colors = ['#00ffff', '#8000ff', '#00ff00', '#ff00ff', '#0088ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}
