'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

import { LogoMark } from './logo';

gsap.registerPlugin(useGSAP);

const VIEWBOX_SIZE = 32;
const SHAPE_EXTENT = 14;
// Disc and ring centers sit this far left/right of the mark's center.
const HOME_OFFSET = 4;
// Centers 9 apart while orbiting: shapes of radius 9 overlap by half.
const ORBIT_RADIUS = 4.5;
// Vertical offset of each shape while it slides in from its side.
const APPROACH_LIFT = 3;
// Where the horizontal approach meets the orbit circle.
const APPROACH_ANGLE = Math.asin(-APPROACH_LIFT / ORBIT_RADIUS);
const APPROACH_X = Math.cos(APPROACH_ANGLE) * ORBIT_RADIUS;
const ORBIT_TURNS = 2;
const ENTER_DURATION = 1.8;
const ORBIT_DURATION = 1.4;
const SETTLE_DURATION = 0.3;
const PRESS_SCALE = 0.86;
const PRESS_DURATION = 0.12;
const RELEASE_DURATION = 0.7;
const MATCH_HOLD = 1.2;
const EXIT_DURATION = 0.9;
const EXIT_SCALE = 1.8;
const LOOP_PAUSE = 0.4;

interface AnimatedLogoMarkProps {
  className?: string;
}

/**
 * Loops the logo mark through the matching story:
 * 1. Get-together: disc and ring slide in horizontally from outside the
 *    panel on opposite sides, one higher than the other.
 * 2. Converse: they quickly orbit each other, overlapping by half.
 * 3. Match: they settle into the logo and bounce once like a pressed button.
 * 4. Clean-up: the mark moves towards the viewer and fades out.
 */
export function AnimatedLogoMark({ className }: AnimatedLogoMarkProps) {
  const container = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const mark = container.current;
        const panel = mark?.parentElement;
        const disc = mark?.querySelector('[data-logo-disc]');
        const ring = mark?.querySelector('[data-logo-ring]');
        if (!mark || !panel || !disc || !ring) {
          return;
        }

        // Shift that puts a shape fully outside the (clipping) panel.
        const offscreenOffset = () => {
          const unit = mark.clientWidth / VIEWBOX_SIZE;
          return panel.clientWidth / 2 / unit + SHAPE_EXTENT;
        };

        // Ring and disc mirror each other around the mark's center.
        const orbit = { angle: APPROACH_ANGLE, radius: ORBIT_RADIUS };
        const place = () => {
          const dx = Math.cos(orbit.angle) * orbit.radius;
          const dy = Math.sin(orbit.angle) * orbit.radius;
          gsap.set(ring, { x: dx - HOME_OFFSET, y: dy });
          gsap.set(disc, { x: HOME_OFFSET - dx, y: -dy });
        };

        const timeline = gsap
          .timeline({ repeat: -1, repeatDelay: LOOP_PAUSE })
          // 1. Get-together
          .fromTo(
            ring,
            { x: offscreenOffset, y: -APPROACH_LIFT },
            {
              x: APPROACH_X - HOME_OFFSET,
              // Repeated in the to-vars so every loop resets the height.
              y: -APPROACH_LIFT,
              duration: ENTER_DURATION,
              ease: 'power2.in',
            },
          )
          .fromTo(
            disc,
            { x: () => -offscreenOffset(), y: APPROACH_LIFT },
            {
              x: HOME_OFFSET - APPROACH_X,
              y: APPROACH_LIFT,
              duration: ENTER_DURATION,
              ease: 'power2.in',
            },
            '<',
          )
          // 2. Converse
          .fromTo(
            orbit,
            { angle: APPROACH_ANGLE, radius: ORBIT_RADIUS },
            {
              angle: ORBIT_TURNS * 2 * Math.PI,
              radius: ORBIT_RADIUS,
              duration: ORBIT_DURATION,
              ease: 'sine.out',
              onUpdate: place,
            },
          )
          .to(
            orbit,
            {
              radius: HOME_OFFSET,
              duration: SETTLE_DURATION,
              ease: 'power1.out',
              onUpdate: place,
            },
            `>-${String(SETTLE_DURATION)}`,
          )
          // 3. Match
          .to(mark, {
            scale: PRESS_SCALE,
            duration: PRESS_DURATION,
            ease: 'power2.in',
          })
          .to(mark, {
            scale: 1,
            duration: RELEASE_DURATION,
            ease: 'back.out(4)',
          })
          // 4. Clean-up
          .to(
            mark,
            {
              scale: EXIT_SCALE,
              opacity: 0,
              duration: EXIT_DURATION,
              ease: 'power2.in',
            },
            `+=${String(MATCH_HOLD)}`,
          );

        const observer = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) {
            timeline.play();
          } else {
            timeline.pause();
          }
        });
        observer.observe(mark);

        return () => {
          observer.disconnect();
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: container },
  );

  return (
    <span ref={container} className={cn('inline-flex', className)}>
      <LogoMark tone="on-highlight" className="size-full overflow-visible" />
    </span>
  );
}
