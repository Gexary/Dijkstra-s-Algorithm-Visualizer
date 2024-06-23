const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

import { w, h, nodeConfig, edgeConfig, rand } from "./utils.js";

const attractToCenter = document.getElementById("attract-to-center");
const forceDirectedLayout = document.getElementById("force-directed-layout");

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

let pixelRatio = 0;
function resizeCanvas() {
    pixelRatio = Math.ceil(window.devicePixelRatio || 1); // Pixel Ratio
    // const pixelRatio = 1; // Pixel Ratio
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
}
resizeCanvas();

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: parseInt(e.clientX - rect.left),
        y: parseInt(e.clientY - rect.top),
    };
}

export { getMousePos };

canvas.setAttribute("tabindex", "0");
canvas.focus();

// window.addEventListener("resize", resizeCanvas, false);

document.onkeydown = (event) => {
    if (event.ctrlKey && event.key === "b") {
        const image = canvas.toDataURL("image/png", 1.0);
        console.log(image);
    }
};

/*
















*/
let interaction = true;
let disabled = false;
function disableInteraction() {
    interaction = false;
}
function enableInteraction() {
    interaction = true;
}
export { disableInteraction, enableInteraction };
const input = document.createElement("input");
input.style.position = "absolute";
input.classList.add("input");
document.body.appendChild(input);

let lastTime;
let deltaTime = 0;
function calculate() {
    const currentTime = Date.now();
    if (!lastTime) lastTime = currentTime;
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
}

import Graph from "./graph.js";
import Edge from "./edge.js";
import Node from "./node.js";

const graph = new Graph();

// Add nodes
graph.addNode(graph.getName(), (w / 3) * 1, (h / 3) * 1);
graph.addNode(graph.getName(), (w / 3) * 2, (h / 3) * 1);
graph.addNode(graph.getName(), (w / 3) * 2, (h / 3) * 2);
graph.addNode(graph.getName(), (w / 3) * 1, (h / 3) * 2);

// Add edges
graph.addEdge("A", "B", 10);
graph.addEdge("B", "C", 20);
graph.addEdge("C", "D", 30);
graph.addEdge("D", "A", 40);

// Add edges
graph.addEdge("A", "B", 1);
graph.addEdge("B", "C", 2);
graph.addEdge("C", "D", 3);
graph.addEdge("D", "A", 4);

function render() {
    clear();
    calculate();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    if (attractToCenter.checked) translateNodesToCenter();
    if (forceDirectedLayout.checked) {
        calculateForces();
        updateNodePositions();
    }

    graph.handleNodesPos();

    drawEdgeEditing();

    graph.drawEdges(ctx);
    graph.drawNodes(ctx);

    renderDisabling();

    window.requestAnimationFrame(render);
}

function toggleInput() {
    disabled = true;
    input.style.display = "block";
    input.value = "";
    const rect = canvas.getBoundingClientRect();
    input.style.top = window.scrollY + rect.top + h / 2 - input.offsetHeight / 2 + "px";
    input.style.left = window.scrollX + rect.left + w / 2 - input.offsetWidth / 2 + "px";
    input.focus();
    handleCursor(mousePos);
}
function disableInput() {
    disabled = false;
    input.style.display = "none";
    handleCursor(mousePos);
}

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const value = input.value;
        if (task[0] === 0 && value.trim() !== "") {
            graph.renameNode(task[1], value);
        } else if (task[0] === 1 && value.trim() !== "") {
            graph.checkEdgeExists(task[1], task[2], parseFloat(value));
        }
        disableInput();
        task = null;
        handleCursor(mousePos);
    } else if (e.key === "Escape") {
        e.preventDefault();
        disableInput();
        task = null;
        handleCursor(mousePos);
    }
});

function renderDisabling() {
    if (disabled) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, w, h);
    }
}

function drawEdgeEditing() {
    if (edgeEdit) {
        ctx.beginPath();
        ctx.moveTo(edgeEdit.x, edgeEdit.y);
        const nearestNode = graph.findNode(mousePos) || mousePos;
        ctx.lineTo(nearestNode.x, nearestNode.y);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = edgeConfig.lineWidth;
        ctx.stroke();
    }
}

let dragNode = null;
let selection = new Set();

canvas.addEventListener("mouseup", (e) => {
    mousePos = getMousePos(e);

    e.preventDefault();
    if (!interaction || disabled) return;

    dragNode = null;
});

function handleCursor(pos) {
    if (disabled) {
        canvas.style.cursor = "wait";
    } else if (dragNode) {
        canvas.style.cursor = "move";
    } else if (graph.findNode(pos) || graph.findEdge(pos)) {
        canvas.style.cursor = "pointer";
    } else canvas.style.cursor = "default";
}

canvas.addEventListener("mousemove", (e) => {
    const pos = getMousePos(e);
    handleCursor(pos);
    e.preventDefault();
    if (!interaction || disabled) return;

    if (dragNode) {
        dragNode.dragPos = pos;
    }
    mousePos = pos;
});

// is shift pressed ?
function isShiftPressed(e) {
    return e.shiftKey;
}
// is ctrl pressed ?
function isCtrlPressed(e) {
    return e.ctrlKey;
}

let mousePos = null;

canvas.addEventListener("keydown", (e) => {
    e.preventDefault();
    if (!interaction) return;

    if (e.key === "Delete" || e.key === "Backspace") {
        if (selection.size > 0) {
            for (const item of selection) {
                if (item instanceof Node) {
                    graph.removeNode(item.name);
                } else if (item instanceof Edge) {
                    graph.removeEdge(item.node1.name, item.node2.name);
                }
            }
            selection.clear();
        }
    } else if (e.key === "a" && isCtrlPressed(e)) {
        selection.clear();
        for (const nodeName in graph.nodes) {
            const node = graph.nodes[nodeName];
            selection.add(node);
            node.isSelected = true;
        }
        for (const edge of graph.edges) {
            selection.add(edge);
            edge.isSelected = true;
        }
    }
});

let task = null;

function clearSelection() {
    for (const item of selection) {
        item.isSelected = false;
    }
    selection.clear();
}

let edgeEdit = null;
canvas.addEventListener("dblclick", (e) => {
    const pos = getMousePos(e);
    handleCursor(pos);
    e.preventDefault();
    if (!interaction || disabled) {
        edgeEdit = null;
        return;
    }

    const node = graph.findNode(pos);

    if (node) {
        if (edgeEdit) {
            if (node !== edgeEdit && !graph.checkEdgeExists(edgeEdit.name, node.name)) {
                graph.addEdge(edgeEdit.name, node.name, rand(1, 10));
                toggleInput();
                task = [1, edgeEdit.name, node.name];
            }
            edgeEdit = null;
        } else {
            edgeEdit = node;
        }
    } else {
        const tempName = graph.getName();
        graph.addNode(tempName, pos.x, pos.y);
        toggleInput();
        task = [0, tempName];
    }
});

canvas.addEventListener("click", (e) => canvas.focus());

canvas.addEventListener("mousedown", (e) => {
    mousePos = getMousePos(e);
    handleCursor(mousePos);

    e.preventDefault();
    if (!interaction) return;
    if (disabled) {
        disableInput();
        return;
    }

    const selecting = !isShiftPressed(e) && !isCtrlPressed(e);
    if (selecting) clearSelection();
    const pos = getMousePos(e);

    const node = graph.findNode(pos);
    if (edgeEdit) {
        clearSelection();
        if (!node) {
            edgeEdit = null;
            return;
        }
        if (graph.checkEdgeExists(edgeEdit.name, node.name)) {
            edgeEdit = null;
            return;
        }
        if (node) graph.addEdge(edgeEdit.name, node.name, rand(1, 10));
        toggleInput();
        task = [1, edgeEdit.name, node.name];
        edgeEdit = null;
    } else {
        dragNode = node;
        if (dragNode) {
            dragNode.dragPos = pos;
            selection.add(dragNode);
            dragNode.isSelected = true;
        } else {
            const edge = graph.findEdge(pos);
            if (edge) {
                selection.add(edge);
                edge.isSelected = true;
            }
        }
    }
});

// Force-Directed Layout
// const k = 0.1; // Spring stiffness constant
const k = 0.02; // Spring stiffness constant
const d = 0.5; // Damping factor
const idealLength = edgeConfig.idealLength;

// Définir le centre du canvas
const centerX = w / 2;
const centerY = h / 2;

function calculateCenterOfMass() {
    let sumX = 0;
    let sumY = 0;
    const nodeCount = Object.keys(graph.nodes).length;

    for (let nodeName in graph.nodes) {
        const node = graph.nodes[nodeName];
        sumX += node.x;
        sumY += node.y;
    }

    return { x: sumX / nodeCount, y: sumY / nodeCount };
}

function translateNodesToCenter() {
    const centerOfMass = calculateCenterOfMass();
    const dx = centerX - centerOfMass.x;
    const dy = centerY - centerOfMass.y;

    for (let nodeName in graph.nodes) {
        const node = graph.nodes[nodeName];
        node.x += dx;
        node.y += dy;
    }
}

// Fonction pour calculer les forces (sans modification)
function calculateForces() {
    // Initialiser les forces à zéro
    for (let nodeName in graph.nodes) {
        const node = graph.nodes[nodeName];
        node.fx = 0;
        node.fy = 0;
    }

    const keys1 = Object.keys(graph.nodes);

    for (let i = 0; i < keys1.length; i++) {
        for (let j = i + 1; j < keys1.length; j++) {
            const node1 = graph.nodes[keys1[i]];
            const node2 = graph.nodes[keys1[j]];
            const dx = node2.x - node1.x;
            const dy = node2.y - node1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = k * (distance - idealLength);
            const fx = (force * dx) / distance;
            const fy = (force * dy) / distance;

            node1.fx += fx;
            node1.fy += fy;
            node2.fx -= fx;
            node2.fy -= fy;
        }
    }

    const keys = Object.keys(graph.nodes);

    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            const node1 = graph.nodes[keys[i]];
            const node2 = graph.nodes[keys[j]];
            const dx = node2.x - node1.x;
            const dy = node2.y - node1.y;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);
            const force = (k * k) / distanceSquared;
            const fx = (force * dx) / distance;
            const fy = (force * dy) / distance;

            node1.fx -= fx;
            node1.fy -= fy;
            node2.fx += fx;
            node2.fy += fy;
        }
    }
}

// Function to update node positions based on forces
function updateNodePositions() {
    for (let nodeName in graph.nodes) {
        const node = graph.nodes[nodeName];
        // Apply damping to velocity
        node.vx = d * node.vx + node.fx;
        node.vy = d * node.vy + node.fy;
        // Update position
        if (node !== dragNode) {
            node.x += node.vx;
            node.y += node.vy;
            node.dragPos = { x: node.x, y: node.y };
        }
    }
}

render();
export { graph };
