import * as React from 'react';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '~/stores/favorites';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface FavoriteButtonProps {
    carId: string;
    className?: string;
    size?: "sm" | "icon" | "default" | "lg";
    variant?: "default" | "outline" | "ghost" | "secondary";
}

export function FavoriteButton({ carId, className, size = "icon", variant = "ghost" }: FavoriteButtonProps) {
    // Avoid hydration mismatch by only rendering after mount
    const [mounted, setMounted] = React.useState(false);
    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const favorite = isFavorite(carId);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a placeholder or nothing during SSR/initial hydration to prevent mismatch
        return (
            <Button
                size={size}
                variant={variant}
                className={cn("text-gray-400 hover:text-red-500 hover:bg-red-50", className)}
                disabled
            >
                <Heart className="w-5 h-5" />
            </Button>
        );
    }

    return (
        <Button
            size={size}
            variant={variant}
            className={cn(
                "transition-all duration-300",
                favorite ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-gray-400 hover:text-red-500 hover:bg-red-50",
                className
            )}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(carId);
            }}
        >
            <Heart className={cn("w-5 h-5 transition-all", favorite ? "fill-current scale-110" : "scale-100")} />
        </Button>
    );
}
