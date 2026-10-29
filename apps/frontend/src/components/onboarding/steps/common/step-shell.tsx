'use client';

import { CornerDownLeft } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { OnboardingCard } from '../../onboarding-card';

interface StepShellProps {
  tag: string;
  title: string;
  number?: number;
  subtitle?: string;
  children?: ReactNode;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  secondaryAction?: ReactNode;
}

export function StepShell({
  tag,
  title,
  number,
  subtitle,
  children,
  nextLabel = 'OK',
  nextDisabled = false,
  onNext,
  onSkip,
  onBack,
  secondaryAction,
}: StepShellProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Each step mounts its own shell: move focus to the new question unless a
  // field inside the card already took it (autoFocus).
  useEffect(() => {
    if (!cardRef.current?.contains(document.activeElement)) {
      headingRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter' && !event.shiftKey && !nextDisabled) {
        event.preventDefault();
        onNext();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextDisabled, onNext]);

  return (
    <OnboardingCard ref={cardRef} className="space-y-8">
      <Badge variant="outline" className="h-7 gap-2 rounded-pill px-3 text-ink">
        <LogoMark className="size-4" />
        {tag}
      </Badge>

      <div className="space-y-3">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-3xl text-ink outline-none sm:text-4xl"
        >
          {number !== undefined && (
            <span className="mr-3 align-middle text-lg text-highlight">
              {number} →
            </span>
          )}
          {title}
        </h1>
        {subtitle !== undefined && <p className="text-ink-muted">{subtitle}</p>}
      </div>

      {children}

      <div className="flex flex-wrap items-center gap-4">
        {onBack && (
          <Button variant="ghost" className="rounded-pill" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          className="rounded-pill px-6"
          disabled={nextDisabled}
          onClick={onNext}
        >
          {nextLabel}
          <CornerDownLeft data-icon="inline-end" />
        </Button>
        <span className="text-sm text-ink-muted">
          press <strong className="text-ink">Enter ↵</strong>
        </span>
        {onSkip && (
          <Button
            variant="ghost"
            className="ml-auto rounded-pill text-ink-muted"
            onClick={onSkip}
          >
            Skip for now
          </Button>
        )}
        {secondaryAction !== undefined && (
          <div className="ml-auto">{secondaryAction}</div>
        )}
      </div>
    </OnboardingCard>
  );
}
