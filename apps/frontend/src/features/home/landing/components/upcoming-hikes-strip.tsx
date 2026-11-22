import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

// Visual feed preview until the backend exposes scheduled hikes and participant data.
const hikes = [
  {
    title: 'Mt. Ulap sunrise',
    location: 'Itogon, Benguet',
    date: 'NOV 28 · SATURDAY',
    difficulty: 'MODERATE · 6 MI',
    spots: 4,
    photo: '/images/how it works/hike.png',
    people: ['AL', 'MK', 'JT'],
    colors: ['#b88463', '#607e6c', '#7789a0'],
  },
  {
    title: 'Batulao ridgeline',
    location: 'Nasugbu, Batangas',
    date: 'DEC 05 · SATURDAY',
    difficulty: 'EASY · 4 MI',
    spots: 2,
    photo: '/images/hero-section.jpg',
    people: ['CR', 'NS', 'PA'],
    colors: ['#75927b', '#c38c66', '#7d8190'],
  },
  {
    title: 'Mossy forest day hike',
    location: 'Kabayan, Benguet',
    date: 'DEC 12 · SATURDAY',
    difficulty: 'CHALLENGING · 8 MI',
    spots: 5,
    photo: '/images/hero-section-2.png',
    people: ['EM', 'RL', 'DV'],
    colors: ['#9b7859', '#688b77', '#d0a565'],
  },
  {
    title: 'Kibungan mountain loop',
    location: 'Kibungan, Benguet',
    date: 'DEC 19 · SATURDAY',
    difficulty: 'CHALLENGING · 7 MI',
    spots: 3,
    photo: '/images/how it works/discover.png',
    people: ['JC', 'AM', 'LO'],
    colors: ['#7b8d69', '#c28b68', '#647b8a'],
  },
  {
    title: 'Pine forest sunrise',
    location: 'Tuba, Benguet',
    date: 'DEC 26 · SATURDAY',
    difficulty: 'MODERATE · 5 MI',
    spots: 4,
    photo: '/images/how it works/join.png',
    people: ['KA', 'MB', 'ST'],
    colors: ['#778d6a', '#bc8e6a', '#71879a'],
  },
];

export function UpcomingHikesStrip() {
  return (
    <section
      id="upcoming-hikes"
      aria-labelledby="upcoming-hikes-title"
      className="upcoming-hikes-section home-snap-section home-first-snap-stop"
    >
      <h2 id="upcoming-hikes-title" className="sr-only">
        Upcoming group hikes
      </h2>
      <div
        className="upcoming-hikes-rail"
        role="region"
        aria-label="Upcoming hikes. Scroll horizontally for more."
      >
        {hikes.map((hike) => {
          const content = (
            <>
              <div className="upcoming-hike-photo">
                <Image
                  src={hike.photo}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 220px, (min-width: 640px) 210px, 68vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="upcoming-hike-photo-shade" aria-hidden="true" />
              </div>
              <div className="upcoming-hike-info">
                <div className="upcoming-hike-info-top">
                  <span className="upcoming-hike-date">{hike.date}</span>
                  <span className="upcoming-hike-difficulty">{hike.difficulty}</span>
                </div>
                <h3>{hike.title}</h3>
                <p className="upcoming-hike-location">
                  <MapPin className="size-3" aria-hidden="true" /> {hike.location}
                </p>
                <div className="upcoming-hike-bottom">
                  <span
                    className="upcoming-hike-avatars"
                    role="img"
                    aria-label={`${hike.people.length} hikers going`}
                  >
                    {hike.people.map((person, index) => (
                      <span
                        key={person}
                        aria-hidden="true"
                        style={{
                          backgroundColor: hike.colors[index],
                          zIndex: hike.people.length - index,
                        }}
                      >
                        {person}
                      </span>
                    ))}
                  </span>
                  <span className="upcoming-hike-spots">{hike.spots} spots left</span>
                </div>
              </div>
            </>
          );

          return (
            <Link key={hike.title} href="/home" className="upcoming-hike-card group">
              {content}
            </Link>
          );
        })}
        <Link href="/home" className="upcoming-hike-more-card group">
          <span>Browse more</span>
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
