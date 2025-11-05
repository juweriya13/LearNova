'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { collectionGroup, limit, orderBy, query, type Query, type DocumentData } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { useCollection } from '@/firebase/firestore/use-collection'; // ✅ direct import of the hook (no barrel)

// If you already have a config file, import from there instead:
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

function getDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

interface LeaderboardEntry {
  id: string;
  name?: string;
  totalScore?: number;
}

const getRankColor = (rank: number) =>
  rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-foreground';

export default function LeaderboardPage() {
  const [qRef, setQRef] = useState<Query<LeaderboardEntry> | null>(null);

  useEffect(() => {
    const db = getDb();
    const q = query(
      collectionGroup(db, 'leaderboard'),
      orderBy('totalScore', 'desc'),
      limit(10)
    ) as unknown as Query<LeaderboardEntry>;
    setQRef(q);
  }, []);

  const { data: leaderboardData, isLoading, error } =
    useCollection<LeaderboardEntry>(qRef as unknown as Query<DocumentData>);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Global Leaderboard</CardTitle>
        <CardDescription>See who is at the top of their game.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Loading leaderboard...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-red-500">{error.message}</TableCell>
              </TableRow>
            )}
            {leaderboardData?.map((player, i) => {
              const rank = i + 1;
              return (
                <TableRow key={player.id}>
                  <TableCell className="font-bold text-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className={`h-5 w-5 ${getRankColor(rank)}`} />
                      {rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${player.id}/40/40`} alt={player.name || 'User'} />
                        <AvatarFallback>{player.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{player.name || 'Anonymous Player'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{player.totalScore?.toLocaleString() || 0}</TableCell>
                </TableRow>
              );
            })}
            {!isLoading && (!leaderboardData || leaderboardData.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No players on the leaderboard yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
