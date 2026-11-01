// 16x16 pixel-art sprites drawn onto a <canvas>. Each character is one pixel.
// . = transparent, R = red, D = dark red, G = green, L = light green, W = shine

export const PALETTE = {
  R: "#e94f37",
  D: "#a8322a",
  G: "#3f8f3a",
  L: "#7bc96f",
  W: "#ffd6cc",
  B: "#5b8bd9",
  N: "#2e4f86",
};

export const TOMATO = [
  "......GG........",
  ".....GLLG.......",
  "...GGLGGLGG.....",
  "....RRGGRR......",
  "..RRRRRRRRRR....",
  ".RRWWRRRRRRRR...",
  ".RWWRRRRRRRRRD..",
  "RRWRRRRRRRRRRRD.",
  "RRRRRRRRRRRRRRD.",
  "RRRRRRRRRRRRRRD.",
  "RRRRRRRRRRRRRDD.",
  ".RRRRRRRRRRRRD..",
  ".RRRRRRRRRRRDD..",
  "..DRRRRRRRRDD...",
  "....DDDDDDD.....",
  "................",
];

export const COFFEE = [
  "................",
  "....W..W..W.....",
  ".....W..W..W....",
  "....W..W..W.....",
  "................",
  "..NNNNNNNNNN....",
  "..NBBBBBBBBNNN..",
  "..NBBBBBBBBN.N..",
  "..NBBBBBBBBN.N..",
  "..NBBBBBBBBNNN..",
  "..NBBBBBBBBN....",
  "...NBBBBBBN.....",
  "....NNNNNN......",
  ".NNNNNNNNNNNN...",
  "................",
  "................",
];

/**
 * Draw a sprite. `fill` (0..1) greys out the rows above the fill line so the
 * sprite looks like it is "filling up" as the session progresses.
 */
export function drawSprite(ctx, sprite, scale, fill = 1) {
  const rows = sprite.length;
  const cutoff = Math.floor(rows * (1 - fill));
  ctx.clearRect(0, 0, rows * scale, rows * scale);
  sprite.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      ctx.fillStyle = y < cutoff ? "#3a3a52" : PALETTE[ch];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    });
  });
}
