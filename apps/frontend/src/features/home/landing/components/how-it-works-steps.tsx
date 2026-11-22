'use client';

import { useState } from 'react';
import Image from 'next/image';
import { RotateCw } from 'lucide-react';
import { TextAnimate } from '@/registry/magicui/text-animate';

const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Browse scheduled hikes by date, difficulty, and distance.',
    image: '/images/how it works/discover.png',
    alt: 'Hiker looking out across a mountain route',
  },
  {
    number: '02',
    title: 'Join',
    description: 'Review the group and organizer, then reserve your place.',
    image: '/images/how it works/join.png',
    alt: 'Hiker checking details for an upcoming group hike',
  },
  {
    number: '03',
    title: 'Hike',
    description: 'Meet at the trailhead and take on the route together.',
    image: '/images/how it works/hike.png',
    alt: 'Group of hikers walking together on a mountain trail',
  },
];

export function HowItWorksSteps() {
  const [flippedStep, setFlippedStep] = useState<string | null>(null);

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="how-it-works-cards-section relative z-10 bg-[#17342e] py-14 text-white sm:py-16 lg:py-20"
    >
      <div className="landing-container mx-auto max-w-7xl">
        <header className="how-it-works-cards-heading">
          <TextAnimate animation="blurIn" as="p" once className="section-kicker text-[#d8a75f]">
            How it works
          </TextAnimate>
          <TextAnimate
            animation="blurIn"
            as="h2"
            once
            delay={0.08}
            id="how-it-works-title"
            className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl"
          >
            Find a hike. Go together.
          </TextAnimate>
          <TextAnimate
            animation="blurIn"
            as="p"
            once
            delay={0.16}
            className="mt-3 max-w-lg text-sm leading-6 text-white/65"
          >
            Browse a scheduled hike, join its group, and meet at the trailhead.
          </TextAnimate>
        </header>

        <div className="how-it-works-cards-grid">
          {steps.map((step) => {
            const flipped = flippedStep === step.number;
            const detailsId = `how-it-works-details-${step.number}`;

            return (
              <article
                key={step.number}
                className={`how-it-works-step-card${flipped ? ' is-flipped' : ''}`}
              >
                <button
                  type="button"
                  className="how-it-works-step-trigger"
                  aria-expanded={flipped}
                  aria-controls={detailsId}
                  onClick={() => setFlippedStep(flipped ? null : step.number)}
                >
                  <span className="how-it-works-step-flip-inner">
                    <span
                      className="how-it-works-step-face how-it-works-step-front"
                      aria-hidden={flipped}
                    >
                      <Image
                        src={step.image}
                        alt={step.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        quality={90}
                        className="object-cover"
                      />
                      <span className="how-it-works-step-photo-shade" aria-hidden="true" />
                      <span className="how-it-works-step-photo-number">{step.number}</span>
                      <span className="how-it-works-step-footer">
                        <span className="how-it-works-step-index">STEP {step.number}</span>
                        <span className="how-it-works-step-title-row">
                          <span className="how-it-works-step-title">{step.title}</span>
                          <RotateCw
                            className="how-it-works-step-flip-icon size-4"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="how-it-works-step-hint">Click to read more</span>
                      </span>
                    </span>

                    <span
                      className="how-it-works-step-face how-it-works-step-back"
                      aria-hidden={!flipped}
                    >
                      <span className="how-it-works-step-index">STEP {step.number}</span>
                      <span className="how-it-works-step-back-title">{step.title}</span>
                      <span id={detailsId} className="how-it-works-step-description">
                        {step.description}
                      </span>
                      <span className="how-it-works-step-hint">
                        <RotateCw className="size-3.5" aria-hidden="true" />
                        Click to see photo
                      </span>
                    </span>
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
