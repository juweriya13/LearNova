import TutorClient from '@/components/TutorClient';

export const metadata = {
  title: 'AI Tutor | LearnVerse AI',
  description: 'Get instant help with your studies from our AI Tutor.',
};

export default function TutorPage() {
  return (
    <div className="h-full w-full">
      <TutorClient />
    </div>
  );
}
