import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/UserNav';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/lib/data';

export function Header({ pageTitle }: { pageTitle?: string }) {
  const pathname = usePathname();
  const title =
    pageTitle ??
    navLinks.find((link) => link.href === pathname)?.label ??
    'LearnVerse AI';

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card/50 px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
      </div>
      <UserNav />
    </header>
  );
}
