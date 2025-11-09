'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useUser, useDoc, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Home, Pencil, Upload } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { qualificationLevels } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc(userProfileRef);

  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
        setPhotoURL(user.photoURL || '');
    }
    if (userProfile) {
      setName(userProfile.name || '');
      setQualification(userProfile.qualificationId || '');
    }
  }, [user, userProfile]);

  const handleUpdateProfile = async () => {
    if (!user || !auth || !firestore) return;
    setIsSaving(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await updateProfile(user, {
            displayName: name,
            photoURL: photoURL
        });
        await updateDoc(userDocRef, { 
            name: name,
            qualificationId: qualification 
        });
        toast({
            title: 'Profile Updated',
            description: 'Your profile has been successfully updated.',
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, you would upload the file to a service like Firebase Storage
    // and get a URL. For this prototype, we'll simulate it with a placeholder.
    if (event.target.files && event.target.files[0]) {
        const seed = Math.random().toString(36).substring(7);
        setPhotoURL(`https://picsum.photos/seed/${seed}/200/200`);
    }
  };
  
  const handleCancel = () => {
    if(userProfile){
        setName(userProfile.name || '');
        setQualification(userProfile.qualificationId || '');
    }
    if (user) {
        setPhotoURL(user.photoURL || '');
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
        ) : profileError ? (
            <p className="text-destructive">Error loading profile.</p>
        ): (
            <>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={photoURL} alt={name} data-ai-hint="person portrait" />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute bottom-0 right-0 rounded-full"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                    )}
                     <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                  </div>
                </div>

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
                     <Select onValueChange={setQualification} value={qualification} disabled={!isEditing}>
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
                 <div className="mt-6 flex justify-center border-t pt-6">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                        <Home className="mr-2 h-4 w-4" /> Go to Home
                        </Link>
                    </Button>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
