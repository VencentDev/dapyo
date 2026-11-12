'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, CalendarDays, Check, MapPin, ShieldCheck, TreePine } from 'lucide-react';

const featureCards = [
  {
    title: 'Find your kind of trail',
    body: 'Filter by date, difficulty, distance, and location — so the right hike finds you.',
    icon: MapPin,
    tone: 'bg-[#e5edeb]',
  },
  {
    title: 'Go with good people',
    body: 'Get a feel for the group before you join, with real profiles and organizer reputation.',
    icon: ShieldCheck,
    tone: 'bg-[#e9edf3]',
  },
  {
    title: 'Make it a habit',
    body: 'Keep your hiking history, earn progress, and always have the next summit in sight.',
    icon: CalendarDays,
    tone: 'bg-[#f2ece1]',
  },
];

const storySteps = [
  {
    number: '01',
    title: 'Discover',
    body: 'Find a trail that fits your weekend, your pace, and your people.',
    image: '/images/how it works/discover.png',
    alt: 'Hiker scouting a snowy mountain view',
  },
  {
    number: '02',
    title: 'Join',
    body: 'See who is going, meet your organizer, and save your spot.',
    image: '/images/how it works/join.png',
    alt: 'Hiker joining an event from a phone',
  },
  {
    number: '03',
    title: 'Hike',
    body: 'Show up, share the trail, and leave with a story worth repeating.',
    image: '/images/how it works/hike.png',
    alt: 'A group of hikers walking together through the mountains',
  },
];

const heroLines = ['Find your next hike.', 'Find your people.'];

export function HomePageContent() {
  const [revealedSections, setRevealedSections] = useState<string[]>([]);
  const [storyStep, setStoryStep] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add('home-snap');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealedSections((current) =>
              current.includes(entry.target.id) ? current : [...current, entry.target.id],
            );
          }
        });
      },
      { threshold: 0.05 },
    );

    const sections = document.querySelectorAll<HTMLElement>('[data-reveal-section]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    const revealVisibleSections = () => {
      const visibleIds = Array.from(sections)
        .filter((section) => {
          const bounds = section.getBoundingClientRect();
          return (
            bounds.top < window.innerHeight * 0.85 && bounds.bottom > window.innerHeight * 0.15
          );
        })
        .map((section) => section.id);

      if (visibleIds.length) {
        setRevealedSections((current) => Array.from(new Set([...current, ...visibleIds])));
      }
    };

    requestAnimationFrame(revealVisibleSections);
    window.addEventListener('resize', revealVisibleSections, { passive: true });

    return () => {
      document.documentElement.classList.remove('home-snap');
      observer.disconnect();
      window.removeEventListener('resize', revealVisibleSections);
    };
  }, []);

  useEffect(() => {
    const section = document.getElementById('how-it-works');
    if (!section) return;

    const updateStoryStep = () => {
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(
        Math.max(-section.getBoundingClientRect().top / scrollDistance, 0),
        1,
      );
      setStoryStep(Math.min(2, Math.floor(progress * 3.05)));
    };

    updateStoryStep();
    window.addEventListener('scroll', updateStoryStep, { passive: true });
    window.addEventListener('resize', updateStoryStep, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateStoryStep);
      window.removeEventListener('resize', updateStoryStep);
    };
  }, []);

  const exploreVisible = revealedSections.includes('explore');
  const journeyVisible = revealedSections.includes('how-it-works');

  return (
    <main className="full-bleed -my-6 overflow-x-clip bg-[#f5f6f2] text-[#10231f]">
      <section className="home-snap-section sticky top-0 z-0 relative isolate min-h-[100svh] overflow-hidden bg-[#132824] text-white">
        <Image
          src="/images/hero-section-2.png"
          alt="Hikers walking toward a snowy mountain"
          fill
          priority
          className="object-cover object-[61%_center] opacity-75"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d211e]/95 via-[#102822]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10231f]/80 via-transparent to-[#10231f]/20" />
        <div className="landing-container relative z-10 mx-auto flex min-h-[100svh] items-end pb-32 pt-36 sm:pb-36">
          <div className="w-full max-w-3xl animate-float-in">
            <div className="hero-kicker mb-6 flex items-center gap-3 text-[#d8a75f]">
              <span className="h-px w-14 bg-[#d8a75f]/60" aria-hidden="true" />
              <TreePine className="size-4" strokeWidth={1.8} />
              <p className="max-w-full font-mono text-[9px] uppercase leading-4 tracking-[0.18em] sm:whitespace-nowrap sm:text-[11px] sm:tracking-[0.28em]">
                The hiking community for real-world adventure
              </p>
            </div>
            <h1 className="max-w-none text-[clamp(2.35rem,8vw,6.2rem)] font-semibold leading-[0.96] tracking-[-0.055em]">
              <span className="sr-only">Find your next hike. Find your people.</span>
              <span aria-hidden="true">
                {heroLines.map((line, lineIndex) => (
                  <span
                    key={line}
                    className={`hero-title-line block whitespace-nowrap ${lineIndex === 1 ? 'text-[#d7e0d9]' : ''}`}
                  >
                    {line.split('').map((character, characterIndex) => (
                      <span
                        key={`${line}-${characterIndex}`}
                        className="hero-title-character inline-block"
                        style={{
                          animationDelay: `${0.7 + lineIndex * 0.55 + characterIndex * 0.035}s`,
                        }}
                      >
                        {character === ' ' ? '\u00a0' : character}
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            </h1>
            <p className="hero-follow-up mt-7 max-w-md text-base leading-7 text-white/78 sm:text-lg">
              Discover scheduled hikes, meet reliable people, and make the next trail part of your
              story.
            </p>
            <div className="hero-follow-up mt-9 flex flex-col gap-3 sm:flex-row [animation-delay:1.8s]">
              <Link
                href="/signup"
                className="group inline-flex h-12 w-full max-w-full min-w-0 items-center justify-center gap-3 rounded-[8px] bg-[#d8a75f] px-5 text-sm font-semibold text-[#18231e] shadow-lg shadow-black/20 transition-all hover:bg-[#e5bb7d] active:scale-[.98] sm:w-auto sm:px-6"
              >
                Start exploring{' '}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 w-full max-w-full min-w-0 items-center justify-center rounded-[8px] border border-white/35 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:w-auto sm:px-6"
              >
                See how it works
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 right-4 hidden max-w-[210px] text-right text-xs leading-5 text-white/60 lg:block">
            <span className="mb-2 block text-[#d8a75f]">01 / 04</span>More than a trail.
            <br />A reason to go.
          </div>
        </div>
      </section>

      <section
        id="explore"
        data-reveal-section
        className="home-snap-section relative z-10 bg-[#f5f6f2] landing-container mx-auto py-20 sm:py-28"
      >
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.5fr] lg:gap-24">
          <div>
            <p className="section-kicker">Made for moving</p>
            <h2 className="section-title mt-4 max-w-md">
              The best hikes are the ones you actually show up for.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featureCards.map(({ title, body, icon: Icon, tone }, index) => (
              <article
                key={title}
                className={`feature-card-reveal group rounded-[8px] p-6 transition-transform hover:-translate-y-1 ${tone} ${exploreVisible ? 'is-visible' : ''}`}
                style={{ '--card-delay': `${index * 140}ms` } as CSSProperties}
              >
                <div className="mb-16 flex size-10 items-center justify-center rounded-full bg-white/65 text-[#21483e]">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#52645f]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        data-reveal-section
        className="home-snap-section relative z-10 min-h-[280svh] overflow-x-clip bg-[#17342e] text-white"
      >
        <div className="story-sticky-panel sticky top-0 flex min-h-[100svh] items-center">
          <div className="landing-container mx-auto grid min-h-[100svh] w-full items-center gap-14 py-20 sm:py-28 lg:grid-cols-[.85fr_1.15fr] lg:gap-24">
            <div className="story-copy">
              <p className="section-kicker text-[#d8a75f]">Discover · Join · Hike</p>
              <div className="mt-8 space-y-10">
                {storySteps.map(({ number, title, body }, index) => (
                  <article
                    key={number}
                    className={`story-step ${journeyVisible && storyStep >= index ? 'is-visible' : ''}`}
                    style={{ '--story-delay': `${index * 120}ms` } as CSSProperties}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-[#d8a75f]">{number}</span>
                      <h2 className="text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                        {title}
                      </h2>
                    </div>
                    <p className="mt-3 max-w-sm pl-9 text-sm leading-6 text-white/60">{body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="story-media-stack relative mx-auto hidden aspect-[4/3] w-full max-w-2xl md:block">
              {storySteps.map(({ number, image, alt }, index) => (
                <div
                  key={number}
                  className={`story-image-card story-image-card-${index + 1} ${journeyVisible && storyStep >= index ? 'is-visible' : ''}`}
                  style={{ '--story-delay': '0ms' } as CSSProperties}
                >
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="community"
        className="home-snap-section relative z-10 bg-[#f5f6f2] landing-container mx-auto py-20 sm:py-28"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-24">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-[#dfe8e3]">
            <Image
              src="/images/hero-section.jpg"
              alt="A hiking group in the mountains"
              fill
              className="object-cover object-[72%_center] saturate-[.72]"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10231f]/60 to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-[8px] border border-white/20 bg-[#10231f]/70 px-4 py-3 text-white backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d8a75f]">
                The DAPYO promise
              </p>
              <p className="mt-1 text-sm">More trails. More often.</p>
            </div>
          </div>
          <div>
            <p className="section-kicker">A better way outside</p>
            <h2 className="section-title mt-4 max-w-lg">
              Your next adventure is closer than you think.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-[#52645f]">
              Whether you are new to hiking or know every trail by heart, DAPYO helps you find the
              right route, the right pace, and a group you can trust.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-[#314b44]">
              {[
                'Free for hikers and organizers',
                'Profiles built on real participation',
                'A community that keeps showing up',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#d8e8df] text-[#1a624b]">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#1d604c]"
            >
              Join the community{' '}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-snap-section relative z-10 bg-[#dce8df] px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="section-kicker">The trail is calling</p>
          <h2 className="section-title mx-auto mt-4 max-w-2xl">Make this the weekend you go.</h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-[#52645f]">
            Find a hike. Find your people. Then take the first step.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 items-center gap-3 rounded-[8px] bg-[#17342e] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#254f44]"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
      <footer className="relative z-10 min-h-[180px] bg-[#10231f] px-4 py-8 text-white/60">
        <div className="landing-container mx-auto flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <span className="font-mono font-semibold tracking-[.18em] text-white">DAPYO</span>
          <span>Find your next hike. Find your people.</span>
          <span>© {new Date().getFullYear()} DAPYO</span>
        </div>
      </footer>
    </main>
  );
}
