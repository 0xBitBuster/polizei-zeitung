import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import { getAge } from "@/utils/date";
import { fetchWantedPersons } from "@/utils/cache";
import { useRouter } from "next/router";

export default function WantedPerson({ wantedPerson }) {
    const router = useRouter();

    return (
        <Layout 
            title={`Gesucht: ${wantedPerson.isUnknown ? "Unbekannt" : wantedPerson.lastName ? `${wantedPerson.lastName.toUpperCase()}, ${wantedPerson.firstName}` : `${wantedPerson.firstName}`}`}
            description={wantedPerson.description || "Gemeinsam Hinweise zur Fahndung geben, die Polizeiarbeit unterstützen und für mehr Sicherheit sorgen. Jeder Hinweis zählt!"}
        >
            <section className="container mx-auto pt-32 md:pt-36 px-4">
                <button onClick={() => router.back()} className="inline-block mb-2 text-gray-300 group">
                    <span className="mr-1 group-hover:mr-2 duration-200">&laquo;</span> ZURÜCK
                </button>
                <div className="grid md:grid-cols-[minmax(100px,400px)_minmax(400px,1fr)] grid-rows-[minmax(450px,auto)_auto]">
                    <div className="relative">
                        <Image src={`/images/geschlecht/${wantedPerson.gender}.png`} alt="Kein Foto vorhanden." fill className="object-cover object-center" />
                    </div>

                    <div className="flex flex-col justify-between items-start bg-[#2E2778] text-[#F2E7FE] px-8 py-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">{wantedPerson.isUnknown ? "Unbekannt" : wantedPerson.lastName ? `${wantedPerson.lastName.toUpperCase()}, ${wantedPerson.firstName}` : `${wantedPerson.firstName}`}</h1>
                            <ul className="flex flex-col gap-3 sm:gap-1 mb-10">
                                <li className="flex flex-col sm:flex-row">
                                    <p className="min-w-[150px] font-light">DELIKTE:</p>
                                    <p>{wantedPerson.offenses.join(", ")}</p>
                                </li>
                                <li className="flex flex-col sm:flex-row">
                                    <p className="min-w-[150px] font-light">GESCHLECHT:</p>
                                    <p>{wantedPerson.gender}</p>
                                </li>
                                <li className="flex flex-col sm:flex-row">
                                    <p className="min-w-[150px] font-light">TATORT:</p>
                                    <p>{wantedPerson.crimeSceneLocation}</p>
                                </li>
                                <li className="flex flex-col sm:flex-row">
                                    <p className="min-w-[150px] font-light">TATZEIT-/RAUM:</p>
                                    <p>{new Date(wantedPerson.crimeSceneDate).toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" })}</p>
                                </li>
                                {wantedPerson.birthDate ? (
                                    <li className="flex flex-col sm:flex-row">
                                        <p className="min-w-[150px] font-light">GEBURTSDATUM:</p>
                                        <p>
                                            {new Date(wantedPerson.birthDate).toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" })} ({getAge(new Date(wantedPerson.birthDate))} Jahre alt)
                                        </p>
                                    </li>
                                ) : null}
                                <li className="flex flex-col sm:flex-row">
                                    <p className="min-w-[150px] font-light">NATIONALITÄT:</p>
                                    <p>{wantedPerson.nationality}</p>
                                </li>
                                {wantedPerson.height ? (
                                    <li className="flex flex-col sm:flex-row">
                                        <p className="min-w-[150px] font-light">GRÖßE:</p>
                                        <p>ca. {wantedPerson.height} cm</p>
                                    </li>
                                ) : null}
                                <li className="flex flex-col sm:flex-row">
                                    <p className="min-w-[150px] font-light">VERÖFFENTLICHT:</p>
                                    <p>
                                        {new Date(wantedPerson.createdAt).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "2-digit" })}, zuletzt aktualisiert: {new Date(wantedPerson.updatedAt).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "2-digit" })}
                                    </p>
                                </li>
                            </ul>
                        </div>

                        <Link href={wantedPerson.submitTipLink} target="_blank" className="inline-block px-6 py-4 bg-[#1e1a4a] text-white tracking-wide hover:bg-[#13103a] duration-200">
                            HINWEIS ABGEBEN &raquo;
                        </Link>
                    </div>
                    <div className="bg-[#fff] text-[#333] px-8 py-6 space-y-8">
                        {wantedPerson.bounty > 0 ? (
                            <div>
                                <h1 className="font-bold text-2xl mb-2">Belohnung</h1>
                                <p>
                                    Es ist eine Belohnung von bis zu {wantedPerson.bounty.toLocaleString("de-DE")} € ausgesetzt. Die Belohnung ist ausschließlich für Privatpersonen und nicht für Amtsträger bestimmt. Die Belohnung wird nach Maßgabe der Bedeutung der einzelnen Hinweise unter
                                    Ausschluss des Rechtsweges vergeben.
                                </p>
                            </div>
                        ) : null}
                        <div>
                            <h1 className="font-bold text-2xl mb-2">Äußerliches Erscheinen</h1>
                            {wantedPerson.appearance?.length > 0 ? (
                                <ul className="list-[square] pl-5">
                                    {wantedPerson.appearance.map((appearance, i) => (
                                        <li key={i}>{appearance}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Es sind keine äußerlichen Merkmale bekannt.</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-[#f2f2f2] text-[#666] px-8 py-6">
                        <p>{wantedPerson.description}</p>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const wantedPersons = await fetchWantedPersons();
    const wantedPerson = wantedPersons.find((p) => p._id === params.id);
    if (!wantedPerson) {
        return {
            notFound: true
        };
    }

    return {
        props: {
            wantedPerson,
            revalidate: 3600, // 1h
        },
    };
}

export const getStaticPaths = async () => {
    return {
        paths: [],
        fallback: "blocking",
    };
};
