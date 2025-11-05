'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import React, { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { qualificationLevels } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [qualification, setQualification] = useState('');
  const [error, setError] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (!isProfileLoading && userProfile?.qualificationId) {
        router.push('/dashboard');
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);


  const handleSaveQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualification) {
      setError('Please select your qualification.');
      return;
    }
    if (!user) {
      setError('You must be logged in to save your qualification.');
      return;
    }
    setError(null);
    
    if (!firestore) {
        setError('Firestore not available');
        return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await setDoc(userDocRef, {
            id: user.uid,
            name: user.displayName || 'Anonymous User',
            email: user.email,
            qualificationId: qualification,
        }, { merge: true });

        const qualificationDocRef = doc(firestore, 'qualifications', qualification);
        await setDoc(qualificationDocRef, {
            id: qualification,
            level: qualification,
        }, { merge: true });

        router.push('/dashboard');
    } catch (error) {
        console.error("Error saving qualification: ", error);
        setError("Could not save your qualification. Please try again.");
    }
  };

  if (isUserLoading || isProfileLoading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  }
  
  if (!user) {
     return <div className="flex min-h-screen items-center justify-center"><p>Redirecting...</p></div>;
  }

  if (userProfile?.qualificationId) {
     return <div className="flex min-h-screen items-center justify-center"><p>Redirecting...</p></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Logo className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">One Last Step</CardTitle>
          <CardDescription>
            Please select your qualification to personalize your learning experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
          <form onSubmit={handleSaveQualification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Select onValueChange={setQualification} value={qualification}>
                <SelectTrigger id="qualification">
                  <SelectValue placeholder="Select your qualification" />
                </SelectTrigger>
                <SelectContent>
                  {qualificationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={!qualification}>
              Continue to Dashboard
            </Button>
          </form>
           <div className="mt-4 flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" /> Go to Home
                </Link>
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
