/**
 * UI Store Slice
 * 
 * Manages all UI-related state:
 * - cameraView
 * - selectedColor, selectedModuleId
 * - isInteracting
 * - isQuoteModalOpen
 */

export interface UIState {
    cameraView: 'perspective' | 'top' | 'front' | 'left' | 'right' | 'iso';
    setCameraView: (view: UIState['cameraView']) => void;
    selectedModuleId: string | null;
    setSelectedModuleId: (id: string | null) => void;
    selectedColor: string | null;
    setSelectedColor: (color: string | null) => void;
    isInteracting: boolean;
    setIsInteracting: (interacting: boolean) => void;
    draggingModule: 'cube' | 'rectangle' | 'plateau' | null;
    setDraggingModule: (type: 'cube' | 'rectangle' | 'plateau' | null) => void;
    isQuoteModalOpen: boolean;
    setQuoteModalOpen: (isOpen: boolean) => void;
}

export const createUISlice = (set: any): UIState => ({
    cameraView: 'perspective',
    setCameraView: (view) => set({ cameraView: view }),

    selectedModuleId: null,
    setSelectedModuleId: (id) => set({ selectedModuleId: id }),

    selectedColor: null,
    setSelectedColor: (color) => set({ selectedColor: color }),

    isInteracting: false,
    setIsInteracting: (interacting) => set({ isInteracting: interacting }),

    draggingModule: null,
    setDraggingModule: (type) => set({ draggingModule: type }),

    isQuoteModalOpen: false,
    setQuoteModalOpen: (isOpen) => set({ isQuoteModalOpen: isOpen }),
});