import AdminLayout from "@/components/AdminLayout";
import BackendApi from "@/utils/backendApi";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Logs() {
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState("")
    const router = useRouter()

    const fetchData = async() => {
        try {
            const { data } = await BackendApi.get("/admin/crawlerlogs")

            setLogs(data.logs)
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
        <AdminLayout title="Logs">
            <h1 className="text-lg font-medium mb-2">Crawler Logs</h1>
            <pre>{loading ? "Laden..." : logs || "Es gibt zurzeit keine Crawler Logs."}</pre>
        </AdminLayout>
    );
}

export default Logs;
