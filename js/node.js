import { nodeConfig, lerp, colors } from "./utils.js";

class Node {
    constructor(name, x, y) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.dragPos = { x, y };
        this.neighbors = [];
        this.state = 0;
        this.isFirst = false;
        this.vx = 0;
        this.vy = 0;
        this.fx = 0;
        this.fy = 0;
        this.isSelected = false;
    }

    removeNeighbor(nodeName) {
        const index = this.neighbors.indexOf(nodeName);
        if (index !== -1) {
            this.neighbors.splice(index, 1);
        }
    }

    addNeighbor(nodeName) {
        this.neighbors.push(nodeName);
    }

    handleNodePos() {
        this.x = lerp(this.x, this.dragPos.x, nodeConfig.lerpSpeed);
        this.y = lerp(this.y, this.dragPos.y, nodeConfig.lerpSpeed);
    }

    drawNode(ctx) {
        const fillColor = colors[this.state] ?? (this.isSelected ? "#1561e6" : "#000000");
        const shadowColor = this.isFirst ? fillColor + "66" : this.isSelected ? "#1562e666" : false;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, nodeConfig.radius, 0, 2 * Math.PI);
        if (shadowColor) {
            ctx.strokeStyle = shadowColor;
            ctx.lineWidth = nodeConfig.borderWidth * 4;
            ctx.stroke();
        }
        ctx.fill();
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = nodeConfig.borderWidth;
        ctx.stroke();
        ctx.fillStyle = fillColor;
        ctx.font = `bold ${nodeConfig.textSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.name, this.x, this.y);
    }
}

export default Node;
