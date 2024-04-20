import Image from "next/image";
import Layout from "@/components/Layout";
import { useState } from "react";
import Link from "next/link";
import { fetchNews } from "@/utils/cache";
import { useRouter } from "next/router";
import { calculatePagination } from "@/utils/pagination";
import { parseDate } from "@/utils/date";
import ProvinceSelect from "@/components/ProvinceSelect";
import { isValidProvince } from "@/utils/validation";
import { getNewSearchParams } from "@/utils/filterParams";

export default function Aktuelles({ news, query, pagination, params }) {
    const [filterToggled, setFilterToggled] = useState(false)
    const [filter, setFilter] = useState({
        suche: query.suche || "",
        datum_von: query.datum_von || "",
        datum_bis: query.datum_bis || ""
    })
    const router = useRouter()

    const handleReturnKeySearch = (e) => {
        if (e.key === "Enter" || e.keyCode === 13) 
            submitSearch();
    }
    
    const onProviceChange = (e) => {
        const urlSearchParams = getNewSearchParams(filter);

        const newProvince = e.target.value;   
        if (newProvince === params.province) 
            return;

        if (newProvince === "Deutschland") {
            router.push("/aktuelles" + urlSearchParams);
        } else {
            router.push("/aktuelles/" + newProvince + urlSearchParams);
        }
    }

    const submitSearch = () => {
        const urlSearchParams = getNewSearchParams(filter);

        // Check if filter has changed, if not exit function
        if (query.suche === filter.suche &&
            query.datum_von === filter.datum_von &&
            query.datum_bis === filter.datum_bis)
            return;

        router.push("/aktuelles/" + params.province + urlSearchParams);
    }

    return (
        <Layout 
            title={`Polizeimeldungen in ${params.province}`} 
            description="Gemeinsam gegen Kriminalität. Deine Plattform für anonyme Hinweise zu Verbrechern, Vermissten und topaktuelle Polizeimeldungen."
            canonical={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/aktuelles/${params.province}`}
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
                        <ProvinceSelect onProviceChange={onProviceChange} value={params.province} />
                    </div>
                </div>
                <button onClick={() => setFilterToggled(!filterToggled)} className="my-4 text-gray-300 text-sm flex items-center">
                    Erweiterter Filter <Image src="/icons/chevron-down.svg" alt="" className={`ml-1.5 rotate-0 ${filterToggled ? "rotate-180" : ""} duration-200`} width={12} height={12} />
                </button>
                <div className={`max-w-2xl mx-auto w-full overflow-hidden ease-in-out duration-200 ${filterToggled ? "max-h-screen" : "max-h-0"}`}>
                    <div className="grid sm:grid-cols-2 gap-4 py-4 px-2 text-[#ddd]">
                        <div className="flex flex-col">
                            <label className="text-sm text-light-gray mb-1 ml-1" htmlFor="input__datum-von">von Datum</label>
                            <input type="date" id="input__datum-von" value={filter.datum_von} onChange={(e) => setFilter(prev => ({ ...prev, datum_von: e.target.value }))} className="bg-dark-purple rounded-md px-2 py-1 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-light-gray mb-1 ml-1" htmlFor="input__datum-bis">bis Datum</label>
                            <input type="date" id="input__datum-bis" value={filter.datum_bis} min={filter.datum_von} onChange={(e) => setFilter(prev => ({ ...prev, datum_bis: e.target.value }))} className="bg-dark-purple rounded-md px-2 py-1 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
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
                {news.length > 0 ? (
                    <div className="flex flex-col max-w-5xl gap-12">
                        {news.map((p) => (
                            <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-5" key={p._id}>
                                <div className="relative rounded-lg bg-white w-24 h-24 shrink-0">
                                    <Image src={`/images/bundesland/${p.crawledFrom}.png`} alt="" className="p-1" fill priority />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-sm text-light-gray">{new Date(p.date).toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" })}, {p.location || p.crawledFrom}</p>
                                    <Link href={p.link} target="_blank">
                                        <h2 className="text-xl text-indigo-400 font-medium mb-2 hover:underline">{p.title}</h2>
                                    </Link>
                                    <p className="text-[#eee]">{p.description || "Keine Beschreibung verfügbar."} <Link href={p.link} target="_blank" className="text-indigo-100 hover:underline ml-1">Mehr lesen &raquo;</Link></p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-300 text-center">Zurzeit gibt es nichts aktuelles für deine Suche.</p>
                )}
            </section>

            {news.length > 0 ? (
                <div className="container mx-auto mt-10 flex gap-2 justify-center">
                    {pagination.currentPage !== 1 ? (
                        <Link href={`/aktuelles/${params.province}${getNewSearchParams(filter, pagination.currentPage - 1)}`} className="w-8 h-8 hover:bg-indigo-600 flex justify-center items-center">&laquo;</Link>
                    ) : null}
                    {pagination.pageNumbers.map((page, i) => (
                        <Link key={i} href={`/aktuelles/${params.province}${getNewSearchParams(filter, page)}`} className={`w-8 h-8 hover:bg-indigo-600 ${pagination.currentPage === page ? "bg-indigo-600" : ""} flex justify-center items-center`}>{page}</Link>
                    ))}
                    {pagination.pageNumbers[pagination.pageNumbers?.length - 1] !== pagination.currentPage ? (
                        <Link href={`/aktuelles/${params.province}${getNewSearchParams(filter, pagination.currentPage + 1)}`} className="w-8 h-8 hover:bg-indigo-600 flex justify-center items-center">&raquo;</Link>
                    ) : null}
                </div>
            ) : null}
        </Layout>
    );
}

export async function getServerSideProps({ query, params }) {
    let news = await fetchNews();

    if (!isValidProvince(params.province)) {
        params.province = "Deutschland"
    }

    news = news.filter(p => {
        let isValid = true;
        
        // Check if province matches
        if (params.province !== "Deutschland") {
            isValid = p.crawledFrom === params.province;
        }

        if (query.datum_von && isValid) {
            const fromDate = parseDate(query.datum_von, "yyyy-mm-dd", "-")
            if (fromDate !== NaN) {
                isValid = new Date(p.date).getTime() > fromDate.getTime()
            }
        }

        if (query.datum_bis && isValid) {
            const tillDate = parseDate(query.datum_bis, "yyyy-mm-dd", "-")
            if (tillDate !== NaN) {
                isValid = new Date(p.date).getTime() < tillDate.getTime()
            }
        }

        if (query.suche && isValid) {
            const conditions = query.suche.slice(0, 100).split(/[ ,]+/); // Cut if over 100 length, Split by space or comma
            
            if (!conditions.some(el => p.title?.includes(el)) &&
                !conditions.some(el => p.location?.includes(el))) {
                isValid = false;
            }
        }

        return isValid;
    })

    const itemsPerPage = 20;
    const pagination = calculatePagination(news.length, itemsPerPage, query.seite)
    news = news.slice(pagination.offset, pagination.offset + itemsPerPage)

    return { 
        props: {
            news,
            query,
            pagination,
            params
        } 
    };
}
