import Link from "next/link";

function Footer() {
    return (
        <div className="bg-dark-purple mt-16 md:mt-24 py-12">
            <div className="container mx-auto max-w-6xl">
                <ul className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 mb-6">
                    <li className="hover:underline"><Link href="/rechtliches/datenschutz">Datenschutz</Link></li>
                    <li className="hover:underline"><Link href="/rechtliches/impressum">Impressum</Link></li>
                </ul>
                <p className="text-center text-light-gray text-sm">Polizei Zeitung &copy; 2024 Alle Rechte vorbehalten.</p>
            </div>
        </div>
    );
}

export default Footer;
