import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/theme/tokens";

interface TrackState {
  track: Track;
  setTrack: (t: Track) => void;
}

// 方向切换器状态：栏目2/栏目5共享，全栏目内一致。
export const useTrackStore = create<TrackState>()(
  persist(
    (set) => ({
      track: "product",
      setTrack: (track) => set({ track }),
    }),
    { name: "wecan-track" },
  ),
);
