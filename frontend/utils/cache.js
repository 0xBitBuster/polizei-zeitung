const fs = require("fs");
const path = require("path");

export async function fetchWantedPersons() {
    const cacheDirPath = path.join(__dirname, "..", "db_cache");

    try {
        fs.mkdirSync(cacheDirPath, { recursive: true })
        
        const wantedsCachePath = path.join(cacheDirPath, "wanteds.json");
        if (hasFileBeenModifiedRecently(wantedsCachePath, 15)) {
            // Persons are in cache, read file
            const fileContent = fs.readFileSync(wantedsCachePath, 'utf-8');
            const wantedPersons = JSON.parse(fileContent)

            return wantedPersons;
        }

        // Not in cache or cache expired, refetch
        const res = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/wanted`, {
            headers: {
                "Authorization": "Bearer " + process.env.INTERNAL_API_KEY
            }
        });
        const data = await res.json();
        if (!data.ok) {
            return []
        } 

        const fileContent = JSON.stringify(data.wantedPersons)
        fs.writeFileSync(wantedsCachePath, fileContent, { flag: "w" })

        return data.wantedPersons;
    } catch (err) {
        console.log("Error fetching wanted persons: ", err)
        return [];
    }
}

export async function fetchMissingPersons() {
    const cacheDirPath = path.join(__dirname, "..", "db_cache");

    try {
        fs.mkdirSync(cacheDirPath, { recursive: true })
        
        const missingsCachePath = path.join(cacheDirPath, "missings.json");
        if (hasFileBeenModifiedRecently(missingsCachePath, 15)) {
            // Persons are in cache, read file
            const fileContent = fs.readFileSync(missingsCachePath, 'utf-8');
            const missingPersons = JSON.parse(fileContent)

            return missingPersons;
        }

        // Not in cache or cache expired, refetch
        const res = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/missing`, {
            headers: {
                "Authorization": "Bearer " + process.env.INTERNAL_API_KEY
            }
        });
        const data = await res.json();
        if (!data.ok) {
            return []
        } 

        const fileContent = JSON.stringify(data.missingPersons)
        fs.writeFileSync(missingsCachePath, fileContent, { flag: "w" })

        return data.missingPersons;
    } catch (err) {
        console.log("Error fetching missing persons: ", err)
        return [];
    }
}

export async function fetchNews() {
    const cacheDirPath = path.join(__dirname, "..", "db_cache");

    try {
        fs.mkdirSync(cacheDirPath, { recursive: true })
        
        const newsCachePath = path.join(cacheDirPath, "news.json");
        if (hasFileBeenModifiedRecently(newsCachePath, 5)) {
            // Persons are in cache, read file
            const fileContent = fs.readFileSync(newsCachePath, 'utf-8');
            const news = JSON.parse(fileContent)

            return news;
        }

        // Not in cache or cache expired, refetch
        const res = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/news`, {
            headers: {
                "Authorization": "Bearer " + process.env.INTERNAL_API_KEY
            }
        });
        const data = await res.json();
        if (!data.ok) {
            return []
        } 

        const fileContent = JSON.stringify(data.news)
        fs.writeFileSync(newsCachePath, fileContent, { flag: "w" })

        return data.news;
    } catch (err) {
        console.log("Error fetching news: ", err)
        return [];
    }
}

function hasFileBeenModifiedRecently(filePath, maxAgeInMinutes) {
    try {
        if (!fs.existsSync(filePath)) 
            return false;

        const stats = fs.statSync(filePath);
        
        // Calculate the time difference in minutes
        const currentTime = new Date().getTime();
        const lastModifiedTime = stats.mtime.getTime();
        const timeDifferenceInMinutes = (currentTime - lastModifiedTime) / (1000 * 60);
        
        return timeDifferenceInMinutes < maxAgeInMinutes;
    } catch {
        return false;
    }
}
