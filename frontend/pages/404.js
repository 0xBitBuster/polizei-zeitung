import Layout from "@/components/Layout";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <Layout 
            title="Seite nicht gefunden" 
            description="Gemeinsam gegen Kriminalität. Deine Plattform für anonyme Hinweise zu Verbrechern, Vermissten und topaktuelle Polizeimeldungen."
            noindex={true}
        >
            <section className="container mx-auto pt-32 md:pt-36 px-4 flex flex-col items-center">
                <Image src="/images/404.svg" width={400} height={500} alt="" className="mb-3" />
                <h1 className="text-lg font-light mb-4">Diese Seite wurde nicht gefunden.</h1>
                <Link href="/" className="inline-block px-6 py-4 bg-[#161435] text-white tracking-wide hover:bg-[#13103a] duration-200">
                    ZURÜCK &raquo;
                </Link>
            </section>
        </Layout>
    );
}
