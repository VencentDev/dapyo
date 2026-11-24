'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  usePublicProfileSearch,
  useRemoveTrailmate,
  useRespondToTrailmateRequest,
  useSendTrailmateRequest,
  useTrailmateRequests,
  useTrailmates,
} from '@/features/trailmates/api/trailmates.hooks';

import { TrailmatesList } from './trailmates-list';
import { TrailmatesRequests } from './trailmates-requests';
import { TrailmatesSearch } from './trailmates-search';

export function TrailmatesManager() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const search = usePublicProfileSearch(debouncedQuery);
  const trailmates = useTrailmates();
  const requests = useTrailmateRequests();
  const sendRequest = useSendTrailmateRequest();
  const respond = useRespondToTrailmateRequest();
  const remove = useRemoveTrailmate();

  const relationshipState = useMemo(() => {
    const state = new Map<string, 'connected' | 'incoming' | 'outgoing'>();
    for (const trailmate of trailmates.data || []) state.set(trailmate.userId, 'connected');
    for (const request of requests.data?.incoming || []) state.set(request.userId, 'incoming');
    for (const request of requests.data?.outgoing || []) state.set(request.userId, 'outgoing');
    return state;
  }, [trailmates.data, requests.data]);

  const send = (userId: string) => {
    sendRequest.mutate(
      { userId },
      {
        onSuccess: () => toast.success('Trailmates request sent.'),
        onError: () => toast.error('Could not send that request. Refresh and try again.'),
      },
    );
  };

  const respondTo = (id: string, action: 'accept' | 'decline') => {
    respond.mutate(
      { id, action },
      {
        onSuccess: () =>
          toast.success(action === 'accept' ? 'You’re now Trailmates.' : 'Request declined.'),
        onError: () => toast.error('Could not update that request. Refresh and try again.'),
      },
    );
  };

  const removeConnection = (userId: string) => {
    if (!window.confirm('Remove this Trailmate? You can send a new request later.')) return;
    remove.mutate(userId, {
      onSuccess: () => toast.success('Trailmate removed.'),
      onError: () => toast.error('Could not remove this Trailmate. Refresh and try again.'),
    });
  };

  return (
    <div className="space-y-5">
      <TrailmatesSearch
        query={query}
        onQueryChange={setQuery}
        results={search.data || []}
        isLoading={
          query.trim().length >= 2 && (query.trim() !== debouncedQuery || search.isFetching)
        }
        error={search.isError}
        relationshipState={(userId) => relationshipState.get(userId) || null}
        isSending={sendRequest.isPending}
        onRequest={send}
      />

      {(trailmates.isError || requests.isError) && (
        <p
          role="alert"
          className="rounded-[8px] bg-[#fff2ea] px-4 py-3 text-sm text-[#804c27] dark:bg-[#4a3328] dark:text-[#ffd2ae]"
        >
          Your connection list could not load. Refresh to try again.
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <TrailmatesList
          trailmates={trailmates.data || []}
          isLoading={trailmates.isLoading}
          isRemoving={remove.isPending}
          onRemove={removeConnection}
        />
        <TrailmatesRequests
          incoming={requests.data?.incoming || []}
          outgoing={requests.data?.outgoing || []}
          isLoading={requests.isLoading}
          isResponding={respond.isPending}
          onRespond={respondTo}
        />
      </div>
    </div>
  );
}
