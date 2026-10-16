'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

import { LogoMark } from './logo';

gsap.registerPlugin(useGSAP);

const VIEWBOX_SIZE = 32;
const SHAPE_EXTENT = 14;
const ENTER_DURATION = 2.2;
const POP_SCALE = 1.08;
const POP_LIFT = 1.5;
const POP_UP_DURATION = 0.18;
const POP_SETTLE_DURATION = 0.6;
const MATCH_HOLD = 1.4;
const EXIT_DURATION = 0.9;
const EXIT_SCALE = 0.92;
const LOOP_PAUSE = 0.4;

interface AnimatedLogoMarkProps {
  className?: string;
}

export function AnimatedLogoMark({ className }: AnimatedLogoMarkProps) {
  const container = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const mark = container.current;
        const panel = mark?.parentElement;
        if (!mark || !panel) {
          return;
        }

        const edgeOffset = () => {
          const unit = mark.clientWidth / VIEWBOX_SIZE;
          return panel.clientWidth / 2 / unit - SHAPE_EXTENT;
        };
        const shapes = ['[data-logo-disc]', '[data-logo-ring]'];

        const timeline = gsap
          .timeline({ repeat: -1, repeatDelay: LOOP_PAUSE })
          .fromTo(
            '[data-logo-disc]',
            { x: () => -edgeOffset(), opacity: 0 },
            { x: 0, opacity: 1, duration: ENTER_DURATION, ease: 'power2.out' },
          )
          .fromTo(
            '[data-logo-ring]',
            { x: edgeOffset, opacity: 0 },
            { x: 0, opacity: 1, duration: ENTER_DURATION, ease: 'power2.out' },
            '<',
          )
          .to(shapes, {
            scale: POP_SCALE,
            y: -POP_LIFT,
            transformOrigin: '50% 50%',
            duration: POP_UP_DURATION,
            ease: 'power2.out',
          })
          .to(shapes, {
            scale: 1,
            y: 0,
            duration: POP_SETTLE_DURATION,
            ease: 'back.out(3)',
          })
          .to(
            shapes,
            {
              opacity: 0,
              scale: EXIT_SCALE,
              duration: EXIT_DURATION,
              ease: 'power1.in',
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
