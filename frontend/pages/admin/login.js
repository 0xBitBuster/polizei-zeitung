import Layout from "@/components/Layout";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AdminLogin() {
    const { loading, login, loggedIn } = useAuthStore();
    const router = useRouter()

    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const loginWithPassword = async () => {
        const res = await login(password)

        if (res.ok) {
            router.push("/admin/dashboard")
        } else {
            setError(res.msg)
        }
    }

    useEffect(() => {
        if (loggedIn) {
            router.push("/admin/dashboard")
        }
    }, [])

    return (
        <Layout title="Login" noindex={true}>
            <section className="container mx-auto pt-32 md:pt-36 px-4 flex flex-col items-center">
                <div className="max-w-sm w-full">
                    <h1 className="text-xl font-bold mb-2">Login</h1>
                    {error ? (
                        <p className="text-sm text-red-500 mb-4">{error}</p>
                    ) : null}
                    <div className="flex flex-col mb-4">
                        <label className="text-sm text-light-gray mb-1 ml-1">Passwort</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="123456789" className="bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <button onClick={loginWithPassword} disabled={loading || !password} className="w-full bg-indigo-600 px-10 py-2 rounded-md hover:brightness-90 disabled:brightness-75 duration-200">
                        Anmelden
                    </button>
                </div>
            </section>
        </Layout>
    );
}
