'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { provideAITutorAssistance } from '@/ai/flows/ai-tutor-assistance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TutorClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
        role: 'assistant',
        content: "Hello! I'm your AI Tutor. Ask me anything about your studies, and I'll do my best to help you learn."
    }
  ]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    // This is a more reliable way to scroll to the bottom of the scroll area.
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userProfile?.qualificationId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      try {
        const response = await provideAITutorAssistance({
          question: input,
          educationLevel: userProfile.qualificationId,
        });
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.answer + (response.explanation ? `\n\n**Explanation:** ${response.explanation}` : ''),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('AI Tutor error:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    });
  };

  if (isProfileLoading) {
    return <div className="flex items-center justify-center h-full"><p>Loading Tutor...</p></div>
  }

  return (
    <Card className="w-full max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary"/>
            AI Tutor
        </CardTitle>
        <CardDescription>
            Get instant help with your studies. Your tutor is tailored for: <span className="font-semibold">{userProfile?.qualificationId || 'your level'}.</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-6 pr-4">
            {messages.map((message, index) => (
                <div
                key={index}
                className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                >
                {message.role === 'assistant' && (
                    <Avatar className="h-9 w-9 border">
                    <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={cn(
                    'max-w-md rounded-lg p-3 text-sm whitespace-pre-wrap',
                    message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                >
                    {message.content}
                </div>
                {message.role === 'user' && (
                    <Avatar className="h-9 w-9 border">
                    <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                )}
                </div>
            ))}
            {isPending && (
                <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-9 w-9 border">
                    <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-md rounded-lg p-3 bg-muted space-y-2 w-full">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            )}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your studies..."
            disabled={isPending || !userProfile?.qualificationId}
            autoComplete="off"
          />
          <Button type="submit" disabled={isPending || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
