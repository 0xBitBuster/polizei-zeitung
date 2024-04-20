import { useEffect, useState } from "react";
import Link from "next/link";
import PrimaryButton from "./PrimaryButton";
import Image from "next/image";
import debounce from "@/utils/debounce";

function Navbar() {
    const [isToggled, setIsToggled] = useState(false);
    const [active, setActive] = useState(false);
    const [windowAvailable, setWindowAvailable] = useState(false);

    useEffect(() => {
        document.body.style.overflowY = isToggled ? "hidden" : "auto";
    }, [isToggled]);

    useEffect(() => {
        const handleScroll = debounce(() => setActive(window.scrollY > 50), 50);
        window.addEventListener("scroll", handleScroll, { passive: true });

        setWindowAvailable(true);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`${active ? "bg-dark-purple shadow-sm" : "bg-dark"} duration-300 bg-opacity-95 fixed w-full z-20`}>
            <div className="flex items-center justify-between p-4 mx-auto container">
                <h3 className={`ml-3 text-4xl duration-300`}>
                    <Link href="/">
                        <Image src="/logo.png" alt="Polizei Zeitung" width={170} height={20} />
                    </Link>
                </h3>
                <div className="hidden lg:flex space-x-7 font-light text-lg tracking-wide duration-300 underline-offset-8">
                    <Link className={`cursor-pointer ${windowAvailable && window.location.pathname.startsWith("/fahndungen") ? "underline" : "hover:underline"}`} href="/fahndungen">
                        FAHNDUNGEN
                    </Link>
                    <Link className={`cursor-pointer ${windowAvailable && window.location.pathname.startsWith("/vermisst") ? "underline" : "hover:underline"}`} href="/vermisst">
                        VERMISST
                    </Link>
                    <Link className={`cursor-pointer ${windowAvailable && window.location.pathname.startsWith("/aktuelles") ? "underline" : "hover:underline"}`} href="/aktuelles">
                        AKTUELLES
                    </Link>
                </div>
                <div className="hidden lg:flex space-x-7 font-light text-lg tracking-wide duration-300 underline-offset-8">
                    {/* <PrimaryButton>
                        App Herunterladen
                    </PrimaryButton> */}
                    <p className="text-md text-light-gray">App demnächst verfügbar.</p>
                </div>
            
                <div className="lg:hidden relative z-30">
                    <button className="flex flex-col space-y-1.5" onClick={() => setIsToggled(!isToggled)}>
                        <span className={`w-8 h-1 rounded duration-300 origin-top-left ${isToggled ? "rotate-45 bg-[#fff]" : "bg-[#fff]"}`}></span>
                        <span className={`w-6 h-1 rounded duration-300 block ml-auto ${isToggled ? "opacity-0 bg-[#fff]" : "bg-[#fff]"}`}></span>
                        <span className={`w-8 h-1 rounded duration-300 origin-bottom-left ${isToggled ? "-rotate-45 bg-[#fff]" : "bg-[#fff]"}`}></span>
                    </button>
                </div>
            </div>

            <div className={`z-20 fixed top-0 h-screen w-screen bg-dark-purple flex flex-col items-center justify-center space-y-10 text-2xl font-medium underline-offset-8 ${isToggled ? "left-0" : "left-full"} duration-500`}>
                <Link className="cursor-pointer hover:underline" href="/fahndungen">
                    FAHNDUNGEN
                </Link>
                <Link className="cursor-pointer hover:underline" href="/vermisst">
                    VERMISST
                </Link>
                <Link className="cursor-pointer hover:underline" href="/aktuelles">
                    AKTUELLES
                </Link>
                {/* <PrimaryButton>
                    App Herunterladen
                </PrimaryButton> */}
                <p className="text-md text-light-gray font-normal text-lg">App demnächst verfügbar.</p>
            </div>
            
            <hr className="bg-[#3B3959] h-[1px] border-none" />
        </nav>
    );
}

export default Navbar;
