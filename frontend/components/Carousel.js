import { useState } from "react";

function Carousel({ children, onImageClick }) {
    const [current, setCurrent] = useState(0)

    const prev = () => setCurrent(current => current === 0 ? children.length - 1 : current - 1)
    const next = () => setCurrent(current => current === children.length - 1 ? 0 : current + 1)
    
    return (
        <div className="overflow-hidden relative">
            <div className="flex transition-transform h-full ease-out duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
                {children.map((child, i) => (
                    <div className={`flex-shrink-0 relative h-full w-full ${onImageClick !== null ? "cursor-pointer" : ""}`} onClick={() => onImageClick(i)} key={i}>
                        {child}
                    </div>
                ))}
            </div>

            <button onClick={prev} className="absolute top-1/2 transform -translate-y-1/2 w-20 h-20 -left-10 rounded-full text-white/60 text-4xl font-bold bg-indigo-600/60 hover:bg-indigo-600/80 duration-200 leading-none">
                <span className="absolute top-4 right-5">&lsaquo;</span>
            </button>
            <button onClick={next} className="absolute top-1/2 transform -translate-y-1/2 w-20 h-20 -right-10 rounded-full text-white/60 text-4xl font-bold bg-indigo-600/60 hover:bg-indigo-600/80 duration-200 leading-none">
                <span className="absolute top-4 left-5">&rsaquo;</span>
            </button>

            <div className="absolute bottom-4 right-0 left-0">
                <div className="flex items-center justify-center gap-2">
                    {children.map((_, i) => (
                        <div key={i} className={`transition-all w-2 h-2 bg-white rounded-full ${current === i ? "" : "bg-opacity-50"}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Carousel;
