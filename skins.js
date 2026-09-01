'use strict';

// Clave de localStorage para persistir el skin elegido.
const SKIN_KEY = 'tetris-skin';

// Cada skin define su propia paleta de colores (mismo formato de 9 entradas
// que COLORS en game.js: índice 0 = vacío, 1-7 = piezas estándar, 8 = anillo),
// sus colores de rejilla por tema, y una función drawBlock(ctx, px, py, size, color, alpha)
// que recibe coordenadas ya convertidas a píxeles (game.js hace la conversión
// celda -> píxel una sola vez antes de delegar aquí).
const SKINS = {
  retro: {
    label: 'Retro',
    colors: [
      null,
      '#4dd0e1', // I - cyan
      '#ffd54f', // O - yellow
      '#ba68c8', // T - purple
      '#81c784', // S - green
      '#e57373', // Z - red
      '#90caf9', // J - pale blue
      '#ffb74d', // L - orange
      '#c8a2ff', // Ring - lila
    ],
    grid: { dark: '#22222e', light: '#d8d8e6' },
    drawBlock(ctx, px, py, size, color, alpha) {
      // Comportamiento idéntico al drawBlock original: relleno plano + brillo superior.
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(px + 1, py + 1, size - 2, 4);
    },
  },

  neon: {
    label: 'Neon',
    colors: [
      null,
      '#00f5ff', // I - cyan saturado
      '#fff200', // O - amarillo saturado
      '#e100ff', // T - magenta
      '#39ff14', // S - verde neón
      '#ff2d55', // Z - rojo neón
      '#2979ff', // J - azul saturado
      '#ff9100', // L - naranja saturado
      '#d500f9', // Ring - violeta neón
    ],
    grid: { dark: '#1a1a1a', light: '#333333' },
    drawBlock(ctx, px, py, size, color, alpha) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(px + 1, py + 1, size - 2, 4);
      // Importante: resetear el shadowBlur para que el brillo no se filtre
      // a la rejilla ni a otros dibujos que compartan el mismo contexto.
      ctx.shadowBlur = 0;
    },
  },

  pastel: {
    label: 'Pastel',
    colors: [
      null,
      '#a8dadc', // I
      '#f6e6b4', // O
      '#d8bfd8', // T
      '#b8e0c2', // S
      '#f4b6b6', // Z
      '#b8d0f0', // J
      '#f6cfa0', // L
      '#dcc6f0', // Ring
    ],
    grid: { dark: '#2a2a35', light: '#e6e6ee' },
    drawBlock(ctx, px, py, size, color, alpha) {
      const x = px + 1;
      const y = py + 1;
      const w = size - 2;
      const h = size - 2;
      const radius = 6;
      ctx.fillStyle = color;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
      } else {
        // Fallback para entornos sin soporte de roundRect.
        ctx.fillRect(x, y, w, h);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x, y, w, 4);
    },
  },

  pixel: {
    label: 'Pixel art',
    colors: [
      null,
      '#4dd0e1',
      '#ffd54f',
      '#ba68c8',
      '#81c784',
      '#e57373',
      '#90caf9',
      '#ffb74d',
      '#c8a2ff',
    ],
    grid: { dark: '#22222e', light: '#d8d8e6' },
    drawBlock(ctx, px, py, size, color, alpha) {
      const x = px + 1;
      const y = py + 1;
      const w = size - 2;
      const h = size - 2;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
      // Textura de tablero de ajedrez para simular pixel-art.
      const tile = 6;
      for (let ty = 0; ty * tile < h; ty++) {
        for (let tx = 0; tx * tile < w; tx++) {
          const dark = (tx + ty) % 2 === 0;
          ctx.fillStyle = dark ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)';
          const tw = Math.min(tile, w - tx * tile);
          const th = Math.min(tile, h - ty * tile);
          ctx.fillRect(x + tx * tile, y + ty * tile, tw, th);
        }
      }
      // Borde marcado para reforzar el aspecto de sprite pixelado.
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    },
  },
};

// Devuelve el nombre del skin guardado en localStorage si es válido,
// o 'retro' por defecto.
function getPreferredSkin() {
  const stored = localStorage.getItem(SKIN_KEY);
  return Object.prototype.hasOwnProperty.call(SKINS, stored) ? stored : 'retro';
}

// Aplica el skin al documento (mismo patrón que applyTheme con data-theme).
function applySkin(name) {
  document.documentElement.setAttribute('data-skin', name);
}
