import AdminLayout from "@/components/AdminLayout";
import BackendApi from "@/utils/backendApi";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const defaultPerson = {
    firstName: "",
    lastName: "",
    crimeSceneLocation: "",
    crimeSceneDate: null,
    age: "",
    height: ""
}

function Fahndungen() {
    const [loading, setLoading] = useState(true)
    const [wantedPersons, setWantedPersons] = useState([])
    const [wantedPerson, setWantedPerson] = useState(null)
    const router = useRouter()

    const fetchData = async() => {
        try {
            const { data } = await BackendApi.get("/wanted/unapproved")

            setWantedPersons(data.wantedPersons)

            if (data.wantedPersons?.length > 0) {
                setWantedPerson({ 
                    ...defaultPerson,
                    ...data.wantedPersons[0],
                    offenses: data.wantedPersons[0].offenses.join(" | "),
                    appearance: data.wantedPersons[0].appearance.join(" | ")
                })
            }
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            }

            toast.error("Etwas lief schief, während versucht wurde die Liste zu finden.")
        }

        setLoading(false)
    }

    const approvePerson = async () => {
        try {
            const modifiedPerson = { 
                ...wantedPerson,
                isApproved: true,
                offenses: wantedPerson.offenses.trim() !== "" ? wantedPerson.offenses.split("|").map(i => i.trim()) : [],
                appearance: wantedPerson.appearance.trim() !== "" ? wantedPerson.appearance.split("|").map(i => i.trim()) : []
            };
            delete modifiedPerson.createdAt;
            delete modifiedPerson.updatedAt;

            const { data } = await BackendApi.put(`/wanted/${wantedPerson._id}`, modifiedPerson)

            if (data.ok) {
                nextPerson()
            }
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            } else if (error.response.status === 404) {
                nextPerson()
                return;
            }

            toast.error("Etwas lief schief, während versucht wurde die Person zu genehmigen.")
        }
    }

    const deletePerson = async() => {
        try {
            const { data } = await BackendApi.delete(`/wanted/${wantedPerson._id}`)

            if (data.ok) {
                nextPerson()
            }
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            } else if (error.response.status === 404) {
                nextPerson()
                return;
            }

            toast.error("Etwas lief schief, während versucht wurde die Person zu löschen.")
        }
    }

    const convertToMissingPerson = async() => {
        try {
            const { data } = await BackendApi.post(`/wanted/${wantedPerson._id}/convert`)

            if (data.ok) {
                nextPerson()
            }
        } catch (error) {
            if (error.response.status === 401) {
                return router.push("/admin/login")
            } else if (error.response.status === 404) {
                nextPerson()
                return;
            }

            toast.error("Etwas lief schief, während versucht wurde die Person zu konvertieren.")
        }
    }

    const nextPerson = () => {
        const updatedPersons = wantedPersons.slice(1)
        setWantedPersons(updatedPersons)

        if (updatedPersons[0]) {
            setWantedPerson({ 
                ...defaultPerson,
                ...updatedPersons[0],
                offenses: updatedPersons[0].offenses.join(" | "),
                appearance: updatedPersons[0].appearance.join(" | ")
            })
        } else {
            setLoading(true)
            fetchData()
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    return (
        <AdminLayout title="Ungeprüfte Gesuchte">    
            <h1 className="text-lg font-medium mb-2 text-center">Fahndungen</h1>
            {loading ? (
                <p>Laden...</p>
            ) : wantedPerson ? (
                <div className="mx-auto space-y-4 max-w-4xl">
                    <p><span className="text-light-gray">ID:</span> {wantedPerson._id}</p>
                    <p><span className="text-light-gray">Gecrawled:</span> {new Date(wantedPerson.createdAt).toLocaleString('de-DE')}</p>
                    <p><span className="text-light-gray">Bundesland:</span> {wantedPerson.crawledFrom}</p>
                    <p><span className="text-light-gray">Crawled URL / Hinweis abgeben:</span> <Link href={wantedPerson.crawledUrl} target="_blank">{wantedPerson.crawledUrl}</Link></p>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray">Ist Unbekannt</label>
                        <select value={wantedPerson.isUnknown ? "ja" : "nein"} onChange={(e) => setWantedPerson(prev => ({ ...prev, isUnknown: e.target.value === "ja" }))} className="bg-dark-purple px-2 py-1 rounded-md outline-none focus:ring-1 ring-indigo-500">
                            <option value="ja">ja</option>
                            <option value="nein">nein</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Vorname</label>
                        <input type="text" value={wantedPerson.firstName} onChange={(e) => setWantedPerson(prev => ({ ...prev, firstName: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Familienname</label>
                        <input type="text" value={wantedPerson.lastName} onChange={(e) => setWantedPerson(prev => ({ ...prev, lastName: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray">Geschlecht</label>
                        <select value={wantedPerson.gender} onChange={(e) => setWantedPerson(prev => ({ ...prev, gender: e.target.value }))} className="bg-dark-purple px-2 py-1 rounded-md outline-none focus:ring-1 ring-indigo-500">
                            <option value="weiblich">weiblich</option>
                            <option value="männlich">männlich</option>
                            <option value="unbekannt">unbekannt</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Delikte (getrennt mit &quot;|&quot;)</label>
                        <input type="text" value={wantedPerson.offenses} onChange={(e) => setWantedPerson(prev => ({ ...prev, offenses: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Tatort</label>
                        <input type="text" value={wantedPerson.crimeSceneLocation} onChange={(e) => setWantedPerson(prev => ({ ...prev, crimeSceneLocation: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Tatzeit (gecrawled: {wantedPerson.crimeSceneDateCrawled || "N.A."})</label>
                        <input type="date" value={wantedPerson.crimeSceneDate} onChange={(e) => setWantedPerson(prev => ({ ...prev, crimeSceneDate: e.target.value }))} className="bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Belohnung (in €)</label>
                        <input type="text" value={wantedPerson.bounty} onChange={(e) => setWantedPerson(prev => ({ ...prev, bounty: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-light-gray mb-1">Beschreibung</label>
                        <textarea value={wantedPerson.description} onChange={(e) => setWantedPerson(prev => ({ ...prev, description: e.target.value }))} className="min-h-[200px] bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Äußerliches Erscheinen (getrennt mit &quot;|&quot;)</label>
                        <input type="text" value={wantedPerson.appearance} onChange={(e) => setWantedPerson(prev => ({ ...prev, appearance: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Alter</label>
                        <input type="text" value={wantedPerson.age} onChange={(e) => setWantedPerson(prev => ({ ...prev, age: Number(e.target.value) }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Höhe (in cm)</label>
                        <input type="text" value={wantedPerson.height} onChange={(e) => setWantedPerson(prev => ({ ...prev, height: Number(e.target.value) }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-light-gray mb-1">Nationalität</label>
                        <input type="text" value={wantedPerson.nationality} onChange={(e) => setWantedPerson(prev => ({ ...prev, nationality: e.target.value }))} className="flex-1 bg-dark-purple rounded-md px-3 py-2 placeholder:text-[#7374A4] outline-none focus:ring-1 ring-indigo-500" />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={approvePerson} className="bg-green-500 px-4 py-2 rounded-md hover:brightness-90 duration-200">
                            Genehmigen
                        </button>
                        <button onClick={deletePerson} className="bg-red-500 px-4 py-2 rounded-md hover:brightness-90 duration-200">
                            Löschen
                        </button>
                        <button onClick={convertToMissingPerson} className="bg-blue-500 px-4 py-2 rounded-md hover:brightness-90 duration-200">
                            Zu vermisste Person konvertieren
                        </button>
                    </div>
                </div>
            ) : (
                <p>Keine ungenehmigten Fahndungen vorhanden.</p>
            )}
        </AdminLayout>
    );
}

export default Fahndungen;
