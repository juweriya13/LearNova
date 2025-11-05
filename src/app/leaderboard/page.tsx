'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy, limit, Firestore } from 'firebase/firestore';
import { Trophy } from 'lucide-react';

// Define a type for your leaderboard entry based on your data structure
interface LeaderboardEntry {
  id: string;
  name?: string;
  totalScore?: number;
  // Add other fields from your leaderboard documents
}

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-orange-400';
  return 'text-foreground';
};

export default function LeaderboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // The query is memoized and will only be created when firestore is available.
  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Note: collectionGroup queries require a corresponding index in firestore.rules
    // You'll need to create a composite index in the Firebase console for this to work.
    return query(
      collectionGroup(firestore as Firestore, 'leaderboard'), 
      orderBy('totalScore', 'desc'),
      limit(10)
    );
  }, [firestore]);
  
  const { data: leaderboardData, isLoading } = useCollection<LeaderboardEntry>(leaderboardQuery);

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
            {leaderboardData && leaderboardData.map((player, index) => {
              const rank = index + 1;
              return (
                <TableRow key={player.id} className={player.id === user?.uid ? "bg-accent/50" : ""}>
                  <TableCell className="font-bold text-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className={`h-5 w-5 ${getRankColor(rank)}`} />
                      {rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${player.id}/40/40`} alt={player.name || 'User'} data-ai-hint="person portrait" />
                        <AvatarFallback>{player.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{player.totalScore?.toLocaleString() || 0}</TableCell>
                </TableRow>
              )
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
