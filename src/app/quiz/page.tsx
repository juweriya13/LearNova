import QuizClient from '@/components/QuizClient';

export const metadata = {
  title: 'Adaptive Quiz | LearnVerse AI',
  description: 'Test your knowledge with our adaptive quiz system.',
};

export default function QuizPage() {
  return (
    <div>
      <QuizClient />
    </div>
  );
}
