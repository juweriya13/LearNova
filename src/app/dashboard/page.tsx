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
import { dashboardStats, subjects, badges, user } from '@/lib/data';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="grid gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s a snapshot of your learning journey. Keep up the great work!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
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
                {badges.map((badge) => (
                  <Tooltip key={badge.name}>
                    <TooltipTrigger>
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={cn(
                            'flex h-16 w-16 items-center justify-center rounded-full bg-accent/30',
                             badge.color.replace('text-', 'bg-')
                          )}
                        >
                          <badge.icon className={cn('h-8 w-8', badge.color)} />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {badge.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
