'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { components, paths } from '@app/api-types';

import { clientApi } from '@/lib/api';
import { qk } from '@/lib/queryKeys';

export type HikeChatSummary = components['schemas']['HikeChatSummaryResponse'];
export type HikeChatMessage = components['schemas']['HikeChatMessageResponse'];
type HikeChatMessageRequest = components['schemas']['HikeChatMessageRequest'];

type HikeChats =
  paths['/api/v1/hike-chats']['get']['responses']['200']['content']['application/json'];
type HikeChatMessages =
  paths['/api/v1/hikes/{hikeId}/messages']['get']['responses']['200']['content']['application/json'];
type SendHikeChatMessage =
  paths['/api/v1/hikes/{hikeId}/messages']['post']['responses']['201']['content']['application/json'];

export function useHikeChats() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: qk.hikeChats(session?.user?.id),
    queryFn: () => clientApi<HikeChats>(session?.accessToken, '/api/v1/hike-chats'),
    enabled: !!session?.accessToken,
    refetchInterval: 10_000,
  });
}

export function useHikeChatMessages(hikeId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: qk.hikeChatMessages(hikeId, session?.user?.id),
    queryFn: () =>
      clientApi<HikeChatMessages>(session?.accessToken, `/api/v1/hikes/${hikeId}/messages`),
    enabled: !!session?.accessToken && !!hikeId,
    refetchInterval: 4_000,
  });
}

export function useSendHikeChatMessage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hikeId, body }: { hikeId: string; body: string }) =>
      clientApi<SendHikeChatMessage>(session?.accessToken, `/api/v1/hikes/${hikeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body } satisfies HikeChatMessageRequest),
      }),
    onSuccess: async (_message, { hikeId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: qk.hikeChatMessages(hikeId, session?.user?.id),
        }),
        queryClient.invalidateQueries({ queryKey: qk.hikeChats(session?.user?.id) }),
      ]);
    },
  });
}
