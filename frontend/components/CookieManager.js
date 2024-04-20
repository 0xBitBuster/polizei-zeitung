import { getCookie, setCookie } from "@/utils/cookies";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

function CookieManager() {
    const [showBanner, setShowBanner] = useState(false)
    const [preferences, setPreferences] = useState({
        notwendig: 1,
        analyse: 0
    })

    const declineCookies = () => {
        const updatedPreferences = {
            notwendig: 1,
            analyse: 0
        }

        setPreferences(updatedPreferences)
        setCookie("cookie_preferences", JSON.stringify(updatedPreferences), 365)
        setShowBanner(false)
    }

    const allowCookies = () => {
        const updatedPreferences = {
            notwendig: 1,
            analyse: 1
        }

        setPreferences(updatedPreferences)
        setCookie("cookie_preferences", JSON.stringify(updatedPreferences), 365)
        setShowBanner(false)
    }

    useEffect(() => {
        const value = getCookie("cookie_preferences")
    
        if (value !== "") {
            try {
                const data = JSON.parse(value);
                setPreferences(data)
            } catch (error) {
                setShowBanner(true)
            }
        } else {
            setShowBanner(true)
        }
    }, [])

    return (
        <>
            {showBanner ? (          
                <div className="fixed bottom-10 left-10 z-50 p-6 bg-[#10182F] rounded-lg max-w-sm text-sm shadow-xl shadow-[#101625]">
                    <p className="mb-6">Wir verwenden Cookies, um Ihnen das bestmögliche Erlebnis zu bieten. Sie erlauben uns auch, das Nutzungsverhalten zu analysieren, um die Website ständig zu verbessern. <Link href="/rechtliches/datenschutz" target="_blank" className="underline">Erfahre mehr</Link></p>
                    <div className="flex justify-end gap-6 font-semibold">
                        <button onClick={declineCookies} className="hover:brightness-90 duration-200">Ablehnen</button>
                        <button onClick={allowCookies} className="bg-white px-4 py-1.5 text-black rounded-lg hover:brightness-90 duration-200">Cookies Zulassen</button>
                    </div>
                </div>
            ) : null}

            {preferences.analyse === 1 ? (
                <>
                    <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} />
                    <Script id="gtag-script">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                                page_path: window.location.pathname,
                            });
                        `}
                    </Script>
                </>
            ) : null}
        </>
    );
}

export default CookieManager;
