'use strict';

// Tabla de records local (localStorage) + estadísticas de mejor combo / líneas.

const SCORES_KEY = 'tetris-highscores';
const STATS_KEY = 'tetris-stats';
const MAX_SCORES = 5;

// Devuelve el top 5 de puntuaciones, ordenado descendente.
// Si no hay datos válidos en localStorage, devuelve un array vacío.
function loadScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES);
  } catch {
    return [];
  }
}

// ¿Esta puntuación entraría en el top 5 actual?
function qualifies(score) {
  const list = loadScores();
  return score > 0 && (list.length < MAX_SCORES || score > list[list.length - 1].score);
}

// Inserta una entrada, reordena, recorta a 5 y persiste.
// Devuelve el índice donde quedó (para resaltarla), o -1 si no entró.
function saveScore(entry) {
  const list = loadScores();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  list.splice(MAX_SCORES);
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(list));
  } catch {
    // localStorage no disponible (modo privado, cuota, etc.) - no se guardó
    return -1;
  }
  return list.indexOf(entry);
}

// Devuelve las estadísticas guardadas (mejor combo / mejores líneas).
function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const stats = JSON.parse(raw);
    if (!stats || typeof stats !== 'object') return { bestCombo: 0, bestLines: 0 };
    return {
      bestCombo: Number(stats.bestCombo) || 0,
      bestLines: Number(stats.bestLines) || 0,
    };
  } catch {
    return { bestCombo: 0, bestLines: 0 };
  }
}

// Actualiza las estadísticas, solo sobrescribiendo si el nuevo valor es mayor.
function updateStats({ combo, lines }) {
  const stats = loadStats();
  if (combo > stats.bestCombo) stats.bestCombo = combo;
  if (lines > stats.bestLines) stats.bestLines = lines;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignorar si localStorage no está disponible
  }
  return stats;
}

// Borra records y estadísticas.
function resetRecords() {
  localStorage.removeItem(SCORES_KEY);
  localStorage.removeItem(STATS_KEY);
}

// Renderiza el top 5 como <ol> dentro de `container`.
// `highlightIndex`, si es válido, marca esa entrada con la clase .highlight.
function renderScores(container, highlightIndex) {
  const list = loadScores();
  container.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'records-empty';
    empty.textContent = 'Sin records todavía';
    container.appendChild(empty);
    return;
  }

  const ol = document.createElement('ol');
  ol.className = 'records-list';
  list.forEach((entry, i) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} — ${entry.score.toLocaleString()}`;
    if (i === highlightIndex) li.classList.add('highlight');
    ol.appendChild(li);
  });
  container.appendChild(ol);
}
