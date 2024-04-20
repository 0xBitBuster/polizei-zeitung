import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import Image from "next/image";
import Layout from "@/components/Layout";
import Link from "next/link";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const options = {
    responsive: true,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled: false
        },
        title: {
            display: true,
            text: "Anteil an aufgeklärten Straftaten in Deutschland / Quelle: Polizeiliche Kriminalstatistik"
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            border: {
                color: '#0E0C24'
            }
        },
        y: {
            min: 50,
            max: 70,
            ticks: {
                callback: function(value, index, values) {
                    return value + "%";
                }            
            },
            grid: {
                display: false
            },
            border: {
                color: '#0E0C24'
            } 
        },
    },    
};
const labels = ["'75", "'80", "'85", "'90", "'95", "'00", "'05", "'10", "'15", "'20", "'23"];
const data = {
    labels,
    datasets: [
        {
            data: [68, 67, 67, 66, 62, 60, 58, 56, 54, 52, 57],
            borderColor: "rgb(103, 58, 183)",
            backgroundColor: "rgba(103, 58, 183, 0.5)",
        },
    ],
};

export default function Home() {
    return (
        <Layout 
            title="Aussagen für eine bessere Zukunft" 
            description="Gemeinsam gegen Kriminalität. Deine Plattform für anonyme Hinweise zu Verbrechern, Vermissten und topaktuelle Polizeimeldungen."
        >
            <section className="container mx-auto flex md:flex-row flex-col justify-center items-center gap-8 md:min-h-[60vh] min-h-[50vh] pt-28 px-8 md:text-left text-center">
                <div className="md:w-1/2">
                    <h1 className="2xl:text-6xl xl:text-5xl lg:text-4xl text-3xl font-extrabold lg:leading-tight">
                        AUSSAGEN FÜR EINE BESSERE ZUKUNFT.
                    </h1>
                    <p className="text-md md:text-lg lg:text-xl font-light lg:my-4 my-2">
                        Wenn du Zeuge eines Verbrechens geworden bist oder gesuchte Straftäter erkennst, solltest du nicht schweigen. <br />
                        Dein Handeln kann Gerechtigkeit und Frieden in unsere Gemeinschaft bringen.
                    </p>
                    <Link href="/fahndungen" className="inline-block rounded-3xl bg-white text-dark-purple px-4 py-2 mb-4 duration-200 whitespace-nowrap group">Alle Fahndungen <span className="inline-block group-hover:translate-x-1 duration-200">→</span></Link>
                </div>
                <div className="md:w-1/2 relative flex justify-center md:max-w-none max-w-[200px]">
                    <video className="select-none pointer-events-none" autoPlay loop muted>
                        <source src="/videos/face-scanning.mp4" type="video/mp4" />
                    </video>
                </div>
            </section>

            <div className="bg-gradient-to-t from-dark-purple h-20"></div>
            <div className="bg-gradient-to-b from-dark-purple h-20"></div>

            <section className="container mx-auto flex flex-col items-center mt-6 md:mt-12 px-8">
                <h1 className="lg:text-4xl md:text-3xl text-2xl font-bold mb-8 text-center">FAST <span className="underline">JEDE ZWEITE</span> STRAFTAT BLEIBT <br /> UNGEKLÄRT</h1>

                <div className="w-full max-w-4xl">                    
                    <Line options={options} data={data} />
                </div>
            </section>

            <div className="flex justify-center mt-32 mb-8">
                <Image src="/images/finish_flag.svg" alt="" width={175} height={175} />
            </div>

            <section className="container mx-auto max-w-6xl text-center px-8">
                <h1 className="text-4xl font-bold mb-4">Unsere Ziele</h1>
                <p className="text-light-gray mb-8">Wir helfen der Polizei, indem wir ihnen Informationen zur <br /> Verfügung stellen, die Sie möglicherweise haben.</p>
                
                <div className="flex md:flex-row flex-col gap-8">
                    <div className="flex-1 bg-[#1b183d] rounded-3xl p-7">
                        <h1 className="text-3xl font-light mb-2">Kriminelle aufspüren</h1>
                        <p className="text-light-gray mb-3">Wenn Sie verdächtige Aktivitäten im Zusammenhang mit diesen Kriminellen bemerken, zögern Sie nicht, sich zu melden.</p>
                        <Link href="/fahndungen" className="inline-block rounded-3xl bg-white text-dark-purple px-4 py-2 mb-4 duration-200 whitespace-nowrap group">Alle Fahndungen <span className="inline-block group-hover:translate-x-1 duration-200">→</span></Link>
                        <div className="relative h-32 md:h-60">
                            <Image src="/images/criminal.png" alt="Polizei verhaftet Dieb" fill className="object-contain" />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col rounded-3xl gap-8 text-left">
                        <div className="flex items-center bg-[#4A4453] rounded-3xl p-7 gap-8">
                            <div className="hidden lg:block relative w-1/3 aspect-square">
                                <Image src="/images/face_recognition.svg" alt="Gesichtserkennung" fill className="object-contain" />
                            </div>
                            <div className="flex flex-col md:w-2/3">
                                <h1 className="text-2xl font-light mb-2">Gesichtserkennung</h1>
                                <p className="text-light-gray mb-2">Wir scannen Ihr Bild nach möglichen Gesichtern von gesuchten oder vermissten Personen in unserer Datenbank.</p>
                                <p className="self-end">Demnächst verfügbar.</p>
                                {/* <Link href="/fahndungen" className="inline-block self-end rounded-3xl text-white border-2 border-white px-4 py-2 hover:bg-white hover:text-[#4A4453] duration-300">Jetzt scannen</Link> */}
                            </div>
                        </div>
                        <div className="flex items-center bg-[#6E40FF] rounded-3xl gap-8 p-7">
                            <div className="md:w-2/3">
                                <h1 className="text-2xl font-light mb-2">Vermisste finden</h1>
                                <p className="text-light-gray mb-3">Wir brauchen Ihre Augen, Ihre Aufmerksamkeit und Ihr Mitgefühl. Viele Familien zählen auf Sie.</p>
                                <Link href="/vermisste" className="inline-block rounded-3xl bg-white text-dark-purple px-4 py-2 duration-200 whitespace-nowrap group">Alle Vermissten <span className="inline-block group-hover:translate-x-1 duration-200">→</span></Link>
                            </div>
                            <div className="hidden lg:block relative w-1/3 aspect-square">
                                <Image src="/images/find_persons.svg" alt="Vermisster" fill className="object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
