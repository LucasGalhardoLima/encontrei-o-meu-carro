import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Info } from "lucide-react";

export default function Quiz() {
    const navigate = useNavigate();
    const [weights, setWeights] = useState({
        comfort: 25,
        economy: 25,
        performance: 25,
        space: 25,
    });

    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const remaining = 100 - total;

    const handleWeightChange = (key: keyof typeof weights, value: number[]) => {
        const newVal = value[0];
        const diff = newVal - weights[key];

        // Simple logic: if we are over 100, we prevent increase
        if (diff > 0 && remaining <= 0) return;

        // Otherwise we allow change but cap it so total doesn't exceed 100
        const allowedNewVal = diff > 0 ? weights[key] + Math.min(diff, remaining) : newVal;

        setWeights((prev) => ({
            ...prev,
            [key]: allowedNewVal,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.set("w_comfort", weights.comfort.toString());
        params.set("w_economy", weights.economy.toString());
        params.set("w_performance", weights.performance.toString());
        params.set("w_space", weights.space.toString());
        params.set("mode", "match");
        navigate(`/results?${params.toString()}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] bg-gray-50/50 py-12 px-4">
            <Card className="w-full max-w-xl shadow-xl border-none">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-black tracking-tight">O que você valoriza?</CardTitle>
                    <p className="text-gray-500">Distribua 100 pontos entre as categorias abaixo.</p>
                </CardHeader>
                <CardContent className="space-y-8 py-6">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg text-blue-700 font-bold border border-blue-100">
                        <span>Pontos restantes:</span>
                        <span className={`text-2xl ${remaining === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                            {remaining}
                        </span>
                    </div>

                    {/* Personas Code */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setWeights({ space: 40, comfort: 40, economy: 20, performance: 0 })}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all gap-1 group"
                        >
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">👨‍👩‍👧‍👦</span>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-700">Família</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setWeights({ space: 0, comfort: 30, economy: 0, performance: 70 })}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all gap-1 group"
                        >
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🛣️</span>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-700">Estrada</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setWeights({ space: 10, comfort: 20, economy: 70, performance: 0 })}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all gap-1 group"
                        >
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🏙️</span>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-700">Urbano</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <WeightSlider
                            label="Conforto"
                            value={weights.comfort}
                            onChange={(v: number[]) => handleWeightChange('comfort', v)}
                            icon="🛋️"
                            description="Suspensão macia e silêncio a bordo."
                        />
                        <WeightSlider
                            label="Economia"
                            value={weights.economy}
                            onChange={(v: number[]) => handleWeightChange('economy', v)}
                            icon="⛽"
                            description="Menos idas ao posto de combustível."
                        />
                        <WeightSlider
                            label="Desempenho"
                            value={weights.performance}
                            onChange={(v: number[]) => handleWeightChange('performance', v)}
                            icon="⚡"
                            description="Aceleração rápida e retomadas fortes."
                        />
                        <WeightSlider
                            label="Espaço"
                            value={weights.space}
                            onChange={(v: number[]) => handleWeightChange('space', v)}
                            icon="📦"
                            description="Porta-malas grande e pernas livres atrás."
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={remaining > 0}
                        className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-md"
                    >
                        {remaining > 0 ? `Distribua mais ${remaining} pontos` : "Ver Carros Recomendados"}
                    </Button>
                    <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                        <Info className="h-4 w-4 shrink-0" />
                        <p>Nosso algoritmo usa dados técnicos reais (entre-eixos, consumo Inmetro, potência) para calcular o match perfeito.</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

interface WeightSliderProps {
    label: string;
    value: number;
    onChange: (value: number[]) => void;
    icon: string;
    description: string;
}

function WeightSlider({ label, value, onChange, icon, description }: WeightSliderProps) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <div>
                        <Label className="text-base font-bold">{label}</Label>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{description}</p>
                    </div>
                </div>
                <span className="text-xl font-black text-gray-900">{value}%</span>
            </div>
            <Slider
                value={[value]}
                onValueChange={onChange}
                max={100}
                step={5}
                className="cursor-pointer"
            />
        </div>
    )
}
