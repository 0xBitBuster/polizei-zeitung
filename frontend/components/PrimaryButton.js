function PrimaryButton({ children }) {
    return (
        <button className="bg-indigo-600 text-white font-light px-5 py-1.5 rounded-full hover:scale-105 duration-300">
            {children}
        </button>
    );
}

export default PrimaryButton;
