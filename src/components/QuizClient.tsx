'use client';

import { useState, useTransition, useEffect } from 'react';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';
import type { GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, ArrowRight, RotateCw } from 'lucide-react';
import { Progress } from './ui/progress';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, runTransaction, getDoc, addDoc } from 'firebase/firestore';

type QuizState = 'setup' | 'loading' | 'active' | 'result';
type Question = GenerateQuizQuestionsOutput['questions'][0];

interface AnsweredQuestion extends Question {
    userAnswer: string | null;
}

export default function QuizClient() {
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [topic, setTopic] = useState('Basic Algebra');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isPending, startTransition] = useTransition();

  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);
  
  const userProgressRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/progress`, user.uid) : null, [user, firestore]);
  const { data: userProgress } = useDoc(userProgressRef);

  const [educationLevel, setEducationLevel] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userProfile?.qualificationId) {
      setEducationLevel(userProfile.qualificationId);
    }
  }, [userProfile]);


  const handleStartQuiz = () => {
    if (!educationLevel) {
        console.error("Education level not set.");
        return;
    }
    startTransition(async () => {
      setQuizState('loading');
      try {
        const result = await generateQuizQuestions({
          topic,
          educationLevel,
          numberOfQuestions: 5,
        });
        setQuestions(result.questions);
        setAnsweredQuestions(result.questions.map(q => ({...q, userAnswer: null})));
        setQuizState('active');
      } catch (error) {
        console.error('Failed to generate quiz:', error);
        setQuizState('setup'); // Reset to setup on error
      }
    });
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;

    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    const updatedAnsweredQuestions = [...answeredQuestions];
    updatedAnsweredQuestions[currentQuestionIndex].userAnswer = selectedAnswer;
    setAnsweredQuestions(updatedAnsweredQuestions);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizCompletion();
      setQuizState('result');
    }
  };
  
  const handleQuizCompletion = async () => {
    if (!user || !firestore) return;

    const finalScore = score + (selectedAnswer === questions[currentQuestionIndex].correctAnswer ? 1 : 0);
    const percentage = (finalScore / questions.length) * 100;
    
    // Save the full quiz attempt
    const quizAttemptRef = collection(firestore, `users/${user.uid}/quizAttempts`);
    await addDoc(quizAttemptRef, {
        userId: user.uid,
        topic: topic,
        questions: answeredQuestions,
        score: finalScore,
        percentage: percentage,
        timestamp: serverTimestamp()
    });

    const progressRef = doc(firestore, `users/${user.uid}/progress`, user.uid);
    const subjectProgressRef = doc(firestore, `users/${user.uid}/subjectsProgress`, topic.toLowerCase().replace(/\s/g, '-'));

    try {
        await runTransaction(firestore, async (transaction) => {
            // --- READS FIRST ---
            const progressDoc = await transaction.get(progressRef);
            const subjectDoc = await transaction.get(subjectProgressRef);

            // --- WRITES SECOND ---
            if (!progressDoc.exists()) {
                // First time user is taking a quiz, create progress doc
                transaction.set(progressRef, {
                    totalQuizzes: 1,
                    totalScore: percentage,
                    averageScore: percentage,
                });
            } else {
                const data = progressDoc.data();
                const newTotalQuizzes = (data.totalQuizzes || 0) + 1;
                const newTotalScore = (data.totalScore || 0) + percentage;
                const newAverageScore = newTotalScore / newTotalQuizzes;

                transaction.update(progressRef, {
                    totalQuizzes: newTotalQuizzes,
                    averageScore: newAverageScore,
                    totalScore: newTotalScore, // Also update total score
                });
            }

            // Update subject progress
            if (!subjectDoc.exists()) {
                 transaction.set(subjectProgressRef, {
                    subjectId: topic,
                    progress: percentage,
                    lastActivity: serverTimestamp(),
                });
            } else {
                 transaction.update(subjectProgressRef, {
                    progress: percentage,
                    lastActivity: serverTimestamp(),
                });
            }
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
  };

  const restartQuiz = () => {
    setQuizState('setup');
    setQuestions([]);
    setAnsweredQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
  };

  if (quizState === 'loading') {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader><CardTitle>Generating Your Quiz...</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (quizState === 'setup') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Ready for a Challenge?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">What do you want to be quizzed on?</Label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Photosynthesis, World War II, Calculus" />
          </div>
          <div>
            <Label htmlFor="educationLevel">Education Level</Label>
            <Input id="educationLevel" value={educationLevel || 'Loading...'} disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartQuiz} disabled={isPending || !topic || !educationLevel}>
            {isPending ? 'Generating...' : 'Start Quiz'}
          </Button>
        </CardFooter>
      </Card>
      </div>
    );
  }
  
  if (quizState === 'result') {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    return (
       <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl mx-auto text-center shadow-lg">
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">You scored</p>
          <p className="text-5xl font-bold">{finalScore} / {questions.length}</p>
          <div className="space-y-2">
            <Progress value={percentage} className="w-full h-3" />
            <p className="text-xl font-medium">{percentage}%</p>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={restartQuiz}>
            <RotateCw className="mr-2" />
            Take Another Quiz
          </Button>
        </CardFooter>
      </Card>
      </div>
    );
  }


  const currentQuestion = questions[currentQuestionIndex];
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 mb-4" />
        <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
        <p className="text-lg font-medium pt-2">{currentQuestion.question}</p>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer ?? ''}
          onValueChange={setSelectedAnswer}
          disabled={isAnswered}
        >
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedAnswer;
            return (
              <Label
                key={index}
                className={`flex items-center p-4 rounded-md border-2 transition-all cursor-pointer ${
                  isAnswered && isCorrect ? 'border-green-500 bg-green-500/10' :
                  isAnswered && isSelected && !isCorrect ? 'border-red-500 bg-red-500/10' :
                  'border-border'
                }`}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <span className="ml-3 flex-1">{option}</span>
                {isAnswered && isCorrect && <CheckCircle className="text-green-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500" />}
              </Label>
            );
          })}
        </RadioGroup>
        {isAnswered && selectedAnswer !== currentQuestion.correctAnswer && (
          <Alert variant="default" className="mt-4 border-green-500 bg-green-500/10 text-green-700">
            <AlertTitle>Correct Answer</AlertTitle>
            <AlertDescription>{currentQuestion.correctAnswer}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {!isAnswered ? (
          <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>Submit</Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'} <ArrowRight className="ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
    </div>
  );
}

    