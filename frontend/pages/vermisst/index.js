import Image from "next/image";
import Layout from "@/components/Layout";
import { useState } from "react";
import Link from "next/link";
import { fetchMissingPersons } from "@/utils/cache";
import { useRouter } from "next/router";
import { calculatePagination } from "@/utils/pagination";
import { parseDate } from "@/utils/date";
import ProvinceSelect from "@/components/ProvinceSelect";
import { getNewSearchParams } from "@/utils/filterParams";

export default function MissingPersons({ missingPersons, query, pagination }) {
    const [filterToggled, setFilterToggled] = useState(false)
    const [filter, setFilter] = useState({
        suche: query.suche || "",
        zuletzt_gesehen_von: query.zuletzt_gesehen_von || "",
        zuletzt_gesehen_bis: query.zuletzt_gesehen_bis || "",
        bekannt: query.bekannt || "egal", 
        geschlecht: query.geschlecht || "egal",
        belohnung: query.belohnung || "egal", 
    })
    const router = useRouter()

    const handleReturnKeySearch = (e) => {
        if (e.key === "Enter" || e.keyCode === 13) 
            submitSearch();
    }

    const onProviceChange = (e) => {
        const urlSearchParams = getNewSearchParams(filter);

        const newProvince = e.target.value;        
        if (newProvince !== "Deutschland") {
            router.push("/vermisst/" + newProvince + urlSearchParams);
        }
    }

    const submitSearch = () => {
        const urlSearchParams = getNewSearchParams(filter);

        // Check if filter has changed, if not exit function
        if (query.suche === filter.suche &&
            query.delikte === filter.delikte &&
            query.tatort === filter.tatort &&
            query.zuletzt_gesehen_von === filter.zuletzt_gesehen_von &&
            query.zuletzt_gesehen_bis === filter.zuletzt_gesehen_bis)
            return;

        router.push("/vermisst" + urlSearchParams);
    }

    return (
        <Layout 
            title="Vermisste Personen" 
            description="Unterstützen Sie Polizei und Familie: Gemeinsam helfen wir, Vermisste zu finden und Familien zu vereinen. Jeder Hinweis zählt."
            canonical={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/vermisst`}
        >
            <section className="container mx-auto flex flex-col items-center pt-40 md:pt-52 px-4">
                <div className="relative max-w-2xl w-full">
                    <input type="text" value={filter.suche} onKeyUp={handleReturnKeySearch} onChange={(e) => setFilter((prev) => ({ ...prev, suche: e.target.value }))} maxLength="100" className="w-full rounded-full pl-12 sm:pl-16 pr-44 py-3 md:py-4 text-black font-medium outline-none" autoComplete="off" spellCheck="false" placeholder="Suche ..." />
                    <div className="absolute aspect-square bottom-0 top-0 left-1">
                        <button className="absolute inset-0 group" onClick={submitSearch}>
                            <Image src="/icons/search.svg" alt="" className="p-4 transform group-hover:-translate-y-1 duration-300" fill />
                        </button>
                    </div>

                    <div className="absolute bottom-0 top-0 -right-1">
                        <ProvinceSelect onProviceChange={onProviceChange} province="Deutschland" />
                    </div>
                </div>
                <button onClick={() => setFilterToggled(!filterToggled)} className="my-4 text-gray-300 text-sm flex items-center">
                    Erweiterter Filter <Image src="/icons/chevron-down.svg" alt="" className={`ml-1.5 rotate-0 ${filterToggled ? "rotate-180" : ""} duration-200`} width={12} height={12} />
                </button>
                <div className={`max-w-2xl mx-auto w-full overflow-hidden ease-in-out duration-200 ${filterToggled ? "max-h-screen" : "max-h-0"}`}>
                    <div className="grid sm:grid-cols-2 gap-4 py-4 px-2 text-[#ddd]">
                        <div className="flex flex-col">
                            <label className="text-sm text-light-gray mb-1 ml-1" htmlFor="input__zuletzt-gesehen-von">Zuletzt gesehen von</label>
                            <input type="date" id="input__zuletzt-gesehen-von" value={filter.zuletzt_gesehen_von} onChange={(e) => setFilter(prev => ({ ...prev, zuletzt_gesehen_von: e.target.value }))} className="bg-dark-purple rounded-md px-2 py-1 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-light-gray mb-1 ml-1" htmlFor="input__zuletzt-gesehen-bis">Zuletzt gesehen bis</label>
                            <input type="date" id="input__zuletzt-gesehen-bis" value={filter.zuletzt_gesehen_bis} min={filter.zuletzt_gesehen_von} onChange={(e) => setFilter(prev => ({ ...prev, zuletzt_gesehen_bis: e.target.value }))} className="bg-dark-purple rounded-md px-2 py-1 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                        </div>
                        <div className="flex flex-wrap justify-evenly col-span-full gap-y-4">
                            <div className="flex items-center gap-2 self-start">
                                <label className="text-sm text-light-gray mb-1 ml-1" htmlFor="select__ist-bekannt">Bekannt</label>
                                <select id="select__ist-bekannt" value={filter.bekannt} onChange={(e) => setFilter(prev => ({ ...prev, bekannt: e.target.value }))} className="bg-dark-purple px-2 py-1 rounded-md outline-none focus:ring-1 ring-indigo-500">
                                    <option value="egal">egal</option>
                                    <option value="ja">ja</option>
                                    <option value="nein">nein</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 self-start">
                                <label className="text-sm text-light-gray mb-1 ml-1" htmlFor="select__geschlecht">Geschlecht</label>
                                <select id="select__geschlecht" value={filter.geschlecht} onChange={(e) => setFilter(prev => ({ ...prev, geschlecht: e.target.value }))} className="bg-dark-purple px-2 py-1 rounded-md outline-none focus:ring-1 ring-indigo-500">
                                    <option value="egal">egal</option>
                                    <option value="männlich">männlich</option>
                                    <option value="weiblich">weiblich</option>
                                    <option value="unbekannt">unbekannt</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 self-start">
                                <label className="text-sm text-light-gray mb-1 ml-1" htmlFor="select__belohnung">Belohnung</label>
                                <select id="select__belohnung" value={filter.belohnung} onChange={(e) => setFilter(prev => ({ ...prev, belohnung: e.target.value }))} className="bg-dark-purple px-2 py-1 rounded-md outline-none focus:ring-1 ring-indigo-500">
                                    <option value="egal">egal</option>
                                    <option value="ja">ja</option>
                                    <option value="nein">nein</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-2">
                        <button onClick={submitSearch} className="bg-indigo-600 px-10 py-2 rounded-md hover:brightness-90 duration-200">
                            Filter
                        </button>
                    </div>
                </div>
            </section>

            <section className="container mx-auto mt-20 flex flex-wrap justify-center gap-6 px-4">
                {missingPersons.length > 0 ? (
                    <>
                        {missingPersons.map((p) => (
                            <div className="relative w-[250px] bg-white" key={p._id}>
                                <Link href={`/vermisst/${p.crawledFrom}/${p._id}`} className="flex flex-col h-full">
                                    <div className="relative group h-full">
                                        <Image
                                            src={`/images/geschlecht/${p.gender}.png`}
                                            alt="Kein Foto vorhanden."
                                            className="w-full object-cover h-[300px]"
                                            width={300}
                                            height={300}
                                        />

                                        <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible duration-300 absolute inset-0 px-4 py-5 bg-indigo-500 bg-opacity-80 flex flex-col">
                                            <p className="text-sm text-center font-semibold">{p.lastSeenLocation ? p.lastSeenLocation : "Klicke, um mehr zu erfahren"}</p>
                                            <div className="mt-auto mx-auto">
                                                <div className="flex items-center justify-center bg-white bg-opacity-50 h-10 w-10 rounded-full">
                                                    <div className="flex items-center justify-center bg-white h-8 w-8 rounded-full">
                                                        <p className="text-4xl mb-1 sm:mb-3 select-none text-indigo-100">&rsaquo;</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 py-3 group flex-grow">
                                        <h3 className="text-dark-purple text-xl mb-1 group-hover:text-indigo-600 duration-200">
                                            {p.isUnknown ? "Unbekannt" : p.lastName ? `${p.lastName.toUpperCase()}, ${p.firstName}` : `${p.firstName}`}
                                        </h3>
                                        <div className="flex">
                                            <Image src="/icons/clock.svg" alt="" width={12} height={12} />
                                            <p className="ml-1 text-gray-500 text-sm">{new Date(p.lastSeenDate).toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" })}</p>
                                        </div>
                                    </div>
                                </Link>
        
                                {p.bounty > 0 ? (
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-600 rounded-full shadow-sm" title="Belohnung ausgesetzt">
                                        <Image src="/icons/euro.svg" alt="€" className="p-2" fill />
                                    </div>
                                ) : null}
                            </div> 
                        ))}
                    </>
                ) : (
                    <p className="text-gray-300 text-center">Zurzeit wird keine Person nach deiner Suche vermisst.</p>
                )}
            </section>

            {missingPersons.length > 0 ? (
                <div className="container mx-auto mt-10 flex gap-2 justify-center">
                    {pagination.currentPage !== 1 ? (
                        <Link href={`/vermisst${getNewSearchParams(filter, pagination.currentPage - 1)}`} className="w-8 h-8 hover:bg-indigo-600 flex justify-center items-center">&laquo;</Link>
                    ) : null}
                    {pagination.pageNumbers.map((page, i) => (
                        <Link key={i} href={`/vermisst${getNewSearchParams(filter, page)}`} className={`w-8 h-8 hover:bg-indigo-600 ${pagination.currentPage === page ? "bg-indigo-600" : ""} flex justify-center items-center`}>{page}</Link>
                    ))}
                    {pagination.pageNumbers[pagination.pageNumbers?.length - 1] !== pagination.currentPage ? (
                        <Link href={`/vermisst${getNewSearchParams(filter, pagination.currentPage + 1)}`} className="w-8 h-8 hover:bg-indigo-600 flex justify-center items-center">&raquo;</Link>
                    ) : null}
                </div>
            ) : null}
        </Layout>
    );
}

export async function getServerSideProps({ query }) {
    let missingPersons = await fetchMissingPersons();

    missingPersons = missingPersons.filter(p => {
        let isValid = true;
        
        if (query.bekannt && isValid) {
            const isKnown = query.bekannt === "ja";
            isValid = p.isUnknown !== isKnown;
        }

        if (query.geschlecht && isValid) {
            isValid = p.gender === query.geschlecht;
        }

        if (query.belohnung && isValid) {
            const shouldHaveBounty = query.belohnung === "ja";
            isValid = shouldHaveBounty ? p.bounty > 0 : p.bounty === 0; 
        }

        if (query.zuletzt_gesehen_von && isValid) {
            const fromDate = parseDate(query.zuletzt_gesehen_von, "yyyy-mm-dd", "-")
            if (fromDate !== NaN) {
                isValid = new Date(p.crimeSceneDate).getTime() > fromDate.getTime()
            }
        }

        if (query.zuletzt_gesehen_bis && isValid) {
            const tillDate = parseDate(query.zuletzt_gesehen_bis, "yyyy-mm-dd", "-")
            if (tillDate !== NaN) {
                isValid = new Date(p.crimeSceneDate).getTime() < tillDate.getTime()
            }
        }

        if (query.suche && isValid) {
            const conditions = query.suche.slice(0, 100).split(/[ ,]+/); // Cut if over 100 length, Split by space or comma
            
            if (!conditions.some(el => p.lastSeenLocation?.includes(el)) &&
                !conditions.some(el => p.firstName?.includes(el)) &&
                !conditions.some(el => p.lastName?.includes(el))) {
                isValid = false;
            }
        }

        return isValid;
    })

    const itemsPerPage = 20;
    const pagination = calculatePagination(missingPersons.length, itemsPerPage, query.seite)
    missingPersons = missingPersons.slice(pagination.offset, pagination.offset + itemsPerPage)

    return { 
        props: {
            missingPersons,
            query,
            pagination
        } 
    };
}
