import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  title: string;
  action?: { label: string; href: string };
  children: ReactNode;
  className?: string;
}

export function HomeCard({
  title,
  action,
  children,
  className,
}: HomeCardProps) {
  return (
    <Card
      className={cn(
        'gap-4 rounded-tile bg-surface py-7 text-base text-ink ring-line',
        className,
      )}
    >
      <CardHeader className="items-center px-7">
        <CardTitle className="font-sans text-xl leading-7 font-normal">
          <h2>{title}</h2>
        </CardTitle>
        {action && (
          <CardAction className="self-center">
            <Link
              href={action.href}
              className="text-[13px] font-semibold text-ink hover:text-highlight"
            >
              {action.label}
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-7">
        {children}
      </CardContent>
    </Card>
  );
}
