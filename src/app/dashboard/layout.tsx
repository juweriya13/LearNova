'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { navLinks } from '@/lib/data';
import { Header } from '@/components/Header';
import { LogOut, Settings } from 'lucide-react';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { doc } from 'firebase/firestore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (!isUserLoading && !user && !isAuthPage) {
      router.push('/login');
    }
    
    // With onboarding removed, we check for profile on Google Sign-In
    // and redirect to a simplified onboarding if needed.
    if (user && !isUserLoading && !isProfileLoading && !userProfile?.qualificationId && auth?.currentUser?.providerData[0].providerId === 'google.com' ) {
        router.push('/onboarding');
    }

  }, [user, isUserLoading, router, userProfile, isProfileLoading, pathname, auth]);

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/login');
    }
  };
  
  if (isUserLoading || !user || (isProfileLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-7 text-primary" />
            <span className="text-lg font-semibold">LearnVerse AI</span>
          </div>
        </SidebarHeader>
        <SidebarMenu className="flex-1">
          {navLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  className="w-full"
                  tooltip={link.label}
                >
                  <link.icon className="size-5" />
                  <span className="w-full">{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="size-5" />
                  <span className="w-full">Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                  <LogOut className="size-5" />
                  <span className="w-full">Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
