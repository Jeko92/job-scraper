export type PageWindowItem = number | 'ellipsis';

/** Pages shown on each side of the current one. */
const PAGE_SIBLINGS = 1;

/**
 * Page numbers to show: first, last, and the current page with its
 * neighbours; longer gaps become an ellipsis. Page 6 of 20 gives
 * `[1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]`.
 */
export function getPageWindow(
  page: number,
  totalPages: number,
): PageWindowItem[] {
  if (totalPages < 1) {
    return [];
  }
  const pages = new Set([1, totalPages]);
  for (let near = page - PAGE_SIBLINGS; near <= page + PAGE_SIBLINGS; near++) {
    if (near >= 1 && near <= totalPages) {
      pages.add(near);
    }
  }

  const items: PageWindowItem[] = [];
  let previous = 0;
  for (const current of [...pages].sort((a, b) => a - b)) {
    if (current - previous === 2) {
      // A gap of one page shows that page instead of an ellipsis.
      items.push(previous + 1);
    } else if (current - previous > 2) {
      items.push('ellipsis');
    }
    items.push(current);
    previous = current;
  }
  return items;
}
