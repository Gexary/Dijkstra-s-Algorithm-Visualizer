import { nodeConfig, edgeConfig, colors } from "./utils.js";

class Edge {
    constructor(node1, node2, weight) {
        this.node1 = node1;
        this.node2 = node2;
        this.weight = weight;
        this.isSelected = false;
        this.state = 0;
    }

    drawEdge(ctx) {
        const fillColor = colors[this.state] ?? (this.isSelected ? "#1561e6" : "#000000");
        ctx.beginPath();
        ctx.moveTo(this.node1.x, this.node1.y);
        ctx.lineTo(this.node2.x, this.node2.y);
        if (this.isSelected) {
            ctx.strokeStyle = "#1561e666";
            ctx.lineWidth = edgeConfig.borderWidth * 4;
            ctx.stroke();
        }
        ctx.lineWidth = edgeConfig.borderWidth;
        ctx.strokeStyle = fillColor;
        ctx.stroke();

        this.displayEdgeWeight(ctx, fillColor);
    }

    displayEdgeWeight(ctx, fillColor) {
        const midX = (this.node1.x + this.node2.x) / 2;
        const midY = (this.node1.y + this.node2.y) / 2;

        const angle = Math.atan2(this.node2.y - this.node1.y, this.node2.x - this.node1.x);

        const textPadding = 16;
        const textX = midX + textPadding * Math.cos(angle + Math.PI / 2);
        const textY = midY + textPadding * Math.sin(angle + Math.PI / 2);

        ctx.fillStyle = fillColor;
        ctx.font = `bold ${nodeConfig.textSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.weight, textX, textY);
    }
}

export default Edge;
