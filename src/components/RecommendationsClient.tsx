'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { recommendNextTopics } from '@/ai/flows/recommend-next-topics';
import type { RecommendNextTopicsOutput } from '@/ai/flows/recommend-next-topics';
import { educationLevels } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from './ui/skeleton';
import { Lightbulb, Sparkles } from 'lucide-react';

const formSchema = z.object({
  quizPerformance: z.string().min(10, 'Please provide more details about your performance.'),
  educationLevel: z.string({ required_error: 'Please select an education level.' }),
});

export default function RecommendationsClient() {
  const [recommendation, setRecommendation] = useState<RecommendNextTopicsOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quizPerformance: 'I took a quiz on "Basic Algebra" and scored 60%. I struggled with word problems involving equations.',
      educationLevel: educationLevels[0],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setRecommendation(null);
      try {
        const result = await recommendNextTopics(values);
        setRecommendation(result);
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        // Handle error display
      }
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>What&apos;s Next?</CardTitle>
          <CardDescription>
            Tell us about your recent performance, and our AI will suggest what to learn next.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="quizPerformance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Performance Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I scored 7/10 on the Mitosis quiz. I found the anaphase and telophase stages confusing."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Analyzing...' : 'Get Recommendations'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="text-primary"/>
            AI-Powered Suggestions
        </h2>
        {isPending && (
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="pt-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full mt-2" />
                         <Skeleton className="h-4 w-5/6 mt-2" />
                    </div>
                </CardContent>
            </Card>
        )}
        {recommendation && (
            <Card className="bg-accent/30 border-accent shadow-lg animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb />
                        Recommended Topics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-x-2">
                    {recommendation.recommendedTopics.split(',').map((topic, i) => (
                        <span key={i} className="inline-block bg-primary/20 text-primary-foreground rounded-full px-3 py-1 text-sm font-semibold">
                            {topic.trim()}
                        </span>
                    ))}
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Reasoning</h4>
                        <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
                    </div>
                </CardContent>
            </Card>
        )}
         {!isPending && !recommendation && (
             <div className="flex items-center justify-center text-center h-full rounded-lg border-2 border-dashed bg-card p-8">
                <p className="text-muted-foreground">Your recommendations will appear here.</p>
            </div>
         )}
      </div>
    </div>
  );
}
