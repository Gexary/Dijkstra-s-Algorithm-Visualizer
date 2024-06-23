const w = 512; // Canvas Width
const h = 512; // Canvas height

const colors = {
    1: "rgba(0, 0, 0, 0.2)", // not visited
    2: "#1cad08", // visited
    3: "#f6bf0b", // processing
    4: "#e41b10", // impossible
    5: "#1561e6", // selected
};

const canvasPadding = 40;
function randW() {
    return rand(canvasPadding, w - canvasPadding);
}
function randH() {
    return rand(canvasPadding, h - canvasPadding);
}
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const nodeConfig = {
    radius: 24,
    borderWidth: 2,
    textSize: 16,
    lerpSpeed: 0.2,
};

const edgeConfig = {
    borderWidth: 2,
    idealLength: 200, // Ideal edge length
};

function isPointInCircle(pos, x, y, radius) {
    const dx = pos.x - x;
    const dy = pos.y - y;
    return dx * dx + dy * dy <= radius * radius;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Fonction pour vérifier si un point est sur un segment de ligne avec une bordure donnée
function isPointOnSegment(px, py, x1, y1, x2, y2, border) {
    // Calculer la distance perpendiculaire du point à la ligne
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Vérifier si le point est à une distance acceptable de la ligne
    return distance <= border;
}

export { colors, isPointOnSegment, lerp, isPointInCircle, w, h, randW, randH, rand, nodeConfig, edgeConfig };
