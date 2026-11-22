'use client';

import { Clock3, Compass, MapPin, Mountain, Search, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { Input } from '@/components/ui/input';
import { popularTrails, sampleActivities } from '@/features/home/feed/lib/home-feed-preview';

const recentSearchStorageKey = 'dapyo.home.recent-searches';
const searchDropdownExitDurationMs = 150;

const suggestedSearches = [
  ...popularTrails.map((trail) => ({
    value: trail.name,
    detail: `${trail.location} · ${trail.length}`,
    category: 'trails' as const,
  })),
  ...sampleActivities.map((activity) => ({
    value: activity.location,
    detail: 'Community updates',
    category: 'places' as const,
  })),
  ...sampleActivities.map((activity) => ({
    value: activity.author,
    detail: 'Hiker',
    category: 'hikers' as const,
  })),
];

const searchFilters = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'trails', label: 'Trails', icon: Mountain },
  { id: 'places', label: 'Places', icon: MapPin },
  { id: 'hikers', label: 'Hikers', icon: Users },
] as const;

type SearchFilter = (typeof searchFilters)[number]['id'];

type SearchOption = {
  value: string;
  detail: string;
  source: 'recent' | 'suggested';
  category: SearchFilter;
};

export function HomeFeedSearch() {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isListboxMounted, setIsListboxMounted] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');

  useEffect(() => {
    if (isOpen) {
      if (!isListboxMounted) setIsListboxMounted(true);
      return;
    }

    if (!isListboxMounted) return;

    const timeoutId = window.setTimeout(
      () => setIsListboxMounted(false),
      searchDropdownExitDurationMs,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isListboxMounted, isOpen]);

  useEffect(() => {
    try {
      const storedSearches = window.localStorage.getItem(recentSearchStorageKey);
      if (storedSearches) {
        const parsedSearches: unknown = JSON.parse(storedSearches);
        if (Array.isArray(parsedSearches)) {
          setRecentSearches(
            parsedSearches
              .filter((value): value is string => typeof value === 'string')
              .slice(0, 5),
          );
        }
      }
    } catch {
      // Recent searches are optional and can be unavailable in private browsing.
    }
  }, []);

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = (value: string) =>
      !normalizedQuery || value.toLowerCase().includes(normalizedQuery);
    const recentOptions: SearchOption[] = recentSearches
      .filter(matchesQuery)
      .map((value) => ({ value, detail: 'Recent search', source: 'recent', category: 'all' }));
    const recentValues = new Set(recentOptions.map((option) => option.value.toLowerCase()));
    const suggestedOptions: SearchOption[] = suggestedSearches
      .filter(
        ({ value, category }) =>
          matchesQuery(value) &&
          !recentValues.has(value.toLowerCase()) &&
          (activeFilter === 'all' || activeFilter === category),
      )
      .map(({ value, detail, category }) => ({
        value,
        detail,
        source: 'suggested',
        category,
      }));

    return [...recentOptions, ...suggestedOptions];
  }, [activeFilter, query, recentSearches]);

  const recordSearch = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;

    setQuery(value);
    const nextSearches = [
      value,
      ...recentSearches.filter((search) => search.toLowerCase() !== value.toLowerCase()),
    ].slice(0, 5);
    setRecentSearches(nextSearches);
    try {
      window.localStorage.setItem(recentSearchStorageKey, JSON.stringify(nextSearches));
    } catch {
      // Keep the current-session search history if storage is unavailable.
    }
    setActiveOptionIndex(-1);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveOptionIndex((currentIndex) =>
        options.length === 0 ? -1 : (currentIndex + 1) % options.length,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveOptionIndex((currentIndex) =>
        options.length === 0 ? -1 : currentIndex <= 0 ? options.length - 1 : currentIndex - 1,
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      recordSearch(options[activeOptionIndex]?.value ?? query);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveOptionIndex(-1);
    }
  };

  const recentOptions = options.filter((option) => option.source === 'recent');
  const suggestedOptions = options.filter((option) => option.source === 'suggested');
  const renderOption = (option: SearchOption, optionIndex: number) => (
    <div
      key={`${option.source}-${option.value}`}
      id={`home-feed-search-option-${optionIndex}`}
      role="option"
      aria-selected={activeOptionIndex === optionIndex}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => setActiveOptionIndex(optionIndex)}
      onClick={() => recordSearch(option.value)}
      className={`flex cursor-pointer items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition-colors ${activeOptionIndex === optionIndex ? 'bg-[#e8eee9] text-[#17342e]' : 'text-[#52645f] hover:bg-[#f1f4f0] hover:text-[#17342e]'}`}
    >
      {option.source === 'recent' ? (
        <Clock3 className="size-4 shrink-0 text-[#89968e]" aria-hidden="true" />
      ) : (
        <MapPin className="size-4 shrink-0 text-[#b17e43]" aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1 truncate">{option.value}</span>
      <span className="shrink-0 text-[10px] text-[#89968e]">{option.detail}</span>
    </div>
  );

  let optionIndex = 0;

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        recordSearch(options[activeOptionIndex]?.value ?? query);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
          setActiveOptionIndex(-1);
        }
      }}
      className="relative"
    >
      <div className="space-y-3">
        <div>
          <label className="sr-only" htmlFor="home-feed-search-input">
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-[#527066]"
              aria-hidden="true"
            />
            <Input
              id="home-feed-search-input"
              name="search"
              type="text"
              role="combobox"
              aria-label="Search"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls="home-feed-search-listbox"
              aria-activedescendant={
                activeOptionIndex >= 0 ? `home-feed-search-option-${activeOptionIndex}` : undefined
              }
              autoComplete="off"
              placeholder="Search..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsOpen(true);
                setActiveOptionIndex(-1);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="h-12 rounded-[8px] border-0 bg-white/70 pl-11 pr-11 text-sm text-[#17342e] shadow-sm shadow-[#17342e]/[0.06] placeholder:text-[#84918a] backdrop-blur-xl focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery('');
                  setActiveOptionIndex(-1);
                  setIsOpen(true);
                }}
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[8px] text-[#718077] transition-colors hover:bg-[#eef2ed] hover:text-[#17342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a75f]"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter search suggestions"
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {searchFilters.map(({ id, label, icon: Icon }) => {
            const isSelected = activeFilter === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setActiveFilter(id);
                  setActiveOptionIndex(-1);
                  setIsOpen(true);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8bd78] ${isSelected ? 'border-[#d8a75f] bg-[#d8a75f] text-[#17342e]' : 'border-[#17342e]/15 bg-white/45 text-[#31533f] hover:bg-white/80 hover:text-[#17342e]'}`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {isListboxMounted && (
        <div
          id="home-feed-search-listbox"
          role="listbox"
          aria-label="Search suggestions"
          aria-hidden={!isOpen}
          data-state={isOpen ? 'open' : 'closed'}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 origin-top overflow-y-auto rounded-[8px] border border-[#17342e]/10 bg-white/95 p-2 text-[#17342e] shadow-2xl shadow-[#10231f]/15 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:fill-mode-backwards data-[state=open]:duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150 data-[state=closed]:pointer-events-none ease-out"
        >
          <div role="group" aria-label="Recent searches" className="pb-2">
            <p className="px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9a7548]">
              Recent searches
            </p>
            {recentOptions.length > 0 ? (
              recentOptions.map((option) => renderOption(option, optionIndex++))
            ) : (
              <p className="px-3 pb-2 text-xs text-[#89968e]">
                {recentSearches.length > 0 && query
                  ? 'No matching recent searches'
                  : 'No recent searches yet'}
              </p>
            )}
          </div>
          <div
            role="group"
            aria-label="Suggested searches"
            className="border-t border-[#edf0ec] pt-2"
          >
            <p className="px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9a7548]">
              Suggested searches
            </p>
            {suggestedOptions.length > 0 ? (
              suggestedOptions.map((option) => renderOption(option, optionIndex++))
            ) : (
              <p className="px-3 pb-2 text-xs text-[#89968e]">No matching suggestions</p>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
