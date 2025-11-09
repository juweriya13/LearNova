'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

import { collectionGroup, limit, orderBy, query, type Query, type DocumentData } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

interface LeaderboardEntry {
  id: string;
  name?: string;
  totalScore?: number;
}

const getRankColor = (rank: number) =>
  rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-foreground';

const getRankRowClass = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400/10 hover:bg-yellow-400/20';
    if (rank === 2) return 'bg-gray-400/10 hover:bg-gray-400/20';
    if (rank === 3) return 'bg-orange-400/10 hover:bg-orange-400/20';
    return '';
}

export default function LeaderboardPage() {
  const firestore = useFirestore();
  
  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collectionGroup(firestore, 'leaderboard'),
        orderBy('totalScore', 'desc'),
        limit(10)
      ) as unknown as Query<LeaderboardEntry>;
  }, [firestore]);


  const { data: leaderboardData, isLoading, error } =
    useCollection<LeaderboardEntry>(leaderboardQuery as unknown as Query<DocumentData>);

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
                <TableRow key={player.id} className={cn(getRankRowClass(rank))}>
                  <TableCell className="font-bold text-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className={cn('h-5 w-5', getRankColor(rank), rank <= 3 && 'h-6 w-6')} />
                      {rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${player.id}/40/40`} alt={player.name || 'User'} data-ai-hint="person avatar" />
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
