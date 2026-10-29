import { Bookmark, House, Search, UserRound } from 'lucide-react';

import {
  EXPLORE_HREF,
  HOME_HREF,
  HOW_IT_WORKS_HREF,
  PRICING_HREF,
  PROFILE_HREF,
  SAVED_HREF,
  SEARCH_HREF,
} from '@/lib/routes';

export const PUBLIC_NAV_ITEMS = [
  { label: 'Explore jobs', href: EXPLORE_HREF },
  { label: 'How it works', href: HOW_IT_WORKS_HREF },
  { label: 'Pricing', href: PRICING_HREF },
] as const;

export const APP_NAV_ITEMS = [
  { label: 'Home', href: HOME_HREF, icon: House },
  { label: 'Search', href: SEARCH_HREF, icon: Search },
  { label: 'Saved', href: SAVED_HREF, icon: Bookmark },
  { label: 'Profile', href: PROFILE_HREF, icon: UserRound },
] as const;
