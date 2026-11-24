'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { components, paths } from '@app/api-types';

import { clientApi } from '@/lib/api';
import { qk } from '@/lib/queryKeys';

type SearchResults =
  paths['/api/v1/users/search']['get']['responses']['200']['content']['application/json'];
type Trailmates =
  paths['/api/v1/trailmates']['get']['responses']['200']['content']['application/json'];
type Requests =
  paths['/api/v1/trailmates/requests']['get']['responses']['200']['content']['application/json'];
type SentRequest =
  paths['/api/v1/trailmates/requests']['post']['responses']['201']['content']['application/json'];
type CreateRequest = components['schemas']['TrailmateRequestCreateRequest'];

export type PublicProfile = components['schemas']['PublicUserSearchResponse'];
export type TrailmateConnection = components['schemas']['TrailmateResponse'];
export type TrailmateRequest = components['schemas']['TrailmateRequestResponse'];

export function usePublicProfileSearch(query: string) {
  const { data: session } = useSession();
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: qk.publicProfileSearch(normalizedQuery),
    queryFn: () =>
      clientApi<SearchResults>(
        session?.accessToken,
        `/api/v1/users/search?query=${encodeURIComponent(normalizedQuery)}`,
      ),
    enabled: !!session?.accessToken && normalizedQuery.length >= 2,
  });
}

export function useTrailmates(enabled = true) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: qk.trailmates(),
    queryFn: () => clientApi<Trailmates>(session?.accessToken, '/api/v1/trailmates'),
    enabled: !!session?.accessToken && enabled,
  });
}

export function useTrailmateRequests() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: qk.trailmateRequests(),
    queryFn: () => clientApi<Requests>(session?.accessToken, '/api/v1/trailmates/requests'),
    enabled: !!session?.accessToken,
  });
}

export function useSendTrailmateRequest() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRequest) =>
      clientApi<SentRequest>(session?.accessToken, '/api/v1/trailmates/requests', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.trailmates() }),
        queryClient.invalidateQueries({ queryKey: qk.trailmateRequests() }),
      ]);
    },
  });
}

export function useRespondToTrailmateRequest() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      clientApi<void>(session?.accessToken, `/api/v1/trailmates/requests/${id}/${action}`, {
        method: 'POST',
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.trailmates() }),
        queryClient.invalidateQueries({ queryKey: qk.trailmateRequests() }),
      ]);
    },
  });
}

export function useRemoveTrailmate() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      clientApi<void>(session?.accessToken, `/api/v1/trailmates/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.trailmates() }),
        queryClient.invalidateQueries({ queryKey: qk.trailmateRequests() }),
      ]);
    },
  });
}
