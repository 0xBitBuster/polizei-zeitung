import { useAuthStore } from '@/stores/auth';
import { NextSeo } from 'next-seo';
import { Open_Sans } from 'next/font/google'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const openSans = Open_Sans({ 
    weight: ['300', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
    variable: '--font-open-sans'
})

function AdminLayout({ title, children }) {
    const { loading, loggedIn, init, logout } = useAuthStore();
    const router = useRouter();

    const checkForAccess = async() => {
        const isAllowed = await init();

        if (!isAllowed) {
            router.push("/admin/login")
        }
    }

    const logoutHandler = async() => {
        await logout()

        router.push("/admin/login")
    }

    useEffect(() => {
        checkForAccess();
    }, [])

    return loading || !loggedIn ? (
        <>
            <NextSeo 
                title={`Laden... | Admin PZ`}
                noindex={true}
                nofollow={true}
            />
            <main className={`flex ${openSans.variable} w-screen h-screen justify-center items-center bg-dark-purple`}>
                <p>Laden...</p>
            </main>
        </>
    ) : (
        <>
            <NextSeo 
                title={`${title} | Admin PZ`}
                noindex={true}
                nofollow={true}
            />
            <main className={`flex ${openSans.variable}`}>
                <div className='h-screen px-8 py-8 bg-dark-purple text-center'>
                    <Link href="/" className='inline-block font-medium text-xl mb-4'>Polizei Zeitung</Link>
                    <div className='flex flex-col gap-4'>
                        <Link href="/admin/dashboard" className='text-gray-300 hover:underline'>Dashboard</Link>
                        <Link href="/admin/fahndungen" className='text-gray-300 hover:underline'>Fahndungen</Link>
                        <Link href="/admin/vermisste" className='text-gray-300 hover:underline'>Vermisste</Link>
                        <Link href="/admin/logs" className='text-gray-300 hover:underline'>Logs</Link>
                        <button onClick={logoutHandler} className='text-red-400 hover:underline'>Logout</button>
                    </div>
                </div>
                <div className='flex-1 p-8'>
                    {children}
                </div>
            </main>
        </>
    );
}

export default AdminLayout;
