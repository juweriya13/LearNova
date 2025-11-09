'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboardStats, badges } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import { BookUser, Award, HelpCircle, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { subDays, format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  const userProgressRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/progress`, user.uid) : null, [user, firestore]);
  const { data: userProgress } = useDoc(userProgressRef);
  
  const sevenDaysAgo = subDays(new Date(), 7);
  const quizAttemptsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, `users/${user.uid}/quizAttempts`), 
        where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
    );
  }, [user, firestore]);

  const { data: quizAttempts } = useCollection(quizAttemptsQuery);
  const { data: allQuizAttempts } = useCollection(useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/quizAttempts`) : null, [user, firestore]));


  const userBadgesRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/badges`) : null, [user, firestore]);
  const { data: userBadges } = useCollection(userBadgesRef);
  
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);
  const { data: subjects, isLoading: subjectsLoading } = useCollection(subjectsQuery);

  const welcomeName = userProfile?.name?.split(' ')[0] || 'Learner';

  const weeklyProgressData = useMemoFirebase(() => {
    if (!subjects || !quizAttempts) return [];
    
    return subjects.map(subject => {
        const attemptsForSubject = quizAttempts.filter(attempt => attempt.topic.toLowerCase() === subject.name.toLowerCase());
        if (attemptsForSubject.length === 0) {
            return { name: subject.name, averageScore: 0 };
        }
        const totalScore = attemptsForSubject.reduce((acc, attempt) => acc + attempt.percentage, 0);
        return {
            name: subject.name,
            averageScore: Math.round(totalScore / attemptsForSubject.length),
        };
    }).filter(item => item.averageScore > 0);

  }, [subjects, quizAttempts]);
  
  const chartConfig = {
      averageScore: {
          label: "Avg. Score",
          color: "hsl(var(--primary))",
      },
  };

  const stats = [
      { title: 'Qualification', value: userProfile?.qualificationId || 'N/A', icon: BookUser, color: dashboardStats[0].color },
      { title: 'Points Earned', value: userProgress?.totalScore ? Math.round(userProgress.totalScore) : 0, icon: Award, color: dashboardStats[1].color },
      { title: 'Quizzes Taken', value: allQuizAttempts?.length || 0, icon: HelpCircle, color: dashboardStats[2].color, href: '/dashboard/history' },
      { title: 'Average Score', value: `${userProgress?.averageScore ? Math.round(userProgress.averageScore) : 0}%`, icon: Target, color: dashboardStats[3].color },
  ];

  return (
    <div className="grid gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {welcomeName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s a snapshot of your learning journey. Keep up the great
          work!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const card = (
            <Card key={stat.title} className="shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn('h-4 w-4 text-muted-foreground', stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{stat.value}</div>
              </CardContent>
            </Card>
          );

          if (stat.href) {
            return <Link href={stat.href} key={stat.title}>{card}</Link>;
          }
          
          return card;
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>My Weekly Progress</CardTitle>
            <CardDescription>
              Your average quiz scores for the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyProgressData && weeklyProgressData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                     <BarChart accessibilityLayer data={weeklyProgressData} margin={{ top: 20, right: 20, bottom: 20, left: -20}}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                         <YAxis dataKey="averageScore" unit="%" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} domain={[0, 100]} />
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="averageScore" fill="var(--color-averageScore)" radius={4} />
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-muted-foreground">No quiz data from the last 7 days.</p>
                    <p className="text-sm text-muted-foreground mt-2">Take a quiz to see your progress!</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>My Badges</CardTitle>
            <CardDescription>Achievements you have unlocked.</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="flex flex-wrap gap-4">
                {(userBadges && userBadges.length > 0) ? (
                  userBadges.map((badgeData) => {
                    const badgeInfo = badges.find(b => b.name === badgeData.badgeName);
                    if (!badgeInfo) return null;
                    return (
                      <Tooltip key={badgeInfo.name}>
                        <TooltipTrigger>
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={cn(
                                'flex h-16 w-16 items-center justify-center rounded-full bg-accent/30',
                                badgeInfo.color.replace('text-', 'bg-')
                              )}
                            >
                              <badgeInfo.icon className={cn('h-8 w-8', badgeInfo.color)} />
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">{badgeInfo.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {badgeInfo.description}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">No badges earned yet.</p>
                )}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    