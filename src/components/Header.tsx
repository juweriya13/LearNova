import { UserNav } from '@/components/UserNav';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/lib/data';
import Link from 'next/link';
import { Logo } from './icons';
import { cn } from '@/lib/utils';
import { History } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const visibleNavLinks = navLinks.filter(link => link.label !== 'Quiz History');

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 font-semibold"
      >
        <Logo className="h-6 w-6 text-primary" />
        <span className="hidden sm:inline">LearnVerse AI</span>
      </Link>
      <nav className="flex-1 text-center">
        <div className="hidden md:flex justify-center items-center gap-6 text-sm font-medium">
        {visibleNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'transition-colors hover:text-foreground',
              (pathname === link.href || (link.href.includes(pathname) && pathname !== '/dashboard' && !link.href.includes('braingame') && !link.href.includes('quiz')))
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground'
            )}
          >
            {link.label}
          </Link>
        ))}
        </div>
      </nav>
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
