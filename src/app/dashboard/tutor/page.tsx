import TutorClient from '@/components/TutorClient';

export const metadata = {
  title: 'AI Tutor | LearNova',
  description: 'Get instant help with your studies from our AI Tutor.',
};

export default function TutorPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <TutorClient />
    </div>
  );
}
