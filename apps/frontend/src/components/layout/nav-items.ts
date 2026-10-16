import { Bookmark, House, Search, UserRound } from 'lucide-react';

import {
  HOME_HREF,
  PLACEHOLDER_HREF,
  PROFILE_HREF,
  SAVED_HREF,
  SEARCH_HREF,
} from '@/lib/routes';

export const PUBLIC_NAV_ITEMS = [
  { label: 'Explore jobs', href: PLACEHOLDER_HREF },
  { label: 'How it works', href: PLACEHOLDER_HREF },
  { label: 'Pricing', href: PLACEHOLDER_HREF },
] as const;

export const APP_NAV_ITEMS = [
  { label: 'Home', href: HOME_HREF, icon: House },
  { label: 'Search', href: SEARCH_HREF, icon: Search },
  { label: 'Saved', href: SAVED_HREF, icon: Bookmark },
  { label: 'Profile', href: PROFILE_HREF, icon: UserRound },
] as const;
