function ProvinceSelect({ onProviceChange, province }) {
    return (
        <select onChange={onProviceChange} value={province} className="w-40 h-full max-w-[160px] sm:max-w-none rounded-full text-center bg-indigo-600 duration-200 ring-indigo-400 focus:ring-2 px-6 outline-none cursor-pointer">
            <option value="Deutschland">Deutschland</option>
            <option value="Baden-Württemberg">Baden-Württemberg</option>
            <option value="Bayern">Bayern</option>
            <option value="Berlin">Berlin</option>
            <option value="Brandenburg">Brandenburg</option>
            <option value="Bremen">Bremen</option>
            <option value="Hamburg">Hamburg</option>
            <option value="Hessen">Hessen</option>
            <option value="Niedersachsen">Niedersachsen</option>
            <option value="Mecklenburg-Vorpommern">Mecklenburg-Vorpommern</option>
            <option value="Nordrhein-Westfalen">Nordrhein-Westfalen</option>
            <option value="Rheinland-Pfalz">Rheinland-Pfalz</option>
            <option value="Saarland">Saarland</option>
            <option value="Sachsen">Sachsen</option>
            <option value="Sachsen-Anhalt">Sachsen-Anhalt</option>
            <option value="Schleswig-Holstein">Schleswig-Holstein</option>
            <option value="Thüringen">Thüringen</option>
        </select>
    );
}

export default ProvinceSelect;
