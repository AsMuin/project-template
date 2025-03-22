import { auth } from '@/lib/config/auth';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (session) {
        redirect('/');
    }

    return <main>{children}</main>;
}
