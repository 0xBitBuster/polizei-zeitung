import axios from "axios";

const BackendApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL + "/api",
    withCredentials: true
});

export default BackendApi