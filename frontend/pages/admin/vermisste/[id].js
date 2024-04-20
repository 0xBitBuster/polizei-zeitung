import AdminLayout from "@/components/AdminLayout";
import BackendApi from "@/utils/backendApi";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function Vermisst() {
    const [loading, setLoading] = useState(true)
    const [missingPerson, setMissingPerson] = useState(null)
    const router = useRouter()
    const { id } = router.query;

    const fetchData = async() => {
        try {
            const { data } = await BackendApi.get(`/missing/${id}?admin=1`)

            setMissingPerson({ 
                ...data.missingPerson,
                appearance: data.missingPerson.appearance.join(" | ")
            })
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            }

            toast.error("Etwas lief schief, während versucht wurde die Person zu finden.")
        }

        setLoading(false)
    }

    const approvePerson = async () => {
        try {
            const modifiedPerson = { 
                ...missingPerson,
                isApproved: true,
                appearance: missingPerson.appearance.trim() !== "" ? missingPerson.appearance.split("|").map(i => i.trim()) : []
            };
            delete modifiedPerson.createdAt;
            delete modifiedPerson.updatedAt;

            await BackendApi.put(`/missing/${missingPerson._id}`, modifiedPerson)
            router.reload();
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            }

            toast.error("Etwas lief schief, während versucht wurde die Person zu genehmigen.")
        }
    }

    const editPerson = async () => {
        try {
            const modifiedPerson = { 
                ...missingPerson,
                appearance: missingPerson.appearance.trim() !== "" ? missingPerson.appearance.split("|").map(i => i.trim()) : []
            };
            delete modifiedPerson.createdAt;
            delete modifiedPerson.updatedAt;

            await BackendApi.put(`/missing/${missingPerson._id}`, modifiedPerson)
            router.reload()
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            }

            toast.error("Etwas lief schief, während versucht wurde die Person zu bearbeiten.")
        }
    }

    const deletePerson = async() => {
        try {
            await BackendApi.delete(`/missing/${missingPerson._id}`)
            router.push("/admin/vermisste");
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            }

            toast.error("Etwas lief schief, während versucht wurde die Person zu löschen.")
        }
    }

    const convertToWantedPerson = async() => {
        try {
            await BackendApi.delete(`/missing/${missingPerson._id}/convert`)
            router.push("/admin/vermisste");
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            }

            toast.error("Etwas lief schief, während versucht wurde die Person zu konvertieren.")
        }
    }

    useEffect(() => {
        if (id)
            fetchData() 
    }, [id])

    return (
        <AdminLayout title={`Vermisst: ${!missingPerson || missingPerson.isUnknown ? "Unbekannt" : missingPerson.lastName ? `${missingPerson.lastName.toUpperCase()}, ${missingPerson.firstName}` : `${missingPerson.firstName}`}`}>
            <h1 className="text-lg font-medium mb-2 text-center">Vermisst #{id}</h1>
            {loading ? (
                <p>Laden...</p>
            ) : missingPerson ? (
                <div className="mx-auto space-y-4 max-w-4xl">
                    <p><span className="text-light-gray">Genehmigt:</span> {missingPerson.isApproved ? "Ja" : "Nein"}</p>
                    <p><span className="text-light-gray">Gecrawled:</span> {new Date(missingPerson.createdAt).toLocaleString('de-DE')}</p>
                    <p><span className="text-light-gray">Bundesland:</span> {missingPerson.crawledFrom}</p>
                    <p><span className="text-light-gray">Crawled URL / Hinweis abgeben:</span> <Link href={missingPerson.crawledUrl} target="_blank">{missingPerson.crawledUrl}</Link></p>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray">Ist Unbekannt</label>
                        <select value={missingPerson.isUnknown ? "ja" : "nein"} onChange={(e) => setMissingPerson(prev => ({ ...prev, isUnknown: e.target.value === "ja" }))} className="bg-dark-purple px-2 py-1 rounded-md outline-none focus:ring-1 ring-indigo-500">
                            <option value="ja">ja</option>
                            <option value="nein">nein</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Vorname</label>
                        <input type="text" value={missingPerson.firstName} onChange={(e) => setMissingPerson(prev => ({ ...prev, firstName: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Familienname</label>
                        <input type="text" value={missingPerson.lastName} onChange={(e) => setMissingPerson(prev => ({ ...prev, lastName: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray">Geschlecht</label>
                        <select value={missingPerson.gender} onChange={(e) => setMissingPerson(prev => ({ ...prev, gender: e.target.value }))} className="bg-dark-purple px-2 py-1 rounded-md outline-none focus:ring-1 ring-indigo-500">
                            <option value="weiblich">weiblich</option>
                            <option value="männlich">männlich</option>
                            <option value="unbekannt">unbekannt</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Vermisstenort</label>
                        <input type="text" value={missingPerson.lastSeenLocation} onChange={(e) => setMissingPerson(prev => ({ ...prev, lastSeenLocation: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Vermisst seit (gecrawled: {missingPerson.lastSeenDateCrawled || "N.A."})</label>
                        <input type="date" value={missingPerson.lastSeenDate} onChange={(e) => setMissingPerson(prev => ({ ...prev, lastSeenDate: e.target.value }))} className="bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Belohnung (in €)</label>
                        <input type="text" value={missingPerson.bounty} onChange={(e) => setMissingPerson(prev => ({ ...prev, bounty: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-light-gray mb-1">Beschreibung</label>
                        <textarea value={missingPerson.description} onChange={(e) => setMissingPerson(prev => ({ ...prev, description: e.target.value }))} className="min-h-[200px] bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Äußerliches Erscheinen (getrennt mit &quot;|&quot;)</label>
                        <input type="text" value={missingPerson.appearance} onChange={(e) => setMissingPerson(prev => ({ ...prev, appearance: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Alter</label>
                        <input type="text" value={missingPerson.age} onChange={(e) => setMissingPerson(prev => ({ ...prev, age: Number(e.target.value) }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Höhe (in cm)</label>
                        <input type="text" value={missingPerson.height} onChange={(e) => setMissingPerson(prev => ({ ...prev, height: Number(e.target.value) }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Nationalität</label>
                        <input type="text" value={missingPerson.nationality} onChange={(e) => setMissingPerson(prev => ({ ...prev, nationality: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex gap-4">
                        {missingPerson.isApproved ? (
                            <button onClick={editPerson} className="bg-yellow-500 px-4 py-2 rounded-md hover:brightness-90 duration-200">
                                Bearbeiten
                            </button>
                        ) : (
                            <button onClick={approvePerson} className="bg-green-500 px-4 py-2 rounded-md hover:brightness-90 duration-200">
                                Genehmigen
                            </button>
                        )}
                        <button onClick={deletePerson} className="bg-red-500 px-4 py-2 rounded-md hover:brightness-90 duration-200">
                            Löschen
                        </button>
                        <button onClick={convertToWantedPerson} className="bg-blue-500 px-4 py-2 rounded-md hover:brightness-90 duration-200">
                            Zu Fahndung konvertieren
                        </button>
                    </div>
                </div>
            ) : (
                <p>Die Vermisste Person wurde nicht gefunden.</p>
            )}
        </AdminLayout>
    );
}

export default Vermisst;
