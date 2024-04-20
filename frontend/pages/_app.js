import CookieManager from "@/components/CookieManager";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
    return (
        <>
            <Component {...pageProps} />
            <CookieManager />
            <ToastContainer position="top-right" theme="colored" />
        </>
    );
}
