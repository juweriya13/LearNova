'use client';

import { useState, useEffect } from 'react';
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
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Pencil } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.name) {
      setName(userProfile.name);
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    if (!user || !name || !firestore) return;
    setIsSaving(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await updateDoc(userDocRef, { name: name });
        toast({
            title: 'Profile Updated',
            description: 'Your name has been successfully updated.',
        });
        setIsEditing(false);
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
            variant: "destructive",
            title: 'Update Failed',
            description: 'Could not update your profile. Please try again.',
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    if(userProfile?.name){
        setName(userProfile.name);
    }
    setIsEditing(false);
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>View and manage your profile details.</CardDescription>
        </div>
        {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
            </Button>
        )}
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
                    disabled={!isEditing}
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
                {isEditing && (
                    <div className="flex space-x-2">
                        <Button onClick={handleUpdateProfile} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                         <Button variant="ghost" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                )}
            </>
        )}
      </CardContent>
    </Card>
  );
}
