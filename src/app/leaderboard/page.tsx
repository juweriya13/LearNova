import Image from 'next/image';
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
import { leaderboardData, LeaderboardEntry } from '@/lib/data';
import { Trophy } from 'lucide-react';

export const metadata = {
  title: 'Leaderboard | LearnVerse AI',
  description: 'See how you rank against other learners.',
};

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-orange-400';
  return 'text-foreground';
};

export default function LeaderboardPage() {
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
              <TableHead className="text-right">Badges</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((player: LeaderboardEntry) => (
              <TableRow key={player.rank} className={player.name === "Alex Doe" ? "bg-accent/50" : ""}>
                <TableCell className="font-bold text-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className={`h-5 w-5 ${getRankColor(player.rank)}`} />
                    {player.rank}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{player.score.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{player.badges}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
