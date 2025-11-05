'use client';

import { useState } from 'react';
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
import { useUser, useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}/profile`, user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [name, setName] = useState(userProfile?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  useState(() => {
    if (userProfile?.name) {
      setName(userProfile.name);
    }
  });

  const handleUpdateProfile = async () => {
    if (!user || !name) return;
    setIsSaving(true);
    const userDocRef = doc(firestore, `users/${user.uid}/profile`, user.uid);
    setDocumentNonBlocking(
        userDocRef,
        { name: name },
        { merge: true }
    );
    toast({
        title: 'Profile Updated',
        description: 'Your name has been successfully updated.',
    });
    setIsSaving(false);
  };
  
  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>View and manage your profile details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isProfileLoading ? (
            <p>Loading profile...</p>
        ) : (
            <>
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                    id="qualification"
                    value={userProfile?.qualificationId || ''}
                    disabled
                    />
                </div>
                <div>
                    <Button onClick={handleUpdateProfile} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
