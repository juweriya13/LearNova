'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { Home } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { qualificationLevels } from '@/lib/data';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      // If user is logged in, they should have a profile, go to dashboard
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!auth || !firestore) {
        setError("Auth service not available");
        return;
    }
    if (!qualification) {
        setError("Please select a qualification.");
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Store user profile in Firestore
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        id: userCredential.user.uid,
        name: name,
        email: userCredential.user.email,
        qualificationId: qualification,
      });

      // The useEffect will catch the user creation and redirect to dashboard
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError(null);
    if (!auth) {
        setError("Auth service not available");
        return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // After Google signin, they need to be treated as a new user who needs a profile
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isUserLoading || user) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Logo className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
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
            <Button type="submit" className="w-full" disabled={!name || !email || !password || !qualification}>
              Sign Up
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} type="button">
              Sign up with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
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
