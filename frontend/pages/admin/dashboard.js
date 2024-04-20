import AdminLayout from "@/components/AdminLayout";
import BackendApi from "@/utils/backendApi";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [statistics, setStatistics] = useState({
        wanted: 0,
        missing: 0,
        news: 0
    })
    const router = useRouter()

    const fetchData = async() => {
        try {
            const { data } = await BackendApi.get("/admin/statistics")

            setStatistics(prev => ({
                ...prev,
                wanted: data.wanted,
                missing: data.missing,
                news: data.news
            }))
        } catch (error) {
            if (error.response.status === 401) {
                router.push("/admin/login")
            }
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchData();
    }, [])

    return (
        <AdminLayout title="Dashboard">    
            <h1 className="mb-8">Willkommen, Admin!</h1>
            <div className="flex flex-wrap gap-10">
                <div className="bg-dark-purple rounded-xl px-6 py-4">
                    <p className="font-light">FAHNDUNGEN</p>
                    <h1 className="text-xl">{loading ? "Laden..." : statistics.wanted}</h1>
                </div>
                <div className="bg-dark-purple rounded-xl px-6 py-4">
                    <p className="font-light">VERMISSTE</p>
                    <h1 className="text-xl">{loading ? "Laden..." : statistics.missing}</h1>
                </div>
                <div className="bg-dark-purple rounded-xl px-6 py-4">
                    <p className="font-light">AKTUELLES</p>
                    <h1 className="text-xl">{loading ? "Laden..." : statistics.news}</h1>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Dashboard;
