import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Detection } from '../types';

interface PendingDetection {
  id: string;
  category: string;
  confidence: number;
  imageUri?: string;
  createdAt: string;
}

interface DetectionState {
  detections: Detection[];
  pendingSync: PendingDetection[];
  setDetections: (detections: Detection[]) => void;
  addDetection: (detection: Detection) => void;
  addPending: (pending: PendingDetection) => void;
  removePending: (id: string) => void;
  clearPending: () => void;
}

export const useDetectionStore = create<DetectionState>()(
  persist(
    (set) => ({
      detections: [],
      pendingSync: [],
      setDetections: (detections) => set({ detections }),
      addDetection: (detection) =>
        set((state) => ({ detections: [detection, ...state.detections] })),
      addPending: (pending) =>
        set((state) => ({ pendingSync: [...state.pendingSync, pending] })),
      removePending: (id) =>
        set((state) => ({ pendingSync: state.pendingSync.filter((p) => p.id !== id) })),
      clearPending: () => set({ pendingSync: [] }),
    }),
    {
      name: 'wasify-detections',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
