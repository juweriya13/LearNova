'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboardStats, subjects, badges } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/profile`, 'data') : null, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  const userProgressRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/progress`, 'data') : null, [user, firestore]);
  const { data: userProgress } = useDoc(userProgressRef);

  const userBadgesRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/badges`) : null, [user, firestore]);
  const { data: userBadges } = useCollection(userBadgesRef);

  const welcomeName = userProfile?.name?.split(' ')[0] || 'Learner';

  const stats = [
      { title: 'Points Earned', value: userProgress?.totalScore || 0, icon: dashboardStats[1].icon, color: dashboardStats[1].color },
      { title: 'Quizzes Taken', value: userProgress?.totalQuizzes || 0, icon: dashboardStats[2].icon, color: dashboardStats[2].color },
      { title: 'Average Score', value: `${userProgress?.averageScore || 0}%`, icon: dashboardStats[3].icon, color: dashboardStats[3].color },
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn('h-4 w-4 text-muted-foreground', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>My Progress</CardTitle>
            <CardDescription>
              Your progress in different subjects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {subjects.map((subject) => (
              <div key={subject.name} className="space-y-2">
                <div className="flex justify-between">
                  <p className="font-medium">{subject.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {subject.progress}%
                  </p>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            ))}
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
