
'use client';

import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';

interface QuizAttempt {
  id: string;
  topic: string;
  score: number;
  percentage: number;
  timestamp: {
    toDate: () => Date;
  };
  questions: any[];
}

export default function QuizHistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const quizAttemptsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/quizAttempts`), orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: quizAttempts, isLoading } = useCollection<QuizAttempt>(quizAttemptsQuery);

  const getScoreVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <History className="h-6 w-6" />
          <div>
            <CardTitle>Quiz History</CardTitle>
            <CardDescription>Review your past quiz attempts and performance.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-16 mx-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && quizAttempts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  You haven&apos;t taken any quizzes yet.
                </TableCell>
              </TableRow>
            )}
            {quizAttempts?.map((attempt) => (
              <TableRow key={attempt.id} className="hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium">
                   <Link href={`/dashboard/history/${attempt.id}`} className="hover:underline">
                    {attempt.topic}
                   </Link>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getScoreVariant(attempt.percentage)}>
                    {attempt.score} / {attempt.questions.length} ({Math.round(attempt.percentage)}%)
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {attempt.timestamp ? formatDistanceToNow(attempt.timestamp.toDate(), { addSuffix: true }) : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
