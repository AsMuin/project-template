import Demo from '@/features/demo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: Demo
});
