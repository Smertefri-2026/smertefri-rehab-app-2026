import { create } from "zustand";

type ChatUnreadState = {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
};

export const useChatUnread = create<ChatUnreadState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
}));