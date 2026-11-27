'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { components, paths } from '@app/api-types';

import { clientApi } from '@/lib/api';
import { qk } from '@/lib/queryKeys';

export type HikeCreateRequest = components['schemas']['HikeCreateRequest'];
export type HikeDetail = components['schemas']['HikeDetailResponse'];
export type HikeSummary = components['schemas']['HikeSummaryResponse'];
export type HikeImage = components['schemas']['HikeImageResponse'];
export type HikeLikeResponse = components['schemas']['HikeLikeResponse'];

type UpcomingHikes =
  paths['/api/v1/hikes']['get']['responses']['200']['content']['application/json'];
type CreateHikeResponse =
  paths['/api/v1/hikes']['post']['responses']['201']['content']['application/json'];
type UploadHikeImageResponse =
  paths['/api/v1/hikes/{id}/images']['post']['responses']['201']['content']['application/json'];
type JoinHikeResponse =
  paths['/api/v1/hikes/{id}/join']['post']['responses']['200']['content']['application/json'];
type JoinRequestsResponse =
  paths['/api/v1/hikes/{id}/join-requests']['get']['responses']['200']['content']['application/json'];
type ApproveJoinResponse =
  paths['/api/v1/hikes/{id}/join-requests/{userId}/accept']['post']['responses']['200']['content']['application/json'];
type AddMemberRequest = components['schemas']['HikeMemberAddRequest'];
type UpdateGuestsRequest = components['schemas']['HikeGuestCountUpdateRequest'];

export function useUpcomingHikes(page = 0, size = 20) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: qk.upcomingHikes(page, size, session?.user?.id),
    queryFn: () =>
      clientApi<UpcomingHikes>(session?.accessToken, `/api/v1/hikes?page=${page}&size=${size}`),
    enabled: status !== 'loading',
  });
}

export function useHike(hikeId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: qk.hike(hikeId, session?.user?.id),
    queryFn: () => clientApi<HikeDetail>(session?.accessToken, `/api/v1/hikes/${hikeId}`),
    enabled: !!hikeId,
  });
}

export function useCreateHike() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: HikeCreateRequest) =>
      clientApi<CreateHikeResponse>(session?.accessToken, '/api/v1/hikes', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['upcoming-hikes'] }),
        queryClient.invalidateQueries({ queryKey: qk.hikeChats(session?.user?.id) }),
      ]);
    },
  });
}

export function useUploadHikeImage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hikeId, file, caption }: { hikeId: string; file: File; caption: string }) => {
      const form = new FormData();
      form.append('file', file, file.name);
      if (caption.trim()) form.append('caption', caption.trim());
      return clientApi<UploadHikeImageResponse>(
        session?.accessToken,
        `/api/v1/hikes/${hikeId}/images`,
        { method: 'POST', body: form },
      );
    },
    onSuccess: async (_image, variables) => {
      await queryClient.invalidateQueries({
        queryKey: qk.hikePrefix(variables.hikeId),
      });
      await queryClient.invalidateQueries({ queryKey: ['upcoming-hikes'] });
    },
  });
}

export function useJoinHike() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hikeId: string) =>
      clientApi<JoinHikeResponse>(session?.accessToken, `/api/v1/hikes/${hikeId}/join`, {
        method: 'POST',
      }),
    onSuccess: async (hike) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.hikePrefix(hike.id) }),
        queryClient.invalidateQueries({ queryKey: ['upcoming-hikes'] }),
        queryClient.invalidateQueries({ queryKey: qk.hikeChats(session?.user?.id) }),
      ]);
    },
  });
}

export function useSetHikeLike() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hikeId, liked }: { hikeId: string; liked: boolean }) =>
      clientApi<HikeLikeResponse>(session?.accessToken, `/api/v1/hikes/${hikeId}/likes`, {
        method: liked ? 'POST' : 'DELETE',
      }),
    onSuccess: (reaction) => {
      const currentViewerId = session?.user?.id ?? 'anonymous';
      for (const [queryKey, current] of queryClient.getQueriesData<UpcomingHikes>({
        queryKey: ['upcoming-hikes'],
      })) {
        if (!current) continue;
        const isCurrentViewerCache = queryKey[3] === currentViewerId;
        queryClient.setQueryData<UpcomingHikes>(queryKey, {
          ...current,
          content: current.content.map((hike) =>
            hike.id === reaction.hikeId
              ? {
                  ...hike,
                  likeCount: reaction.likeCount,
                  likedByCurrentUser: isCurrentViewerCache
                    ? reaction.likedByCurrentUser
                    : hike.likedByCurrentUser,
                }
              : hike,
          ),
        });
      }
      for (const [queryKey, current] of queryClient.getQueriesData<HikeDetail>({
        queryKey: qk.hikePrefix(reaction.hikeId),
      })) {
        if (!current) continue;
        const isCurrentViewerCache = queryKey[2] === currentViewerId;
        queryClient.setQueryData<HikeDetail>(queryKey, {
          ...current,
          likeCount: reaction.likeCount,
          likedByCurrentUser: isCurrentViewerCache
            ? reaction.likedByCurrentUser
            : current.likedByCurrentUser,
        });
      }
    },
  });
}

export function useHikeJoinRequests(hikeId: string, enabled = true) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: qk.hikeJoinRequests(hikeId),
    queryFn: () =>
      clientApi<JoinRequestsResponse>(
        session?.accessToken,
        `/api/v1/hikes/${hikeId}/join-requests`,
      ),
    enabled: !!session?.accessToken && !!hikeId && enabled,
  });
}

export function useRespondToHikeJoinRequest() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hikeId,
      userId,
      action,
    }: {
      hikeId: string;
      userId: string;
      action: 'accept' | 'decline';
    }) => {
      return clientApi<ApproveJoinResponse | undefined>(
        session?.accessToken,
        `/api/v1/hikes/${hikeId}/join-requests/${userId}/${action}`,
        { method: 'POST' },
      );
    },
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: qk.hikePrefix(variables.hikeId),
        }),
        queryClient.invalidateQueries({ queryKey: qk.hikeJoinRequests(variables.hikeId) }),
        queryClient.invalidateQueries({ queryKey: ['upcoming-hikes'] }),
        queryClient.invalidateQueries({ queryKey: qk.hikeChats(session?.user?.id) }),
      ]);
    },
  });
}

export function useAddHikeTrailmate() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hikeId, userId }: { hikeId: string; userId: string }) =>
      clientApi<HikeDetail>(session?.accessToken, `/api/v1/hikes/${hikeId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId } satisfies AddMemberRequest),
      }),
    onSuccess: async (hike) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.hikePrefix(hike.id) }),
        queryClient.invalidateQueries({ queryKey: ['upcoming-hikes'] }),
        queryClient.invalidateQueries({ queryKey: qk.hikeChats(session?.user?.id) }),
      ]);
    },
  });
}

export function useUpdateHikeGuests() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hikeId, externalGuestCount }: { hikeId: string; externalGuestCount: number }) =>
      clientApi<HikeDetail>(session?.accessToken, `/api/v1/hikes/${hikeId}/guests`, {
        method: 'PATCH',
        body: JSON.stringify({ externalGuestCount } satisfies UpdateGuestsRequest),
      }),
    onSuccess: async (hike) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.hikePrefix(hike.id) }),
        queryClient.invalidateQueries({ queryKey: ['upcoming-hikes'] }),
      ]);
    },
  });
}
