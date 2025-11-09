'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Gamepad2, Brain, Timer, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gameIcons, qualificationLevels } from '@/lib/data';
import { isToday } from 'date-fns';

type CardData = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type GameState = 'setup' | 'playing' | 'finished' | 'played';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const getDifficulty = (qualificationId?: string): Difficulty => {
    if (!qualificationId) return 'Medium';
    const index = qualificationLevels.indexOf(qualificationId);
    if (index < 5) return 'Easy'; // Grades 1-5
    if (index < 10) return 'Medium'; // Grades 6-10
    return 'Hard'; // College, University, Other
};

const getGridConfig = (difficulty: Difficulty) => {
    switch (difficulty) {
        case 'Easy': return { pairs: 6, gridCols: 'grid-cols-4' }; // 4x3 grid
        case 'Medium': return { pairs: 8, gridCols: 'grid-cols-4' }; // 4x4 grid
        case 'Hard': return { pairs: 10, gridCols: 'grid-cols-5' }; // 5x4 grid
        default: return { pairs: 8, gridCols: 'grid-cols-4' };
    }
}

const generateCards = (difficulty: Difficulty): CardData[] => {
  const { pairs } = getGridConfig(difficulty);
  const icons = gameIcons.slice(0, pairs);
  const allIcons = [...icons, ...icons];
  const shuffledIcons = allIcons.sort(() => Math.random() - 0.5);
  return shuffledIcons.map((icon, index) => ({
    id: index,
    icon,
    isFlipped: false,
    isMatched: false,
  }));
};

export default function BrainGame() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);
  
  const gameAttemptRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}/dailyGames/brainGame`) : null), [user, firestore]);
  const { data: gameAttempt, isLoading: isAttemptLoading } = useDoc(gameAttemptRef);

  const difficulty = useMemo(() => getDifficulty(userProfile?.qualificationId), [userProfile]);

  useEffect(() => {
    if (isAttemptLoading) return;
    if (gameAttempt && gameAttempt.lastPlayed && isToday(gameAttempt.lastPlayed.toDate())) {
      setGameState('played');
    } else {
      setGameState('setup');
    }
  }, [gameAttempt, isAttemptLoading]);
  
  useEffect(() => {
    if (gameState === 'playing' && flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.icon === secondCard.icon) {
        setCards(prev =>
          prev.map(card =>
            card.icon === firstCard.icon ? { ...card, isMatched: true } : card
          )
        );
        setFlippedCards([]);
      } else {
        const timeout = setTimeout(() => {
          setCards(prev =>
            prev.map((card, index) =>
              index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && cards.length > 0 && cards.every(card => card.isMatched)) {
      const finalScore = Math.max(1000 - timer * 5 - moves * 10, 0);
      setScore(finalScore);
      setGameState('finished');
      handleGameEnd(finalScore);
    }
  }, [cards, gameState, timer, moves]);

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isFlipped) return;

    setCards(prev =>
      prev.map((card, i) => (i === index ? { ...card, isFlipped: true } : card))
    );

    setFlippedCards(prev => [...prev, index]);

    if (flippedCards.length === 0) {
      setMoves(moves + 1);
    }
  };

  const handleGameEnd = async (finalScore: number) => {
    if (!user || !firestore) return;
    const leaderboardRef = doc(firestore, `leaderboard/brainGame/players`, user.uid);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const leaderboardDoc = await transaction.get(leaderboardRef);
            const currentHighScore = leaderboardDoc.exists() ? leaderboardDoc.data().totalScore : 0;
            
            if (finalScore > currentHighScore) {
                 transaction.set(leaderboardRef, {
                    name: user.displayName || 'Anonymous',
                    totalScore: finalScore,
                    lastUpdated: serverTimestamp(),
                 }, { merge: true });
            }

            if(gameAttemptRef) {
                transaction.set(gameAttemptRef, {
                    lastPlayed: serverTimestamp(),
                    lastScore: finalScore,
                    highScore: finalScore > (gameAttempt?.highScore || 0) ? finalScore : (gameAttempt?.highScore || 0),
                }, { merge: true });
            }
        });
    } catch (e) {
        console.error("Game end transaction failed: ", e);
    }
  };

  const startGame = () => {
    setCards(generateCards(difficulty));
    setMoves(0);
    setTimer(0);
    setScore(0);
    setFlippedCards([]);
    setGameState('playing');
  };

  const { gridCols } = getGridConfig(difficulty);

  if (isAttemptLoading) {
      return <div className="flex items-center justify-center h-full"><p>Loading Game...</p></div>
  }

  if (gameState === 'played') {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md mx-auto text-center shadow-lg">
          <CardHeader>
            <CardTitle>Come Back Tomorrow!</CardTitle>
            <CardDescription>You have already played the brain game today.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your last score was {gameAttempt?.lastScore || 0}. Your high score is {gameAttempt?.highScore || 0}.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'setup') {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md mx-auto text-center shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4 text-primary"><Brain size={48} /></div>
            <CardTitle>Memory Brain Game</CardTitle>
            <CardDescription>Match the pairs of cards as quickly as you can. You can only play once a day! Your difficulty is set to <span className="font-bold">{difficulty}</span>.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={startGame} size="lg">
              <Gamepad2 className="mr-2"/>
              Start Playing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
        <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md mx-auto text-center shadow-lg">
          <CardHeader>
             <div className="flex justify-center mb-4 text-yellow-400"><Star size={48} /></div>
            <CardTitle>Game Over!</CardTitle>
            <CardDescription>You completed the game.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-4xl font-bold">{score}</p>
             <p className="text-muted-foreground">You finished in {timer} seconds with {moves} moves.</p>
             <Button onClick={() => setGameState('played')}>
                <Check className="mr-2" />
                Done
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Brain/> Memory Game</h1>
        <div className="flex gap-4 text-lg">
            <div className="flex items-center gap-2"><Timer /> {timer}s</div>
            <div className="flex items-center gap-2">Moves: {moves}</div>
        </div>
      </div>
      <div className={cn("grid gap-4", gridCols)}>
        {cards.map((card, index) => (
          <div key={index} className="aspect-square" onClick={() => handleCardClick(index)}>
            <div
              className={cn(
                'w-full h-full rounded-lg flex items-center justify-center text-4xl transition-transform duration-500 [transform-style:preserve-3d]',
                card.isFlipped ? '[transform:rotateY(180deg)]' : ''
              )}
            >
              <div className="absolute w-full h-full bg-secondary rounded-lg flex items-center justify-center [backface-visibility:hidden]">
                 <Gamepad2 className="text-muted-foreground"/>
              </div>
              <div
                className={cn(
                  'absolute w-full h-full rounded-lg flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]',
                  card.isMatched ? 'bg-green-500/20 border-2 border-green-500' : 'bg-primary/20'
                )}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
