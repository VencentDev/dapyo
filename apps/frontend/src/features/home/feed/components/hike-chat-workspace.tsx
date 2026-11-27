'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { MessageCircle, Mountain, SendAlt2, X } from '@boxicons/react';
import { useSession } from 'next-auth/react';

import {
  useHikeChats,
  useHikeChatMessages,
  useSendHikeChatMessage,
  type HikeChatSummary,
} from '@/features/hikes/api/hike-chat.hooks';

export function HikeChatWorkspace() {
  const chatsQuery = useHikeChats();
  const [activeChat, setActiveChat] = useState<HikeChatSummary | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const chats = chatsQuery.data ?? [];

  const selectChat = (chat: HikeChatSummary) => {
    setActiveChat(chat);
    setIsMobileListOpen(false);
  };

  return (
    <>
      <aside className="hidden min-w-0 xl:block" aria-label="Hike group messages">
        <div className="dapyo-card-elevation sticky top-24 max-h-[calc(100svh-7rem)] overflow-hidden rounded-[8px] bg-white ring-1 ring-[#17342e]/[0.06] dark:bg-[#17342e] dark:ring-white/[0.08]">
          <ChatList
            chats={chats}
            isLoading={chatsQuery.isLoading}
            isError={chatsQuery.isError}
            selectedChatId={activeChat?.hikeId}
            onSelect={selectChat}
            onRetry={() => void chatsQuery.refetch()}
          />
        </div>
      </aside>

      <div className="fixed bottom-20 right-4 z-50 xl:hidden">
        {isMobileListOpen && (
          <div className="absolute bottom-14 right-0 max-h-[65svh] w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-[8px] shadow-[0_18px_50px_rgba(16,35,31,.24)]">
            <ChatList
              chats={chats}
              isLoading={chatsQuery.isLoading}
              isError={chatsQuery.isError}
              selectedChatId={activeChat?.hikeId}
              onSelect={selectChat}
              onRetry={() => void chatsQuery.refetch()}
            />
          </div>
        )}
        <button
          type="button"
          aria-label={isMobileListOpen ? 'Close hike messages list' : 'Open hike messages list'}
          aria-expanded={isMobileListOpen}
          onClick={() => setIsMobileListOpen((open) => !open)}
          className="grid size-12 place-items-center rounded-full bg-[#1d604c] text-white shadow-[0_8px_24px_rgba(16,35,31,.24)] transition-colors hover:bg-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78]"
        >
          <MessageCircle pack="filled" className="size-5" aria-hidden="true" />
        </button>
      </div>

      {activeChat && !isMobileListOpen && (
        <HikeChatWindow chat={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </>
  );
}

function ChatList({
  chats,
  isLoading,
  isError,
  selectedChatId,
  onSelect,
  onRetry,
}: {
  chats: HikeChatSummary[];
  isLoading: boolean;
  isError: boolean;
  selectedChatId?: string;
  onSelect: (chat: HikeChatSummary) => void;
  onRetry: () => void;
}) {
  return (
    <section className="flex max-h-[65svh] min-h-48 flex-col bg-white dark:bg-[#17342e]">
      <header className="border-b border-[#edf0ec] px-4 py-4 dark:border-white/10">
        <div className="flex items-center gap-2 text-[#1d604c] dark:text-[#cde5d3]">
          <MessageCircle pack="filled" className="size-4" aria-hidden="true" />
          <h2 className="text-sm font-bold">Messages</h2>
        </div>
        <p className="mt-1 text-[10px] leading-4 text-[#87948c] dark:text-white/50">
          Group chats for hikes you organize or join.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-2 p-3" role="status" aria-label="Loading hike chats">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-[8px] bg-[#f1f4f0] dark:bg-white/[0.05]"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-4 text-center">
          <p role="alert" className="text-xs text-[#8c3727] dark:text-[#ffb7a8]">
            Hike chats couldn’t be loaded.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-[#1d604c] underline underline-offset-2 dark:text-[#cde5d3]"
          >
            Try again
          </button>
        </div>
      ) : chats.length ? (
        <ul className="min-h-0 space-y-1 overflow-y-auto p-2">
          {chats.map((chat) => (
            <li key={chat.hikeId}>
              <button
                type="button"
                aria-pressed={selectedChatId === chat.hikeId}
                onClick={() => onSelect(chat)}
                className={`flex w-full items-start gap-2.5 rounded-[8px] px-2.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/40 ${selectedChatId === chat.hikeId ? 'bg-[#eaf3eb] dark:bg-white/[0.1]' : 'hover:bg-[#f3f6f2] dark:hover:bg-white/[0.06]'}`}
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#dce9df] text-[#1d604c] dark:bg-white/[0.1] dark:text-[#cde5d3]">
                  <Mountain pack="filled" className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-[#263d33] dark:text-white/90">
                    {chat.name}
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-[#87948c] dark:text-white/50">
                    {chat.locationName}
                  </span>
                  <span className="mt-1 block text-[9px] text-[#9aa59e] dark:text-white/40">
                    {chat.memberCount} {chat.memberCount === 1 ? 'member' : 'members'} ·{' '}
                    {formatDate(chat.scheduledDate)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-8 text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-full bg-[#edf5ee] text-[#1d604c] dark:bg-white/[0.08] dark:text-[#cde5d3]">
            <MessageCircle pack="filled" className="size-4" aria-hidden="true" />
          </span>
          <p className="mt-3 text-xs font-semibold text-[#354b3e] dark:text-white/80">
            No group chats yet
          </p>
          <p className="mt-1 text-[10px] leading-4 text-[#87948c] dark:text-white/50">
            Organize or join a hike to get added to its chat.
          </p>
        </div>
      )}
    </section>
  );
}

function HikeChatWindow({ chat, onClose }: { chat: HikeChatSummary; onClose: () => void }) {
  const { data: session } = useSession();
  const messagesQuery = useHikeChatMessages(chat.hikeId);
  const sendMessage = useSendHikeChatMessage();
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;

    shouldStickToBottomRef.current = true;
    setSendError(null);
    try {
      await sendMessage.mutateAsync({ hikeId: chat.hikeId, body });
      setDraft('');
    } catch {
      setSendError('Your message could not be sent. Please try again.');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <section
      role="dialog"
      aria-label={`${chat.name} group chat`}
      className="dapyo-card-elevation fixed bottom-20 right-4 z-[60] flex h-[min(32rem,calc(100svh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[8px] border border-[#dce5dc] bg-white shadow-[0_20px_60px_rgba(16,35,31,.24)] dark:border-white/10 dark:bg-[#17342e] xl:bottom-4"
    >
      <header className="flex shrink-0 items-center gap-2.5 border-b border-[#edf0ec] px-3.5 py-3 dark:border-white/10">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eaf3eb] text-[#1d604c] dark:bg-white/[0.08] dark:text-[#cde5d3]">
          <Mountain pack="filled" className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold text-[#263d33] dark:text-white/90">
            {chat.name}
          </span>
          <span className="block truncate text-[10px] text-[#87948c] dark:text-white/50">
            {chat.memberCount} {chat.memberCount === 1 ? 'member' : 'members'} · {chat.locationName}
          </span>
        </span>
        <button
          type="button"
          aria-label="Close chat"
          onClick={onClose}
          className="grid size-8 shrink-0 place-items-center rounded-full text-[#718176] transition-colors hover:bg-[#f1f4f0] hover:text-[#1d604c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/40 dark:text-white/60 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          <X pack="filled" className="size-4" aria-hidden="true" />
        </button>
      </header>

      <div
        onScroll={(event) => {
          const element = event.currentTarget;
          shouldStickToBottomRef.current =
            element.scrollHeight - element.scrollTop - element.clientHeight < 80;
        }}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-[#f8faf7] px-3 py-3 dark:bg-[#10231f]"
      >
        {messagesQuery.isLoading ? (
          <div className="space-y-2" role="status" aria-label="Loading messages">
            <div className="h-12 w-3/4 animate-pulse rounded-[12px] bg-[#e5ece4] dark:bg-white/[0.06]" />
            <div className="ml-auto h-12 w-2/3 animate-pulse rounded-[12px] bg-[#e5ece4] dark:bg-white/[0.06]" />
          </div>
        ) : messagesQuery.isError ? (
          <div className="m-auto text-center">
            <p role="alert" className="text-xs text-[#8c3727] dark:text-[#ffb7a8]">
              Messages couldn’t be loaded.
            </p>
            <button
              type="button"
              onClick={() => void messagesQuery.refetch()}
              className="mt-2 text-xs font-semibold text-[#1d604c] underline underline-offset-2 dark:text-[#cde5d3]"
            >
              Try again
            </button>
          </div>
        ) : messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sentByCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[12px] px-3 py-2 ${message.sentByCurrentUser ? 'rounded-br-[4px] bg-[#1d604c] text-white' : 'rounded-bl-[4px] bg-white text-[#354b3e] shadow-sm dark:bg-white/[0.08] dark:text-white/85'}`}
              >
                {!message.sentByCurrentUser && (
                  <p className="mb-1 text-[9px] font-semibold text-[#1d604c] dark:text-[#cde5d3]">
                    {message.senderName}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words text-xs leading-5">{message.body}</p>
                <time
                  dateTime={message.sentAt}
                  className={`mt-1 block text-right text-[8px] ${message.sentByCurrentUser ? 'text-white/60' : 'text-[#9aa59e] dark:text-white/40'}`}
                >
                  {formatTime(message.sentAt)}
                </time>
              </div>
            </div>
          ))
        ) : (
          <p className="m-auto max-w-56 text-center text-xs leading-5 text-[#87948c] dark:text-white/50">
            Say hello to your hike group and start planning together.
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(event) => void handleSend(event)}
        className="shrink-0 border-t border-[#edf0ec] bg-white p-2.5 dark:border-white/10 dark:bg-[#17342e]"
      >
        {sendError && (
          <p role="alert" className="mb-2 px-1 text-[10px] text-[#8c3727] dark:text-[#ffb7a8]">
            {sendError}
          </p>
        )}
        <div className="flex items-end gap-2 rounded-[8px] border border-[#dce5dc] bg-[#f8faf7] p-1.5 focus-within:border-[#1d604c] focus-within:ring-2 focus-within:ring-[#1d604c]/10 dark:border-white/10 dark:bg-[#10231f]">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={`Message ${chat.name} group`}
            placeholder="Write a message…"
            rows={1}
            maxLength={2000}
            className="max-h-24 min-h-9 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-xs leading-5 text-[#263d33] outline-none placeholder:text-[#9aa59e] dark:text-white/85 dark:placeholder:text-white/35"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sendMessage.isPending || !session?.accessToken}
            aria-label="Send message"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1d604c] text-white transition-colors hover:bg-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/40 disabled:opacity-45"
          >
            <SendAlt2 pack="filled" className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(year, month - 1, day),
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(
    new Date(value),
  );
}
