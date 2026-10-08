import { Logo } from './logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo className="text-ink" />
        <p>Built by a neuefische bootcamp team</p>
        <p>AI-assisted job sourcing · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
