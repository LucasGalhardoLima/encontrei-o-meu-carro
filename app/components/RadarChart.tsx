export default function RadarChart({ userWeights, carScores }: { userWeights: any; carScores: any }) {
    const size = 100;
    const center = size / 2;
    const radius = 40;

    // Categories in order: Space (Top), Performance (Right), Economy (Bottom), Comfort (Left)
    // Angles: -90 (Top), 0 (Right), 90 (Bottom), 180 (Left)
    const categories = [
        { key: "space", angle: -90, label: "Espaço" },
        { key: "performance", angle: 0, label: "Performance" },
        { key: "economy", angle: 90, label: "Economia" },
        { key: "comfort", angle: 180, label: "Conforto" },
    ];

    const valueToPoint = (val: number, angle: number) => {
        const rad = (angle * Math.PI) / 180;
        // val is 0-10. We map it to 0-radius
        const r = (val / 10) * radius;
        const x = center + r * Math.cos(rad);
        const y = center + r * Math.sin(rad);
        return `${x},${y}`;
    };

    // User Polygon (Blue) via weights (0-100 mapped to 0-10)
    const userPoints = categories
        .map((c) => valueToPoint((userWeights[c.key] || 0) / 10, c.angle))
        .join(" ");

    // Car Polygon (Green) via scores (0-10)
    const carPoints = categories
        .map((c) => valueToPoint(carScores[c.key] || 0, c.angle))
        .join(" ");

    // Axis lines
    const axisLines = categories.map((c) => {
        const end = valueToPoint(10, c.angle);
        return <line key={c.key} x1={center} y1={center} x2={end.split(',')[0]} y2={end.split(',')[1]} stroke="#e5e7eb" strokeWidth="1" />;
    });

    return (
        <div className="relative w-full aspect-square max-w-[150px] mx-auto">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
                {/* Background Grid (Circles) */}
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
                <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="#f3f4f6" strokeWidth="1" />

                {/* Axis */}
                {axisLines}

                {/* User Shape */}
                <polygon points={userPoints} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />

                {/* Car Shape */}
                <polygon points={carPoints} fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />

                {/* Labels? Maybe too small for this size */}
            </svg>
        </div>
    );
}

export function RadarLegend({ className = "" }: { className?: string }) {
    return (
        <div className={`flex flex-col gap-2 text-xs ${className}`}>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-500/20 border border-blue-500" />
                <span className="text-gray-600 font-medium">Suas Prioridades</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500" />
                <span className="text-gray-600 font-medium">Atributos do Carro</span>
            </div>
        </div>
    );
}
