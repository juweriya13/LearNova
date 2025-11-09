import { UserNav } from '@/components/UserNav';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/lib/data';
import { Button } from './ui/button';
import Link from 'next/link';
import { Logo } from './icons';

export function Header({ pageTitle }: { pageTitle?: string }) {
  const pathname = usePathname();
  const title =
    pageTitle ??
    navLinks.find((link) => link.href === pathname)?.label ??
    'LearnVerse AI';

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo className="h-6 w-6" />
            <span className="sr-only">LearnVerse AI</span>
          </Link>
          {navLinks.map((link) => (
             <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-foreground ${pathname === link.href ? 'text-foreground' : 'text-muted-foreground'}`}
            >
                {link.label}
            </Link>
          ))}
        </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Search can be added here if needed */}
        </div>
        <UserNav />
      </div>
    </header>
  );
}
