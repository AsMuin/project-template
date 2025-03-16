import { auth } from '@/lib/auth';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (session) {
        redirect('/');
    }

    return (
        <main className="auth-container">
            <section className="auth-form">
                <div className="auth-box">
                    <div className="flex gap-3">
                        <Image src="/icons/logo.svg" style={{ width: 'auto', height: 'auto' }} alt="logo" width={37} height={37} />
                        <h1 className="text-2xl font-semibold text-white">WoodBook</h1>
                    </div>
                    <div>{children}</div>
                </div>
            </section>
            <section className="auth-illustration">
                <Image src="/images/auth-illustration.png" alt="auth-illustration" height={1000} width={1000} className="size-full object-cover" />
            </section>
        </main>
    );
}
