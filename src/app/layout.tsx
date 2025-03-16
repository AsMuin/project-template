import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import Script from 'next/script';

const ibmPlexSans = localFont({
    src: [
        {
            path: '/fonts/IBMPlexSans-Regular.ttf',
            weight: '400',
            style: 'normal'
        },
        {
            path: '/fonts/IBMPlexSans-Medium.ttf',
            weight: '500',
            style: 'normal'
        },
        {
            path: '/fonts/IBMPlexSans-SemiBold.ttf',
            weight: '600',
            style: 'normal'
        },
        {
            path: '/fonts/IBMPlexSans-Bold.ttf',
            weight: '700',
            style: 'normal'
        }
    ]
});
const bebasNeue = localFont({
    src: [
        {
            path: '/fonts/BebasNeue-Regular.ttf',
            weight: '400',
            style: 'normal'
        }
    ],
    variable: '--bebas-neue'
});

export const metadata: Metadata = {
    title: 'WoodBook',
    description: 'WoodBook is a book lending platform that connects readers with book lovers.'
};

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>{process.env.NODE_ENV === 'development' && <Script src="https://unpkg.com/react-scan/dist/auto.global.js"></Script>}</head>
            <body className={`${ibmPlexSans.className} ${bebasNeue.variable} antialiased`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
