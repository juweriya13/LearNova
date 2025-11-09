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
  User,
  History,
  Brain,
} from 'lucide-react';

export const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/braingame', label: 'Brain Game', icon: Brain },
  { href: '/dashboard/quiz', label: 'Start Quiz', icon: HelpCircle },
  { href: '/dashboard/tutor', label: 'AI Tutor', icon: MessageSquare },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Lightbulb },
  { href: '/dashboard/history', label: 'Quiz History', icon: History },
];

export const dashboardStats = [
  { title: 'Daily Streak', value: '0 Days', icon: Flame, color: 'text-amber-500' },
  { title: 'Points Earned', value: '0', icon: Award, color: 'text-violet-500' },
  { title: 'Quizzes Taken', value: '0', icon: HelpCircle, color: 'text-sky-500' },
  { title: 'Highest Score', value: '0%', icon: Target, color: 'text-emerald-500' },
];

export const subjects = [
  { name: 'Mathematics', progress: 0, icon: BrainCircuit },
  { name: 'History', progress: 0, icon: BookOpen },
  { name: 'Science', progress: 0, icon: BrainCircuit },
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
  id: string;
  name: string;
  totalScore: number;
  qualificationId: string;
};

export const qualificationLevels = [
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', 
  '7th Grade', '8th Grade', '9th Grade', '10th Grade', 'College', 'University', 'Other'
];

export const publicNavLinks = [
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/signup', label: 'Sign Up', icon: LogIn },
];

export const gameIcons = [
  'Cat', 'Dog', 'Rabbit', 'Bear', 'Fox', 'Panda', 'Koala', 'Lion'
];
