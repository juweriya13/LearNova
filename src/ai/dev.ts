import { config } from 'dotenv';
config();

import '@/ai/flows/ai-tutor-assistance.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/recommend-next-topics.ts';