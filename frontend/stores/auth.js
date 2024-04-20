import BackendApi from '@/utils/backendApi';
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
    loggedIn: false,
    loading: false,
    init: async() => { 
        set({ loading: true })
        
        if (localStorage.getItem("loggedIn")) {
            set({ loading: false, loggedIn: true })
            return true;
        }
        
        try {
            await BackendApi.get("/admin/statistics")

            set({ loggedIn: true, loading: false })
            localStorage.setItem("loggedIn", 1)
            return true;
        } catch (_) {
            set({ loggedIn: false, loading: false })
            localStorage.removeItem("loggedIn")
            return false;
        }
    },
    login: async(password) => {
        set({ loading: true })

        try {
            const { data } = await BackendApi.post("/auth/login", { password })

            if (data.ok) {
                localStorage.setItem("loggedIn", 1)
                return { ok: true }
            }

            set({ loggedIn: false, loading: false })
            localStorage.removeItem("loggedIn")
            return { ok: false, msg: data.msg }
        } catch (err) {
            set({ loggedIn: false, loading: false })
            localStorage.removeItem("loggedIn")

            if (err.response?.data?.msg) {
                return { ok: false, msg: err.response.data.msg };
            }

            return { ok: false, msg: "Etwas ist sehr schief gelaufen. Bitte versuche es erneut." };
        }
    },
    logout: async() => {
        try {
            await BackendApi.post("/auth/logout")
        } catch (_) {}

        set({ loggedIn: false, loading: false })
        localStorage.removeItem("loggedIn")
        return true
    }
}));
