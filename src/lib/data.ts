import {
  LayoutDashboard,
  HelpCircle,
  MessageSquare,
  Trophy,
  Lightbulb,
  Award,
  Flame,
  BookOpen,
  BrainCircuit,
  Target,
  type LucideIcon,
  LogIn,
} from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

export const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/quiz', label: 'Start Quiz', icon: HelpCircle },
  { href: '/tutor', label: 'AI Tutor', icon: MessageSquare },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/recommendations', label: 'Recommendations', icon: Lightbulb },
];

export const user = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatar: 'user-avatar',
};

export const dashboardStats = [
  { title: 'Daily Streak', value: '5 Days', icon: Flame, color: 'text-amber-500' },
  { title: 'Points Earned', value: '1,250', icon: Award, color: 'text-violet-500' },
  { title: 'Quizzes Taken', value: '23', icon: HelpCircle, color: 'text-sky-500' },
  { title: 'Highest Score', value: '98%', icon: Target, color: 'text-emerald-500' },
];

export const subjects = [
  { name: 'Mathematics', progress: 75, icon: BrainCircuit },
  { name: 'History', progress: 60, icon: BookOpen },
  { name: 'Science', progress: 85, icon: BrainCircuit },
];

type Badge = {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export const badges: Badge[] = [
  { name: 'Perfect Score', description: 'Achieve 100% on a quiz', icon: Target, color: 'text-emerald-500' },
  { name: 'Quiz Master', description: 'Complete 10 quizzes', icon: Award, color: 'text-sky-500' },
  { name: 'Hot Streak', description: 'Maintain a 5-day streak', icon: Flame, color: 'text-amber-500' },
  { name: 'Curious Mind', description: 'Use the AI Tutor 5 times', icon: Lightbulb, color: 'text-violet-500' },
  { name: 'Top Learner', description: 'Reach the top 10 on the leaderboard', icon: Trophy, color: 'text-yellow-500' },
];

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  badges: number;
  avatar: string;
};

const userAvatar = PlaceHolderImages.find((img) => img.id === user.avatar);

export const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'Elena', score: 2500, badges: 5, avatar: 'https://picsum.photos/seed/101/40/40' },
  { rank: 2, name: 'Marcus', score: 2350, badges: 4, avatar: 'https://picsum.photos/seed/102/40/40' },
  { rank: 3, name: 'Chloe', score: 2200, badges: 4, avatar: 'https://picsum.photos/seed/103/40/40' },
  { rank: 4, name: 'Alex Doe', score: 1250, badges: 2, avatar: userAvatar?.imageUrl ?? 'https://picsum.photos/seed/1/40/40' },
  { rank: 5, name: 'Jasmine', score: 1100, badges: 2, avatar: 'https://picsum.photos/seed/104/40/40' },
  { rank: 6, name: 'Kenji', score: 950, badges: 1, avatar: 'https://picsum.photos/seed/105/40/40' },
  { rank: 7, name: 'Fatima', score: 800, badges: 1, avatar: 'https://picsum.photos/seed/106/40/40' },
  { rank: 8, name: 'Leo', score: 750, badges: 1, avatar: 'https://picsum.photos/seed/107/40/40' },
];

export const qualificationLevels = [
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', 
  '7th Grade', '8th Grade', '9th Grade', '10th Grade', 'College', 'University', 'Other'
];

export const educationLevels = qualificationLevels;

export const publicNavLinks = [
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/signup', label: 'Sign Up', icon: LogIn },
];
