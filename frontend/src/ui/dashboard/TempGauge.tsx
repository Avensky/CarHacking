import { useEffect, useRef } from "react";

interface TempGaugeProps {
    temp: number; // e.g. coolant temp (e.g. 100 - 280)
    size: number;
}

export default function TempGauge({ temp, size }: TempGaugeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const radius = size / 2;
    const startAngle = Math.PI * 1.8; // right sweep
    const endAngle = Math.PI * 2.2;

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.width = size;
        canvas.height = size;

        const centerX = size / 2;
        const centerY = size / 2;

        const drawGauge = () => {
            ctx.clearRect(0, 0, size, size);

            // Background
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fill();

            // Arc outline
            ctx.beginPath();
            ctx.lineWidth = 8;
            ctx.strokeStyle = "white";
            ctx.arc(centerX, centerY, radius - 20, startAngle, endAngle, false);
            ctx.stroke();

            // Tick marks
            const tickCount = 4;
            for (let i = 0; i <= tickCount; i++) {
                const ratio = i / tickCount;
                const angle = startAngle + ratio * (endAngle - startAngle);

                const x1 = centerX + (radius - 30) * Math.cos(angle);
                const y1 = centerY + (radius - 30) * Math.sin(angle);
                const x2 = centerX + (radius - 15) * Math.cos(angle);
                const y2 = centerY + (radius - 15) * Math.sin(angle);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Labels: "C" and "H"
            ctx.fillStyle = "white";
            ctx.font = "bold 12px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("C", centerX + (radius - 40) * Math.cos(startAngle), centerY + (radius - 40) * Math.sin(startAngle));
            ctx.fillText("H", centerX + (radius - 40) * Math.cos(endAngle), centerY + (radius - 40) * Math.sin(endAngle));

            // Needle
            const clampedTemp = Math.max(100, Math.min(temp, 280));
            const tempRatio = (clampedTemp - 100) / (280 - 100);
            const needleAngle = startAngle + tempRatio * (endAngle - startAngle);

            ctx.save();
            ctx.shadowColor = "rgba(255,165,0,0.8)";
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + (radius - 40) * Math.cos(needleAngle), centerY + (radius - 40) * Math.sin(needleAngle));
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();

            // Center dot
            ctx.beginPath();
            ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "orange";
            ctx.fill();
        };

        drawGauge();
    }, [temp]);

    return <canvas ref={canvasRef} style={{ display: "block", width: `${size}px`, height: `${size}px` }} />;
}
