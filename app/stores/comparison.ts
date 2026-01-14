import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComparisonState {
    selectedCarIds: string[];
    addCar: (id: string) => void;
    removeCar: (id: string) => void;
    toggleCar: (id: string) => void;
    clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
    persist(
        (set) => ({
            selectedCarIds: [],
            addCar: (id) => set((state) => {
                if (state.selectedCarIds.includes(id)) return state;
                if (state.selectedCarIds.length >= 2) {
                    // Start replacing the first one? Or just prevent? 
                    // Let's prevent for now or maybe Shift. 
                    // User requirement says "up to 2". 
                    // Let's do FIFO (First In First Out) if > 2, so user can keep clicking.
                    const newIds = [...state.selectedCarIds.slice(1), id];
                    return { selectedCarIds: newIds };
                }
                return { selectedCarIds: [...state.selectedCarIds, id] };
            }),
            removeCar: (id) => set((state) => ({
                selectedCarIds: state.selectedCarIds.filter((carId) => carId !== id)
            })),
            toggleCar: (id) => set((state) => {
                if (state.selectedCarIds.includes(id)) {
                    return { selectedCarIds: state.selectedCarIds.filter((carId) => carId !== id) };
                } else {
                    if (state.selectedCarIds.length >= 2) {
                        return { selectedCarIds: [...state.selectedCarIds.slice(1), id] };
                    }
                    return { selectedCarIds: [...state.selectedCarIds, id] };
                }
            }),
            clearComparison: () => set({ selectedCarIds: [] }),
        }),
        {
            name: 'car-comparison-storage',
        }
    )
);
