const table = document.getElementById("dijkstra-table");
const tHead = table.getElementsByTagName("thead")[0];
const tBody = table.getElementsByTagName("tbody")[0];
const tHeadRow = tHead.rows[0];

const info = document.getElementsByClassName("info-container")[0];

let delay = 500;

import { disableInteraction, enableInteraction, getMousePos, graph } from "./script.js";

function getCell(x, y) {
    const row = table.rows[y];
    if (row) {
        const cell = row.cells[x];
        return cell;
    }
}

let headNodes = [];
let nodesCount = 0;

function clearTable() {
    while (tBody.rows.length > 0) {
        tBody.deleteRow(0);
    }
    while (tHead.rows[0].cells.length > 0) {
        tHead.rows[0].deleteCell(0);
    }
}

function init() {
    headNodes = graph.getTree();
    graph.colorImpossibleNodes();
    nodesCount = headNodes.length;
    clearTable();

    headNodes.forEach((nodeName) => {
        const cell = document.createElement("th");
        cell.innerHTML = nodeName;
        tHeadRow.appendChild(cell);
    });

    for (let i = 0; i < nodesCount; i++) {
        const row = tBody.insertRow(0);
        const stepCell = row.insertCell(0);
        stepCell.innerHTML = nodesCount - i;
        stepCell.style.fontWeight = "bold";
        for (let j = 0; j < nodesCount; j++) {
            const cell = row.insertCell(0);
            cell.innerHTML = "";
        }
    }

    const cell = document.createElement("th");
    cell.innerHTML = "Steps";
    tHeadRow.appendChild(cell);
}

function finalStep(nodeName, step, count, parent) {
    const column = headNodes.indexOf(nodeName);
    const cell = getCell(column, step);
    cell.style.backgroundColor = "#4cd137";
    cell.innerHTML = `${parent} - ${count}`;
    for (let i = 1; i <= nodesCount - step; i++) {
        getCell(column, step + i).style.backgroundColor = "#e84118";
    }
}

function writeCost(nodeName, step, cost, originName) {
    const column = headNodes.indexOf(nodeName);
    const cell = getCell(column, step);
    cell.innerHTML = `${originName} - ${cost}`;
}

let queue = {};
let visited = new Set();
let step = 1;
let distances = {};
let paths = {};

function dijkstra() {
    finalStep(graph.startNode.name, step, 0, graph.startNode.name);

    distances[graph.startNode.name] = [0, graph.startNode.name];
    visited.add(graph.startNode.name);
    paths[graph.startNode.name] = [graph.startNode.name];
    setTimeout(() => {
        processNode(graph.startNode, graph.startNode.name);
    }, delay);
}

function processNeighbor(node, parent, i) {
    const neighbor = node.neighbors[i];
    if (!neighbor) {
        node.state = 2;
        nextStep();
        return;
    }
    if (!visited.has(neighbor)) {
        const edge = graph.getEdge(node.name, neighbor);
        const weight = distances[parent][0] + edge.weight;
        edge.state = 3;
        writeCost(neighbor, step, weight, node.name);
        setTimeout(() => {
            if (!distances[neighbor] || distances[neighbor][0] > weight) {
                distances[neighbor] = [weight, node.name];
                edge.state = 2;
            } else {
                edge.state = 1;
            }
            queue[neighbor] = distances[neighbor][0];
            setTimeout(() => {
                processNeighbor(node, parent, i + 1);
            }, delay);
        }, delay);
    } else {
        setTimeout(() => {
            processNeighbor(node, parent, i + 1);
        }, delay);
    }
}

function processNode(node, parent) {
    node.state = 3;
    processNeighbor(node, parent, 0);
}

function nextStep() {
    let minWeight = Number.MAX_VALUE;
    let minNode = null;
    for (const nodeName in queue) {
        const weight = queue[nodeName];
        if (weight < minWeight) {
            minWeight = weight;
            minNode = nodeName;
        }
    }

    if (!minNode) {
        tableDesc.style.display = "block";
        copyBtn.style.display = "block";
        return;
    }
    const minNodeParent = distances[minNode][1];
    visited.add(minNode);
    paths[minNode] = minNodeParent;
    delete queue[minNode];
    setTimeout(() => {
        finalStep(minNode, ++step, minWeight, minNodeParent);
        processNode(graph.nodes[minNode], minNode);
    }, delay);
}

const startBtn = document.getElementById("start");
let waiting = false;
startBtn.addEventListener("click", () => {
    queue = {};
    visited = new Set();
    step = 1;
    paths = {};
    distances = {};
    disableInteraction();
    startBtn.innerHTML = "Select the first node";
    graph.reset();
    waiting = true;
});

canvas.addEventListener("click", (e) => {
    e.preventDefault();
    if (!waiting) return;
    const pos = getMousePos(e);
    if (graph.findNode(pos)) {
        graph.startNode = graph.findNode(pos);
        graph.startNode.isFirst = true;
        info.style.display = "none";
        startBtn.style.display = "none";
        editBtn.style.display = "block";
        init();
        dijkstra();
        waiting = false;
    }
});

const editBtn = document.getElementById("edit");
editBtn.style.display = "none";
editBtn.addEventListener("click", () => {
    editBtn.style.display = "none";
    tableDesc.style.display = "none";
    startBtn.innerHTML = "Start";
    copyBtn.style.display = "none";
    startBtn.style.display = "block";
    clearTable();
    graph.reset();
    enableInteraction();
});

const slider = document.getElementById("animation-speed");
slider.addEventListener("input", (e) => {
    delay = e.target.max - e.target.value;
});

tHeadRow.addEventListener("click", (e) => {
    e.preventDefault();
    if (nodesCount !== step) return;
    const column = e.target.cellIndex;
    if (column === undefined) return;
    const columnName = tHeadRow.cells[column].innerHTML;
    const path = paths[columnName];
    if (!path) return;

    graph.reset(1);
    let tempName = columnName;
    do {
        graph.nodes[tempName].state = 5;
        const edge = graph.getEdge(paths[tempName], tempName);
        if (edge) edge.state = 5;
        tempName = paths[tempName];
    } while (paths[tempName] !== tempName);
});

const copyBtn = document.getElementById("copy-btn");
copyBtn.style.display = "none";
copyBtn.addEventListener("click", () => {
    copyWithStyle("dijkstra-table");
});

const copyWithStyle = (element) => {
    const doc = document;
    const text = doc.getElementById(element);
    let range;
    let selection;

    if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElement(text);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();

        range = doc.createRange();
        range.selectNodeContents(text);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    copyBtn.innerHTML = "Copied to clipboard!";
    setTimeout(() => {
        copyBtn.innerHTML = "Copy";
    }, 1000);
};

const tableDesc = document.getElementById("table-desc");
tableDesc.style.display = "none";
