export const qk = {
  me: () => ['me'] as const,
  trailmates: () => ['trailmates'] as const,
  trailmateRequests: () => ['trailmate-requests'] as const,
  publicProfileSearch: (query: string) => ['public-profile-search', query] as const,
  upcomingHikes: (page: number, size: number, viewerId?: string) =>
    ['upcoming-hikes', page, size, viewerId ?? 'anonymous'] as const,
  hikeChats: (viewerId?: string) => ['hike-chats', viewerId ?? 'anonymous'] as const,
  hikeChatMessages: (hikeId: string, viewerId?: string) =>
    ['hike-chat-messages', hikeId, viewerId ?? 'anonymous'] as const,
  hike: (hikeId: string, viewerId?: string) => ['hike', hikeId, viewerId ?? 'anonymous'] as const,
  hikePrefix: (hikeId: string) => ['hike', hikeId] as const,
  hikeJoinRequests: (hikeId: string) => ['hike-join-requests', hikeId] as const,
};
