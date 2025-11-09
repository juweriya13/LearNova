
'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionAttempt {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
}

interface QuizAttempt {
  id: string;
  topic: string;
  score: number;
  percentage: number;
  timestamp: {
    toDate: () => Date;
  };
  questions: QuestionAttempt[];
}

export default function QuizAttemptDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const router = useRouter();
  const { attemptId } = params;

  const attemptRef = useMemoFirebase(() => {
    if (!user || !attemptId) return null;
    return doc(firestore, `users/${user.uid}/quizAttempts/${attemptId}`);
  }, [user, firestore, attemptId]);

  const { data: attempt, isLoading } = useDoc<QuizAttempt>(attemptRef);

  const getScoreVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  };
  
  if (isLoading) {
      return (
          <div className="space-y-6">
             <Skeleton className="h-10 w-1/2"/>
             <Skeleton className="h-6 w-1/4"/>
             <div className="space-y-4">
                <Skeleton className="h-24 w-full"/>
                <Skeleton className="h-24 w-full"/>
                <Skeleton className="h-24 w-full"/>
             </div>
          </div>
      )
  }

  if (!attempt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attempt Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The quiz attempt you are looking for does not exist or could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{attempt.topic}</CardTitle>
              <CardDescription>
                Taken on {format(attempt.timestamp.toDate(), 'MMMM d, yyyy HH:mm')}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Final Score</p>
               <Badge variant={getScoreVariant(attempt.percentage)} className="text-lg">
                {attempt.score} / {attempt.questions.length} ({Math.round(attempt.percentage)}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {attempt.questions.map((q, index) => (
            <div key={index} className="border-b pb-6 last:border-b-0">
              <p className="font-semibold mb-3">
                {index + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((option, i) => {
                  const isUserAnswer = q.userAnswer === option;
                  const isCorrectAnswer = q.correctAnswer === option;
                  const isIncorrectUserAnswer = isUserAnswer && !isCorrectAnswer;

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-md p-3 text-sm
                        ${isCorrectAnswer ? 'bg-green-500/10 border-l-4 border-green-500' : ''}
                        ${isIncorrectUserAnswer ? 'bg-red-500/10 border-l-4 border-red-500' : ''}
                      `}
                    >
                      {isCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                      {isIncorrectUserAnswer && <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                      {!isCorrectAnswer && !isUserAnswer && <div className="w-5 h-5 flex-shrink-0" />}
                      {isUserAnswer && !isCorrectAnswer && !isIncorrectUserAnswer && <div className="w-5 h-5 flex-shrink-0" />}

                      <span className="flex-1">{option}</span>
                      {isUserAnswer && <Badge variant="outline">Your Answer</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
