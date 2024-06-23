import Node from "./node.js";
import Edge from "./edge.js";

import { isPointInCircle, randW, randH, nodeConfig, isPointOnSegment } from "./utils.js";

class Graph {
    constructor() {
        this.nodes = {};
        this.edges = [];
        this.tree = [];
    }

    reset(state = 0) {
        for (const key in this.nodes) {
            const node = this.nodes[key];
            node.state = state;
            if (state === 0) node.isFirst = false;
            node.isSelected = false;
        }
        this.edges.forEach((edge) => {
            edge.state = state;
            edge.isSelected = false;
        });
    }

    removeEdge(node1Name, node2Name) {
        const node1 = this.nodes[node1Name];
        const node2 = this.nodes[node2Name];
        const edge = this.edges.find(
            (edge) => (edge.node1 === node1 && edge.node2 === node2) || (edge.node1 === node2 && edge.node2 === node1)
        );
        if (edge) {
            this.edges.splice(this.edges.indexOf(edge), 1);
            node1.removeNeighbor(node2Name);
            node2.removeNeighbor(node1Name);
        }
    }

    removeNode(name) {
        const node = this.nodes[name];
        for (let i = 0; i < this.edges.length; i++) {
            const edge = this.edges[i];
            if (edge.node1 === node || edge.node2 === node) {
                this.removeEdge(edge.node1.name, edge.node2.name);
                i--;
            }
        }
        delete this.nodes[name];
    }

    addNode(name, x = randW(), y = randH()) {
        if (this.nodes[name]) return this.nodes[name];
        const node = new Node(name, x, y);
        this.nodes[name] = node;
        return node;
    }

    checkEdgeExists(node1Name, node2Name, weight) {
        const edge = this.edges.find(
            (edge) =>
                (edge.node1.name === node1Name && edge.node2.name === node2Name) ||
                (edge.node1.name === node2Name && edge.node2.name === node1Name)
        );
        if (edge) {
            edge.weight = weight || edge.weight;
            return true;
        }
        return false;
    }

    addEdge(node1Name, node2Name, weight) {
        const node1 = this.addNode(node1Name);
        const node2 = this.addNode(node2Name);
        if (this.checkEdgeExists(node1.name, node2.name, weight)) return;

        const edge = new Edge(node1, node2, weight);
        this.edges.push(edge);
        node1.addNeighbor(node2Name, weight);
        node2.addNeighbor(node1Name, weight);
    }

    getEdge(node1Name, node2Name) {
        const edge = this.edges.find(
            (edge) =>
                (edge.node1.name === node1Name && edge.node2.name === node2Name) ||
                (edge.node1.name === node2Name && edge.node2.name === node1Name)
        );
        return edge;
    }

    getEdgeWeight(node1Name, node2Name) {
        return this.getEdge(node1Name, node2Name).weight;
    }

    drawNodes(ctx) {
        for (let nodeName in this.nodes) {
            const node = this.nodes[nodeName];
            node.drawNode(ctx);
        }
    }

    handleNodesPos() {
        for (let nodeName in this.nodes) {
            const node = this.nodes[nodeName];
            node.handleNodePos();
        }
    }

    drawEdges(ctx) {
        this.edges.forEach((edge) => {
            edge.drawEdge(ctx);
        });
    }

    findNode(pos) {
        for (const key in this.nodes) {
            const node = this.nodes[key];
            if (isPointInCircle(pos, node.x, node.y, nodeConfig.radius)) {
                return node;
            }
        }
        return null;
    }

    findEdge(pos) {
        for (const edge of this.edges) {
            if (isPointOnSegment(pos.x, pos.y, edge.node1.x, edge.node1.y, edge.node2.x, edge.node2.y, 8)) {
                return edge;
            }
        }
        return null;
    }

    renameNode(name, newName) {
        const node = this.nodes[name];
        node.name = newName;
        this.nodes[newName] = node;
        delete this.nodes[name];
    }

    getName() {
        let name = "";
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            if (!this.nodes[char]) {
                name = char;
                break;
            }
        }
        return name;
    }

    colorImpossibleNodes() {
        for (const nodeName in this.nodes) {
            const node = this.nodes[nodeName];
            if (!this.tree.includes(nodeName)) {
                node.state = 4;
                node.neighbors.forEach((childName) => {
                    this.getEdge(nodeName, childName).state = 4;
                });
            }
        }
    }

    getTree() {
        this.tree = [];
        const queue = [this.startNode.name];
        while (queue.length > 0) {
            const nodeName = queue.shift();

            if (!this.tree.includes(nodeName)) this.tree.push(nodeName);
            this.nodes[nodeName].state = 1;
            this.nodes[nodeName].neighbors.forEach((childName) => {
                this.getEdge(nodeName, childName).state = 1;
                if (!this.tree.includes(childName)) {
                    queue.push(childName);
                }
            });
        }
        return this.tree;
    }
}

export default Graph;
