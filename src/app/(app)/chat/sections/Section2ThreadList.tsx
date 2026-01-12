"use client";

type Thread = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  avatar?: string;
};

const threads: Thread[] = [
  {
    id: "1",
    name: "PT Øystein",
    lastMessage: "takk",
    time: "09:04",
    unreadCount: 1,
  },
  {
    id: "2",
    name: "Admin",
    lastMessage: "Hei kunde",
    time: "08:11",
    unreadCount: 1,
  },
];

export default function Section2ThreadList() {
  return (
    <section className="space-y-4">
      {threads.map((thread) => (
        <a
          key={thread.id}
          href={`/chat/${thread.id}`}
          className="
            block rounded-2xl border border-sf-border bg-white
            px-4 py-4 shadow-sm
            hover:bg-sf-soft transition
          "
        >
          <div className="flex items-center gap-4">

            {/* 🟢 Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-white font-semibold">
              {thread.name.charAt(0)}
            </div>

            {/* 📄 Tekst */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold truncate">
                  {thread.name}
                </p>
                <span className="text-xs text-sf-muted">
                  {thread.time}
                </span>
              </div>

              <p className="text-sm text-sf-muted truncate">
                {thread.lastMessage}
              </p>
            </div>

            {/* 🔴 Ulest */}
            {thread.unreadCount && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                {thread.unreadCount}
              </div>
            )}
          </div>
        </a>
      ))}
    </section>
  );
}