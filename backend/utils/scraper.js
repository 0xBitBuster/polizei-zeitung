const puppeteer = require("puppeteer");
const path = require("path");
const { format, createLogger, transports } = require("winston");
const { combine, timestamp, json } = format;

const MissingPerson = require("../models/MissingPerson");
const WantedPerson = require("../models/WantedPerson");
const NewsPost = require("../models/NewsPost");
const { parseDate, parseDateTime, getAge } = require("./date");

const logger = createLogger({
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
	transports: [
		new transports.Console(),
		new transports.File({ filename: path.join(__dirname, "..", "logs", "log.txt"), maxsize: 2000000, maxFiles: "1d" }),
	],
});

const wantedLists = {
	BADEN_WUERTTEMBERG: "https://fahndung.polizei-bw.de/",
	BAYERN: "https://www.polizei.bayern.de/fahndung/personen/unbekannte-straftaeter/index.html",
	BERLIN: "https://www.berlin.de/polizei/polizeimeldungen/gesuchte-personen/",
	BRANDENBURG: (...x) => `https://polizei.brandenburg.de/suche/typ/Fahndung/kategorie/Gesuchte%20Straft%C3%A4ter/${x[0]}/1`,
	BREMEN: "https://www.polizei.bremen.de/fahndung/unbekannte-taeter-22608",
	HESSEN: {
		KNOWN: "https://www.polizei.hessen.de/Fahndungen/Personen/Bekannte-Personen/",
		UNKNOWN: "https://www.polizei.hessen.de/Fahndungen/Personen/Unbekannte-Personen/",
	},
	MECKLENBURG_VORPOMMERN: (...x) => `https://www.polizei.mvnet.de/Presse/Fahndungen/Fahndungen-nach-Personen/?pager.items.offset=${x[0]}`,
	NRW: (...x) => `https://polizei.nrw/fahndungen?page=${x[0]}`,
	RHEINLAND_PFALZ: (...x) => `https://www.polizei.rlp.de/fahndung/personenfahndungen/seite-${x[0]}`,
	SCHLESWIG_HOLSTEIN: "https://www.schleswig-holstein.de/DE/landesregierung/ministerien-behoerden/POLIZEI/Fahndungen/startseite_taeterfahndung.html",
};
const missingLists = {
	BAYERN: "https://www.polizei.bayern.de/fahndung/personen/vermisste/index.html",
	BERLIN: "https://www.berlin.de/polizei/polizeimeldungen/vermisste/",
	BRANDENBURG: (...x) => `https://polizei.brandenburg.de/suche/typ/Fahndung/kategorie/Vermisste%20Personen/${x[0]}/1`,
	HESSEN: "https://www.polizei.hessen.de/Fahndungen/Personen/Vermisste-Personen/",
	SCHLESWIG_HOLSTEIN: "https://www.schleswig-holstein.de/DE/landesregierung/ministerien-behoerden/POLIZEI/Fahndungen/startseite_fahndung_vermisstePersonen.html",
};
const newsList = {
    BERLIN: (...x) => `https://www.berlin.de/polizei/polizeimeldungen/?page_at_1_6=${x[0]}`,
    BAYERN: "https://www.polizei.bayern.de/aktuelles/pressemitteilungen/index.html",
    BRANDENBURG: (...x) => `https://polizei.brandenburg.de/suche/typ/Meldungen/kategorie/null/${x[0]}/1`
}

const scrapePersonFunctions = [
	scrapeBadenWuerttembergList,
	scrapeBayernList,
	scrapeBerlinList,
	scrapeBrandenburgList,
	scrapeBremenWantedList,
	scrapeHessenList,
	scrapeMecklenburgVorpommernWantedList,
	scrapeNRWList,
	scrapeRheinlandPfalzList,
	scrapeSchleswigHolsteinList,
];
const scrapeNewsFunctions = [
    scrapeBerlinNewsList,
    scrapeBayernNewsList,
    scrapeBrandenburgNewsList
]

const PERSON_CRAWL_BACK_TO = 365 * 24 * 60 * 60 * 1000; // 1 year
const NEWS_CRAWL_BACK_TO = 90 * 24 * 60 * 60 * 1000; // 90 days



/**
 _____                              
|  __ \                             
| |__) |__ _ __ ___  ___  _ __  ___ 
|  ___/ _ \ '__/ __|/ _ \| '_ \/ __|
| |  |  __/ |  \__ \ (_) | | | \__ \
|_|   \___|_|  |___/\___/|_| |_|___/
*/
async function scrapeAllPersons() {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--ignore-certificate-errors"],
	});
	const page = await browser.newPage();
	await page.setViewport({
		width: 1920,
		height: 1080
	});

    logger.log({ level: "info", message: "Scraping persons..." });
    for (let fn of scrapePersonFunctions) {
	    try {
	        await fn(page)
	    } catch (err) {
	        logger.log({ level: 'error', message: `Etwas lief schief, während ${fn.name} ausgeführt wurde: ${err}` })
	    }
	}
    logger.log({ level: "info", message: "Finished scraping persons" });

	await browser.close();
}

/**
 * SCRAPE BADEN-WÜRTTEMBERG
 */
async function scrapeBadenWuerttembergList(page) {
	logger.log({ level: "info", message: "Scraping Baden-Württemberg..." });
    
    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Baden-Württemberg" }).select("crawledUrl -_id")).map(p => p.crawledUrl);
    const alreadyCrawledMissings = (await MissingPerson.find({ crawledFrom: "Baden-Württemberg" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

    // Crawl page
	await page.goto(wantedLists.BADEN_WUERTTEMBERG);
	const wantedPersonLinks = await page.$$eval("#grd_straftaeter > div > section > div > a", (anchors) => anchors.map((a) => a.href));
	const missingPersonLinks = await page.$$eval("#grd_vermisst > div > section > div > a", (anchors) => anchors.map((a) => a.href));

	for (let wantedPersonLink of wantedPersonLinks) {
		if (alreadyCrawledWanteds.includes(wantedPersonLink))
            continue;

		try {
			const person = await scrapeBadenWuerttembergWantedPerson(page, wantedPersonLink);
            await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
	for (let missingPersonLink of missingPersonLinks) {
		if (alreadyCrawledMissings.includes(missingPersonLink)) 
            continue;

		try {
			const person = await scrapeBadenWuerttembergMissingPerson(page, missingPersonLink);
            await MissingPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${missingPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeBadenWuerttembergWantedPerson(page, link) {
	await page.goto(link, { waitUntil: 'networkidle0' });

	let wantedPerson = {
		crawledFrom: "Baden-Württemberg",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime scene Infos
	const crimeSceneInfos = await page.$$eval(".tracing-detail .trace-location", (elements) =>
		elements.map((el) => el.textContent)
	);
	wantedPerson.crimeSceneLocation = crimeSceneInfos[0];
	wantedPerson.crimeSceneDateCrawled = crimeSceneInfos[1];

	// Crawl person details (if displayed)
	const neededPersonDetails = ["Geschlecht", "Grösse", "Alter"];
	const personDescriptionDetails = await page.evaluate(() => {
		const tableRows = Array.from(document.querySelectorAll(".mobile .collapse > .card-body > section"));
		if (!tableRows) return [];

		return tableRows.map((el) => ({
			key: el.querySelector("h2").textContent,
			value: el.querySelector("p").textContent,
		}));
	});

	for (let detail of personDescriptionDetails) {
		if (!neededPersonDetails.includes(detail.key)) 
            continue;

		switch (detail.key) {
			case "Geschlecht":
				wantedPerson.gender = detail.value.trim();
				break;
			case "Alter":
                wantedPerson.age = parseInt(detail.value) || null;
				break;
			case "Grösse":
				wantedPerson.height = parseInt(detail.value) || null;
				break;
			default:
				break;
		}
	}

	// Crawl text
	const text = await page.$eval(".container > .tracing-special", (el) => el.textContent);
	wantedPerson.description = text;

	return wantedPerson;
}

async function scrapeBadenWuerttembergMissingPerson(page, link) {
	await page.goto(link, { waitUntil: 'networkidle0' });

	let missingPerson = {
		crawledFrom: "Baden-Württemberg",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl act Infos
	const actInfos = await page.$$eval(".tracing-detail .trace-location", (elements) =>
		elements.map((el) => el.textContent)
	);
	missingPerson.lastSeenLocation = actInfos[0];
	missingPerson.lastSeenDateCrawled = actInfos[1];

	// Crawl person details (if displayed)
	const neededPersonDetails = ["Geschlecht", "Grösse", "Alter"];
	const personDescriptionDetails = await page.evaluate(() => {
		const tableRows = Array.from(document.querySelectorAll(".mobile .collapse > .card-body > section"));
		if (!tableRows) return [];

		return tableRows.map((el) => ({
			key: el.querySelector("h2").textContent,
			value: el.querySelector("p").textContent,
		}));
	});

	for (let detail of personDescriptionDetails) {
		if (!neededPersonDetails.includes(detail.key)) 
            continue;

		switch (detail.key) {
			case "Geschlecht":
				missingPerson.gender = detail.value.trim();
				break;
			case "Alter":
                missingPerson.age = parseInt(detail.value) || null;
				break;
			case "Grösse":
				missingPerson.height = parseInt(detail.value) || null;
				break;
			default:
				break;
		}
	}

	// Crawl text
	const text = await page.$eval(".container > .tracing-special", (el) => el.textContent);
	missingPerson.description = text;

	return missingPerson;
}

/**
 * SCRAPE BAYERN
 */
async function scrapeBayernList(page) {
	logger.log({ level: "info", message: "Scraping Bayern..." });

    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Bayern" }).select("crawledUrl -_id")).map(p => p.crawledUrl);
    const alreadyCrawledMissings = (await MissingPerson.find({ crawledFrom: "Bayern" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

	// Crawl wanted persons
	await page.goto(wantedLists.BAYERN);

	// Persons are stored in a variable called 'montagedata' in which the href's properties are relative paths (e.g. /fahndung/personen/123)
    const wantedPersonLinks = await page.evaluate((PERSON_CRAWL_BACK_TO) => {
        return window?.montagedata?.filter((person) => person.href.startsWith("/fahndung") && new Date(person.date).getTime() > Date.now() - PERSON_CRAWL_BACK_TO)?.map((person) => "https://www.polizei.bayern.de" + person.href) || [];
	}, PERSON_CRAWL_BACK_TO);
    
	for (let wantedPersonLink of wantedPersonLinks) {
        if (alreadyCrawledWanteds.includes(wantedPersonLink))
            continue;
    
        try {
            const person = await scrapeBayernWantedPerson(page, wantedPersonLink);
            await WantedPerson.create(person);
        } catch (err) {
            logger.log({
                level: "error",
                message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
            });
        }
	}

	// Crawl missing persons
	await page.goto(missingLists.BAYERN);

	// Persons are stored in a variable called 'montagedata' in which the href's properties are relative paths (e.g. /fahndung/personen/123)
	const missingPersonLinks = await page.evaluate((PERSON_CRAWL_BACK_TO) => {
		return window?.montagedata?.filter((person) => person.href.startsWith("/fahndung") && new Date(person.date).getTime() > Date.now() - PERSON_CRAWL_BACK_TO)?.map((person) => "https://www.polizei.bayern.de" + person.href) || [];
	}, PERSON_CRAWL_BACK_TO);

	for (let missingPersonLink of missingPersonLinks) {
		if (alreadyCrawledMissings.includes(missingPersonLink))
            continue;

		try {
			const person = await scrapeBayernMissingPerson(page, missingPersonLink);
			await MissingPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${missingPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeBayernWantedPerson(page, link) {
	await page.goto(link);

	let wantedPerson = {
		crawledFrom: "Bayern",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl details
	const neededDetails = ["Tatort", "Tatzeit", "Größe", "Geschätztes Alter"];
	const moreDetails = await page.evaluate(() => {
		const labelElements = Array.from(document.querySelectorAll(".bp-fahndung-container .bp-fahndung-label"));
		if (!labelElements) return [];

		return labelElements.map((el) => ({
			key: el.textContent,
			value: el.nextSibling.textContent?.trim(),
		}));
	});

	for (let detail of moreDetails) {
		if (!neededDetails.includes(detail.key)) continue;

		switch (detail.key) {
			case "Tatort":
				wantedPerson.crimeSceneLocation = detail.value.trim();
				break;
			case "Tatzeit":
				wantedPerson.crimeSceneDateCrawled = detail.value.trim();
				break;
			case "Größe":
				// Extract first number found in string
				wantedPerson.height = parseInt(detail.value.match(/\d+/)) || null;
				break;
			case "Geschätztes Alter":
				// Extract first number found in string
                wantedPerson.age = parseInt(detail.value.match(/\d+/)) || null;
				break;
			default:
				break;
		}
	}

	// Crawl text
	const text = await page.evaluate(() => {
		const textContainer = document.querySelectorAll(".bp-textblock-image .hyphens")[1]
		const description = [...Array.from(textContainer?.childNodes).map(el => el.textContent)].join("\n");

		return description;
	});

	wantedPerson.description = text;

	return wantedPerson;
}

async function scrapeBayernMissingPerson(page, link) {
	await page.goto(link);

	let missingPerson = {
		crawledFrom: "Bayern",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl details
	const neededDetails = ["Name", "Vorname", "Größe", "Geburtsdatum", "Geschlecht"];
	const moreDetails = await page.evaluate(() => {
		const labelElements = Array.from(document.querySelectorAll(".bp-fahndung-container .bp-fahndung-label"));
		if (!labelElements) return [];

		return labelElements.map((el) => ({
			key: el.textContent,
			value: el.nextSibling.textContent?.trim(),
		}));
	});

	for (let detail of moreDetails) {
		if (!neededDetails.includes(detail.key)) continue;

		switch (detail.key) {
			case "Name":
				missingPerson.lastName = detail.value.trim();
				break;
			case "Vorname":
				missingPerson.firstName = detail.value.trim();
				break;
			case "Größe":
				// Extract first number found in string
				missingPerson.height = parseInt(detail.value.match(/\d+/)) || null;
				break;
			case "Geburtsdatum":
				// Sometimes the birthdate is a date and sometimes the age
				if (detail.value.includes(".")) {
					const date = parseDate(detail.value.trim(), "dd.mm.yyyy", ".");
					missingPerson.age = getAge(date);
				} else {
                    missingPerson.age = parseInt(detail.value.match(/\d+/)) || null;
				}

				break;
			case "Geschlecht":
				missingPerson.gender = detail.value.trim().toLowerCase();
				break;
			default:
				break;
		}
	}

	// Crawl text
	const text = await page.evaluate(() => {
		const textContainer = document.querySelectorAll(".bp-textblock-image .hyphens")[1]
		const description = [...Array.from(textContainer?.childNodes).map(el => el.textContent)].join("\n");

		return description;
	});

	missingPerson.description = text;

	return missingPerson;
}

/**
 * SCRAPE BERLIN
 */
async function scrapeBerlinList(page) {
	logger.log({ level: "info", message: "Scraping Berlin..." });

    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Berlin" }).select("crawledUrl -_id")).map(p => p.crawledUrl);
    const alreadyCrawledMissings = (await MissingPerson.find({ crawledFrom: "Berlin" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

	// Crawl wanted persons
	await page.goto(wantedLists.BERLIN);

	const wantedPersonLinks = await page.$$eval("#layout-grid__area--maincontent .modul-autoteaser .modul-teaser a", (elements) => elements.map((el) => el.href));
	for (let wantedPersonLink of wantedPersonLinks) {
		if (alreadyCrawledWanteds.includes(wantedPersonLink)) 
            continue;

		try {
			const person = await scrapeBerlinWantedPerson(page, wantedPersonLink);
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}

	// Crawl missing persons
	await page.goto(missingLists.BERLIN);

	const missingPersonLinks = await page.$$eval("#layout-grid__area--maincontent .modul-autoteaser .modul-teaser a", (elements) => elements.map((el) => el.href));
	for (let missingPersonLink of missingPersonLinks) {
		if (alreadyCrawledMissings.includes(missingPersonLink)) 
            continue;

		try {
			const person = await scrapeBerlinMissingPerson(page, missingPersonLink);
			await MissingPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${missingPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeBerlinWantedPerson(page, link) {
	await page.goto(link);

	let wantedPerson = {
		crawledFrom: "Berlin",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl description (and remove the Nr. in the first line)
	const text = await page.evaluate(() => {
		const text = document.querySelector("#layout-grid__area--maincontent .text")?.textContent;
		const backupText = document.querySelector("#layout-grid__area--maincontent .textile")?.textContent;

		return text || backupText;
	});
	const match = text.match(/Nr\. (\d+)\s*([\s\S]*)/);
	if (match && match[2]) {
		wantedPerson.description = match[2].trim();
	} else {
		wantedPerson.description = text;
	}

	return wantedPerson;
}

async function scrapeBerlinMissingPerson(page, link) {
	await page.goto(link);

	let missingPerson = {
		crawledFrom: "Berlin",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl details
	const text = await page.$eval("#layout-grid__area--maincontent .text", (el) => el.textContent);
	const match = text.match(/Nr\. (\d+)\s*([\s\S]*)/);
	if (match && match[2]) {
		missingPerson.description = match[2].trim();
	} else {
		missingPerson.description = text;
	}

	return missingPerson;
}

/**
 * SCRAPE BRANDENBURG
 */
async function scrapeBrandenburgList(page) {
	logger.log({ level: "info", message: "Scraping Brandenburg..." });

    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Brandenburg" }).select("crawledUrl -_id")).map(p => p.crawledUrl);
    const alreadyCrawledMissings = (await MissingPerson.find({ crawledFrom: "Brandenburg" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

	// Crawl wanted persons
    let alreadyCrawledCount = 0;
	let currentPage = 1;
	let pageFound = true;
    let tooManyRecrawls = false;
	let wantedPersonLinks = new Set();

	// Activate 50 results per pages by going to this page first
	await page.goto("https://polizei.brandenburg.de/suche/typ/Fahndung/kategorie/Gesuchte%20Straft%C3%A4ter/limit/50?fullResultList=1");

	while (pageFound && !tooManyRecrawls) {
		await page.goto(wantedLists.BRANDENBURG(currentPage));

        let pageLinks = await page.evaluate(() => {
            const links = []
            const pageItems = document.querySelectorAll("#pbb-search-result-pager > .pbb-searchlist > li")
        
            for (let item of pageItems) {
                const date = item.querySelector("p span").childNodes[0]?.textContent;
                const link = item.querySelector("a").href;

                links.push({ date, link })
            }

            return links;
        }) 
		pageLinks = pageLinks.filter(p => parseDate(p.date, "dd.mm.yyyy", ".") > Date.now() - PERSON_CRAWL_BACK_TO).map(l => l.link);
        
        pageLinks.forEach((link) => {
            if (!alreadyCrawledWanteds.includes(link))
                wantedPersonLinks.add(link);
            else
                alreadyCrawledCount += 1;
        });

		currentPage++;
		if (pageLinks.length === 0) 
            pageFound = false;
        else if (alreadyCrawledCount >= 10)
            tooManyRecrawls = true;
	}

	for (let wantedPersonLink of wantedPersonLinks) {
		try {
			const person = await scrapeBrandenburgWantedPerson(page, wantedPersonLink);
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}

	// Crawl missing persons
    alreadyCrawledCount = 0;
	currentPage = 1;
	pageFound = true;
    tooManyRecrawls = false;
	let missingPersonLinks = new Set();

	// Activate 50 results per pages by going to this page first
	await page.goto("https://polizei.brandenburg.de/suche/typ/Fahndung/kategorie/Vermisste%20Personen/limit/50?fullResultList=1");

	while (pageFound && !tooManyRecrawls) {
		await page.goto(missingLists.BRANDENBURG(currentPage));

        let pageLinks = await page.evaluate(() => {
            const links = []
            const pageItems = document.querySelectorAll("#pbb-search-result-pager > .pbb-searchlist > li")
        
            for (let item of pageItems) {
                const date = item.querySelector("p span").childNodes[0]?.textContent;
                const link = item.querySelector("a").href;

                links.push({ date, link })
            }

            return links;
        }) 
        pageLinks = pageLinks.filter(p => parseDate(p.date, "dd.mm.yyyy", ".") > Date.now() - PERSON_CRAWL_BACK_TO).map(l => l.link);

		pageLinks.forEach((link) => {
            if (!alreadyCrawledMissings.includes(link))
                missingPersonLinks.add(link);
            else
                alreadyCrawledCount += 1;
        });

		currentPage++;
		if (pageLinks.length === 0) 
            pageFound = false;
        else if (alreadyCrawledCount >= 10)
            tooManyRecrawls = true;
	}

	for (let missingPersonLink of missingPersonLinks) {
		try {
			const person = await scrapeBrandenburgMissingPerson(page, missingPersonLink);
			await MissingPerson.create(person);
		} catch (err) {
            logger.log({
				level: "error",
				message: `Etwas lief schief, während ${missingPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeBrandenburgWantedPerson(page, link) {
	await page.goto(link);

	let wantedPerson = {
		crawledFrom: "Brandenburg",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime details
	const crimeSceneLocation = await page.$eval("#pbb-article .pbb-ort", (el) => el.textContent);
	const crimeSceneDateCrawled = await page.evaluate(() => {
		const main = document.querySelector("#pbb-article .pbb-article-text > p:first-child span strong")?.textContent;
		if (main && main.includes("Tatzeit")) {
			return main.split("Tatzeit:")[1]?.trim();
		} else {
			return document.querySelector('#pbb-article #pbb-metadata dd[data-iw-field="datum"]')?.textContent;
		}
	});

	wantedPerson.crimeSceneLocation = crimeSceneLocation;
	wantedPerson.crimeSceneDateCrawled = crimeSceneDateCrawled;

	// Crawl description
	const text = await page.$eval("#pbb-article .pbb-article-text", (el) => el.textContent);
	wantedPerson.description = text;

	return wantedPerson;
}

async function scrapeBrandenburgMissingPerson(page, link) {
	await page.goto(link);

	let missingPerson = {
		crawledFrom: "Brandenburg",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime details
	const crimeSceneLocation = await page.$eval("#pbb-article .pbb-ort", (el) => el.textContent);
	const crimeSceneDateCrawled = await page.evaluate(() => {
		const main = document.querySelector("#pbb-article .pbb-article-text > p:first-child span strong")?.textContent;
		if (main && main.includes("Tatzeit")) {
			return main.split("Tatzeit:")[1]?.trim();
		} else {
			return document.querySelector('#pbb-article #pbb-metadata dd[data-iw-field="datum"]')?.textContent;
		}
	});

	missingPerson.crimeSceneLocation = crimeSceneLocation;
	missingPerson.crimeSceneDateCrawled = crimeSceneDateCrawled;

	// Crawl description
	const text = await page.$eval("#pbb-article .pbb-article-text", (el) => el.textContent);
	missingPerson.description = text;

	return missingPerson;
}

/**
 * SCRAPE BREMEN (ONLY WANTED LIST AVAILABLE, ALL IN ONE PAGE)
 */
async function scrapeBremenWantedList(page) {
	logger.log({ level: "info", message: "Scraping Bremen..." });
	
    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Bremen" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

    // Crawl wanted persons
    await page.goto(wantedLists.BREMEN);

	const wantedPersons = await page.evaluate((url) => {
		const personWrappers = document.querySelectorAll(".centerframe .article .main_article .entry-wrapper-1col");
		const wantedPersons = [];

		for (let personWrapper of personWrappers) {
			const wantedPerson = {
				crawledFrom: "Bremen",
				crawledUrl: url,
				submitTipLink: url,
			};

			// Crawl crime details
			const crimeSceneInfos = personWrapper.querySelectorAll("p")[1];
			const crimeSceneDateCrawled = crimeSceneInfos?.lastChild?.textContent?.split("Zeit: ")[1]?.trim();
			const crimeSceneLocation = crimeSceneInfos?.firstChild?.textContent?.split("Ort: ")[1]?.trim();

			wantedPerson.crimeSceneDateCrawled = crimeSceneDateCrawled;
			wantedPerson.crimeSceneLocation = crimeSceneLocation;

			// Crawl text
			const text = Array.from(personWrapper.querySelectorAll("p")).slice(2).map((el) => el.textContent).join("\n");
			wantedPerson.description = text;

			wantedPersons.push(wantedPerson);
		}

		return wantedPersons;
	}, wantedLists.BREMEN);

	for (let person of wantedPersons) {
		if (alreadyCrawledWanteds.includes(person.crawledUrl)) 
            continue;

		try {
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${person.crawledUrl} gecrawlt wurde: ${err}`,
			});
		}
	}
}

/**
 * SCRAPE HESSEN
 */
async function scrapeHessenList(page) {
	logger.log({ level: "info", message: "Scraping Hessen..." });

    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Hessen" }).select("crawledUrl -_id")).map(p => p.crawledUrl);
    const alreadyCrawledMissings = (await MissingPerson.find({ crawledFrom: "Hessen" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

	// Crawl wanted (known) persons
	await page.goto(wantedLists.HESSEN.KNOWN);

	// Hessen's wanted list also contains foreign wanted persons which we filter out
	const knownWantedPersonLinks = await page.$$eval("#content #loadmoreContainer div article a", (elements) => elements.filter((el) => el.parentElement.nodeName === "H2").map((el) => el.href));
	const onlyHessenKnownWantedPersonLinks = knownWantedPersonLinks.filter((link) => {
		const url = new URL(link);
		return url.host === "www.polizei.hessen.de";
	});

	for (let wantedPersonLink of onlyHessenKnownWantedPersonLinks) {
		if (alreadyCrawledWanteds.includes(wantedPersonLink)) 
            continue;

		try {
			const person = await scrapeHessenWantedPerson(page, wantedPersonLink);
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}

	// Crawl wanted (unknown) persons
	let moreAvailable = true;

	await page.goto(wantedLists.HESSEN.UNKNOWN);
	await page.waitForSelector("#loadMoreButton");

	while (moreAvailable) {
		await page.click("#loadMoreButton");
		moreAvailable = await page.$eval("#loadMoreButton", (el) => el.nodeName === "A");
	}

	// Hessen's wanted list also contains foreign wanted persons which we filter out
	const unknownWantedPersonLinks = await page.$$eval("#content #loadmoreContainer div article a", (elements) => elements.filter((el) => el.parentElement.nodeName === "H2").map((el) => el.href));
	const onlyHessenUnknownWantedPersonLinks = unknownWantedPersonLinks.filter((link) => {
		const url = new URL(link);
		return url.host === "www.polizei.hessen.de";
	});

	for (let wantedPersonLink of onlyHessenUnknownWantedPersonLinks) {
		if (alreadyCrawledWanteds.includes(wantedPersonLink)) 
            continue;

		try {
			const person = await scrapeHessenWantedPerson(page, wantedPersonLink);
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}

	// Crawl missing persons
	moreAvailable = true;

	await page.goto(missingLists.HESSEN);
	await page.waitForSelector("#loadMoreButton");

	while (moreAvailable) {
		await page.click("#loadMoreButton");
		moreAvailable = await page.$eval("#loadMoreButton", (el) => el.nodeName === "A");
	}

	const missingPersonLinks = await page.$$eval("#content #loadmoreContainer div article a", (elements) => elements.filter((el) => el.parentElement.nodeName === "H2").map((el) => el.href));
	const onlyHessenMissingPersonLinks = missingPersonLinks.filter((link) => {
		const url = new URL(link);
		return url.host === "www.polizei.hessen.de";
	});

	for (let missingPersonLink of onlyHessenMissingPersonLinks) {
		if (alreadyCrawledMissings.includes(missingPersonLink)) 
            continue;

		try {
			const person = await scrapeHessenMissingPerson(page, missingPersonLink);
			await MissingPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${missingPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeHessenWantedPerson(page, link) {
	await page.goto(link);

	let wantedPerson = {
		crawledFrom: "Hessen",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime details
	const crimeSceneDetails = await page.$eval("#detail article .dachzeile", (el) => el.textContent.split(" | "));
    wantedPerson.crimeSceneLocation = crimeSceneDetails[1];
	wantedPerson.crimeSceneDateCrawled = crimeSceneDetails[0];

	// Crawl description
	const text = await page.$eval("#detail .maincontenttext", (el) => el.textContent);
	wantedPerson.description = text;

	return wantedPerson;
}

async function scrapeHessenMissingPerson(page, link) {
	await page.goto(link);

	let missingPerson = {
		crawledFrom: "Hessen",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime details
	const crimeSceneDetails = await page.$eval("#detail article .dachzeile", (el) => el.textContent.split(" | "));
	missingPerson.crimeSceneLocation = crimeSceneDetails[1];
	missingPerson.crimeSceneDateCrawled = crimeSceneDetails[0];

	// Crawl description
	const text = await page.$eval("#detail .maincontenttext", (el) => el.textContent);
	missingPerson.description = text;

	return missingPerson;
}

/**
 * SCRAPE MECKLENBURG-VORPOMMERN (ONLY WANTED LIST AVAILABLE)
 */
async function scrapeMecklenburgVorpommernWantedList(page) {
	logger.log({ level: "info", message: "Scraping Mecklenburg-Vorpommern..." });

    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Mecklenburg-Vorpommern" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

	// Per page 10 items (= offset)
    let alreadyCrawledCount = 0;
	let pageOffset = 0;
	let pageNotEmpty = true;
	let wantedPersonLinks = [];

	while (pageNotEmpty) {
		await page.goto(wantedLists.MECKLENBURG_VORPOMMERN(pageOffset));

		pageNotEmpty = await page.evaluate(() => {
			const noMatchesFoundElement = document.querySelector(".element .resultlist .element.emptylist");

			return !Boolean(noMatchesFoundElement);
		});

		if (pageNotEmpty) {
            let scrapedLinks = await page.evaluate(() => {
                const containerElements = document.querySelectorAll(".element .resultlist .teaser .teaser_text")
                const links = [];

                containerElements.forEach((el) => {
                    const date = el.querySelector(".teaser_meta .dtstart").textContent;
                    const link = el.querySelector("h3 a").href;

                    links.push({ date, link })
                })

                return links;
            })
            scrapedLinks = scrapedLinks.filter(p => parseDate(p.date, "dd.mm.yyyy", ".") > Date.now() - PERSON_CRAWL_BACK_TO).map(l => l.link);

            scrapedLinks.forEach(link => {
                if (!alreadyCrawledWanteds.includes(link))
                    wantedPersonLinks.push(link)
                else
                    alreadyCrawledCount += 1
            })

			pageOffset += 10;
            if (scrapedLinks.length === 0 || alreadyCrawledCount > 10)
                pageNotEmpty = false;
		}
	}

	for (let wantedPersonLink of wantedPersonLinks) {
		try {
			const person = await scrapeMecklenburgVorpommernWantedPerson(page, wantedPersonLink);
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeMecklenburgVorpommernWantedPerson(page, link) {
	await page.goto(link);

	let wantedPerson = {
		crawledFrom: "Nordrhein-Westfalen",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime details
	wantedPerson.crimeSceneLocation = await page.$eval("#page .element .absatz .teaser_meta span:last-child", (el) => el.textContent.split("Polizeipräsidium ")[1]);
	wantedPerson.crimeSceneDateCrawled = await page.$eval("#page .element .absatz .teaser_meta .dtstart", (el) => el.textContent);

	// Crawl description
	const text = await page.$$eval("#page .element .absatz p", (elements) => elements.map((el) => el.textContent).join("\n"));
	wantedPerson.description = text;

	return wantedPerson;
}

/**
 * SCRAPE NRW
 */
async function scrapeNRWList(page) {
	logger.log({ level: "info", message: "Scraping Nordrhein-Westfalen..." });

    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Nordrhein-Westfalen" }).select("crawledUrl -_id")).map(p => p.crawledUrl);
    const alreadyCrawledMissings = (await MissingPerson.find({ crawledFrom: "Nordrhein-Westfalen" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

	let pageNumber = 0;
	let pageNotEmpty = true;
	let wantedPersonLinks = [];
	let missingPersonLinks = [];

	// Crawl wanted and missing persons
	while (pageNotEmpty) {
		await page.goto(wantedLists.NRW(pageNumber));

		const wantedAndMissingPersonLinks = await page.evaluate(() => {
			const wantedPersons = [];
			const missingPersons = [];

			const persons = document.querySelectorAll("#block-police-content .views-element-container .view-content .views-row .related-manhunt-data");
			for (let person of persons) {
				const personType = person.querySelector(".manhunt-cat")?.textContent;
				const personUrl = person.querySelector(".manhunt-title a")?.href;

				if (personType.includes("Gegenstände") || personUrl.startsWith("https://www.polizei.mvnet.de")) 
                    continue;
				else if (personType.includes("Vermisste")) 
                    missingPersons.push(personUrl);
				else 
                    wantedPersons.push(personUrl);
			}

			return [wantedPersons, missingPersons];
		});

		if (wantedAndMissingPersonLinks[0].length === 0 && wantedAndMissingPersonLinks[1].length === 0) {
			pageNotEmpty = false;
		} else {
			wantedPersonLinks = [...wantedPersonLinks, ...wantedAndMissingPersonLinks[0]];
			missingPersonLinks = [...missingPersonLinks, ...wantedAndMissingPersonLinks[1]];
			pageNumber++;
		}
	}

	for (let wantedPersonLink of wantedPersonLinks) {
        if (alreadyCrawledWanteds.includes(wantedPersonLink))
            continue;

		try {
			const person = await scrapeNRWWantedPerson(page, wantedPersonLink);
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}

	for (let missingPersonLink of missingPersonLinks) {
        if (alreadyCrawledMissings.includes(missingPersonLink))
            continue;

		try {
			const person = await scrapeNRWMissingPerson(page, missingPersonLink);
			await MissingPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${missingPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeNRWWantedPerson(page, link) {
	await page.goto(link);

	let wantedPerson = {
		crawledFrom: "Nordrhein-Westfalen",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime details
	const isKnownText = await page.$eval("#block-police-content .intro-block .field .field__item a:first-child",(el) => el.textContent);
	wantedPerson.isUnknown = !isKnownText.includes("Bekannte Tatverdächtige");

	const personDetails = await page.evaluate(() => {
		const crimeSceneDateCrawled = document.querySelector("#block-police-content .informationzen_zur_tat .date-wrapper-manhunt .field__item")?.textContent;
		const crimeSceneLocation = document.querySelector("#block-police-content .informationzen_zur_tat .location-wrapper-manhunt .field__item")?.textContent;
		const gender = document.querySelector("#block-police-content .informationzen_zur_person .field--name-field-manhunt-gender .field__item")?.textContent;
		const heightText = document.querySelector("#block-police-content .informationzen_zur_person field--name-field-manhunt-height .field__item")?.textContent;
		const height = parseInt(heightText?.match(/\d+/)) || null;
		const appearance = document.querySelector("#block-police-content .beschreibung_der_person field--name-field-mahunt-special-features .field__item")?.textContent?.split(", ");

		return { crimeSceneDateCrawled, crimeSceneLocation, gender, height, appearance };
	});
	wantedPerson = { ...wantedPerson, ...personDetails };

	// Crawl description
	const text = await page.$eval("#block-police-content .body-text-wrap .text-formatted.field__item", (el) => el.textContent);
	wantedPerson.description = text;

	return wantedPerson;
}

async function scrapeNRWMissingPerson(page, link) {
	await page.goto(link);

	let missingPerson = {
		crawledFrom: "Nordrhein-Westfalen",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl details
	const personDetails = await page.evaluate(() => {
		const lastSeenDateCrawled = document.querySelector("#block-police-content .informationzen_zur_person .field--name-field-manhunt-missing-since .field__item")?.textContent;
		const lastSeenLocation = document.querySelector("#block-police-content .intro-block .field__item .second-title")?.textContent?.split(" - ")[0];

		const gender = document.querySelector("#block-police-content .beschreibung_der_person .field--name-field-manhunt-gender .field__item")?.textContent;
		const heightText = document.querySelector("#block-police-content .beschreibung_der_person field--name-field-manhunt-height .field__item")?.textContent;
		const height = parseInt(heightText?.match(/\d+/)) || null;
		const appearance = document.querySelector("#block-police-content .beschreibung_der_person field--name-field-mahunt-special-features .field__item")?.textContent?.split(", ");

		return { lastSeenDateCrawled, lastSeenLocation, gender, height, appearance };
	});
	missingPerson = { ...missingPerson, ...personDetails };

	// Crawl description
	const text = await page.$eval("#block-police-content .body-text-wrap .text-formatted.field__item", (el) => el.textContent);
	missingPerson.description = text;

	return missingPerson;
}

/**
 * SCRAPE RHEINLAND-PFALZ
 */
async function scrapeRheinlandPfalzList(page) {
	logger.log({ level: "info", message: "Scraping Rheinland-Pfalz..." });

    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Rheinland-Pfalz" }).select("crawledUrl -_id")).map(p => p.crawledUrl);
    const alreadyCrawledMissings = (await MissingPerson.find({ crawledFrom: "Rheinland-Pfalz" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

	let pageNumber = 1;
	let pageNotEmpty = true;
    let pageTooOld = false;
	let wantedPersonLinks = [];
	let missingPersonLinks = [];

	// Crawl wanted and missing persons
	while (pageNotEmpty && !pageTooOld) {
		await page.goto(wantedLists.RHEINLAND_PFALZ(pageNumber));

		let wantedAndMissingPersonLinks = await page.evaluate(() => {
			const wantedPersons = [];
			const missingPersons = [];

			const personElements = document.querySelectorAll(".news-list-view ul li.list-group-item");
			for (let personElement of personElements) {                
                const date = personElement.querySelector(".subtitle .date").textContent
                const isMissingPerson = personElement.querySelector("h2")?.textContent?.toLowerCase()?.includes("vermisst");
                const personUrl = personElement.querySelector("a").href;

				if (isMissingPerson) 
                    missingPersons.push({ date, personUrl });
				else 
                    wantedPersons.push({ date, personUrl });
			}

			return [wantedPersons, missingPersons];
		}, alreadyCrawledWanteds, alreadyCrawledMissings);

        const currentPageWantedPersonLinks = wantedAndMissingPersonLinks[0].filter(p => {
            const isPageTooOld = parseDate(p.date, "dd.mm.yyyy", ".") < Date.now() - PERSON_CRAWL_BACK_TO;
            if (isPageTooOld)
                pageTooOld = true;

            return !alreadyCrawledWanteds.includes(p.personUrl) && !pageTooOld;
        })

        const currentPageMissingPersonLinks = wantedAndMissingPersonLinks[1].filter(p => {
            const isPageTooOld = parseDate(p.date, "dd.mm.yyyy", ".") < Date.now() - PERSON_CRAWL_BACK_TO;
            if (isPageTooOld)
                pageTooOld = true;

            return !alreadyCrawledMissings.includes(p.personUrl) && !pageTooOld;
        })

		if (currentPageWantedPersonLinks.length === 0 && currentPageMissingPersonLinks.length === 0) {
			pageNotEmpty = false;
		} else {
			wantedPersonLinks = [...wantedPersonLinks, ...currentPageWantedPersonLinks.map(p => p.personUrl)];
			missingPersonLinks = [...missingPersonLinks, ...currentPageMissingPersonLinks.map(p => p.personUrl)];
			pageNumber++;
		}
	}

	for (let wantedPersonLink of wantedPersonLinks) {
		try {
			const person = await scrapeRheinlandPfalzWantedPerson(page, wantedPersonLink);
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}

	for (let missingPersonLink of missingPersonLinks) {
		try {
			const person = await scrapeRheinlandPfalzMissingPerson(page, missingPersonLink);
			await MissingPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${missingPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeRheinlandPfalzWantedPerson(page, link) {
	await page.goto(link);

	let wantedPerson = {
		crawledFrom: "Rheinland-Pfalz",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime details
	const personDetails = await page.evaluate(() => {
		const person = {};

		const container = document.querySelector("main .article .article-content .row:last-child > div > .row > .fahndung-information");
		const description = Array.from(container.querySelectorAll("div"))?.slice(0, 3)?.map((el) => el.textContent)?.join("\n");
		const detailElements = Array.from(container.querySelectorAll("div"))?.slice(2);
		person.description = description;

		for (let detailElement of detailElements) {
			const key = detailElement.querySelector("h4")?.textContent;
			const value = detailElement.querySelector("p")?.textContent;

			switch (key) {
				case "Tatort":
					person.crimeSceneLocation = value;
					break;
				case "Tatzeit":
					person.crimeSceneDateCrawled = value;
					break;
				case "Delikt / Grund":
					person.offenses = value?.split(", ");
					break;
				default:
					break;
			}
		}

		return person;
	});

	wantedPerson = { ...wantedPerson, ...personDetails };

	return wantedPerson;
}

async function scrapeRheinlandPfalzMissingPerson(page, link) {
	await page.goto(link);

	let missingPerson = {
		crawledFrom: "Rheinland-Pfalz",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl crime details
	const personDetails = await page.evaluate(() => {
		const person = {};

		const containers = Array.from(document.querySelectorAll("main .article .article-content .row:last-child > div > .row > .fahndung-information div"));
		const description = containers.slice(0, 3).map((el) => el.textContent).join("\n");
		const detailElements = containers.slice(2);
		person.description = description;

		for (let detailElement of detailElements) {
			const key = detailElement.querySelector("h4")?.textContent;
			const value = detailElement.querySelector("p")?.textContent;

			switch (key) {
				case "Tatort":
					person.lastSeenLocation = value;
					break;
				case "Tatzeit":
					person.lastSeenDateCrawled = value;
					break;
				default:
					break;
			}
		}

		return person;
	});

	missingPerson = { ...missingPerson, ...personDetails };

	return missingPerson;
}

/**
 * SCRAPE SCHLESWIG-HOLSTEIN
 */
async function scrapeSchleswigHolsteinList(page) {
	logger.log({ level: "info", message: "Scraping Schleswig-Holstein..." });

    // Get already crawled Persons
    const alreadyCrawledWanteds = (await WantedPerson.find({ crawledFrom: "Schleswig-Holstein" }).select("crawledUrl -_id")).map(p => p.crawledUrl);
    const alreadyCrawledMissings = (await MissingPerson.find({ crawledFrom: "Schleswig-Holstein" }).select("crawledUrl -_id")).map(p => p.crawledUrl);

	// Crawl wanted persons
    let alreadyCrawledCount = 0;
	let nextPageBtnVisisble = true;
	let wantedPersonLinks = [];
	await page.goto(wantedLists.SCHLESWIG_HOLSTEIN);

	while (nextPageBtnVisisble) {
		const currentPageLinksAndCounter = await page.evaluate((alreadyCrawledWanteds) => {
			let alreadyCrawledCount = 0;
			const tableRows = document.querySelectorAll("table.c-table-dateandtitle tbody tr");
            const links = [];

			for (let tableRow of tableRows) {
				const link = tableRow.querySelector("a")?.href;

				if (!alreadyCrawledWanteds.includes(link))
                    links.push(link);
                else 
                    alreadyCrawledCount += 1;
			}

			return [links, alreadyCrawledCount];
		}, alreadyCrawledWanteds);

        alreadyCrawledCount += currentPageLinksAndCounter[1];
		wantedPersonLinks = [...wantedPersonLinks, ...currentPageLinksAndCounter[0]];
		nextPageBtnVisisble = await page.evaluate(() => {
			const nextPageBtn = document.querySelector(".c-nav-index__item.c-nav-index__item--next");
			return Boolean(nextPageBtn);
		});

        if (alreadyCrawledCount < 10)
            nextPageBtnVisisble = false;

		if (nextPageBtnVisisble) {
			const nextPageUrl = await page.$eval(".c-nav-index__item.c-nav-index__item--next > a", (el) => el.href);
			await page.goto(nextPageUrl);
		}
	}

	for (let wantedPersonLink of wantedPersonLinks) {
		try {
			const person = await scrapeSchleswigHolsteinWantedPerson(page, wantedPersonLink);
			await WantedPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${wantedPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}

	// Crawl missing persons
	let missingPersonLinks = [];
    alreadyCrawledCount = 0;
	nextPageBtnVisisble = true;
	await page.goto(missingLists.SCHLESWIG_HOLSTEIN);

	while (nextPageBtnVisisble) {
		const currentPageLinksAndCounter = await page.evaluate((alreadyCrawledMissings) => {
            let alreadyCrawledCount = 0;
			const tableRows = document.querySelectorAll("table.c-table-dateandtitle tbody tr");
			const links = [];

			for (let tableRow of tableRows) {
				const link = tableRow.querySelector("a")?.href;

				if (!alreadyCrawledMissings.includes(link))
                    links.push(link);
                else 
                    alreadyCrawledCount += 1;
			}

			return [links, alreadyCrawledCount];
		}, alreadyCrawledMissings);

        alreadyCrawledCount += currentPageLinksAndCounter[1];
		missingPersonLinks = [...missingPersonLinks, ...currentPageLinksAndCounter[0]];
		nextPageBtnVisisble = await page.evaluate(() => {
			const nextPageBtn = document.querySelector(".c-nav-index__item.c-nav-index__item--next");
			return Boolean(nextPageBtn);
		});

        if (alreadyCrawledCount < 10)
            nextPageBtnVisisble = false;

		if (nextPageBtnVisisble) {
			const nextPageUrl = await page.$eval(".c-nav-index__item.c-nav-index__item--next > a", (el) => el.href);
			await page.goto(nextPageUrl);
		}
	}

	for (let missingPersonLink of missingPersonLinks) {
        try {
			const person = await scrapeSchleswigHolsteinMissingPerson(page, missingPersonLink);
            await MissingPerson.create(person);
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während ${missingPersonLink} gecrawlt wurde: ${err}`,
			});
		}
	}
}

async function scrapeSchleswigHolsteinWantedPerson(page, link) {
	await page.goto(link);

	let wantedPerson = {
		crawledFrom: "Schleswig-Holstein",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl description
	const text = await page.$eval("#content .s-richtext.js-richtext", (el) => el.textContent);
	wantedPerson.description = text;

	return wantedPerson;
}

async function scrapeSchleswigHolsteinMissingPerson(page, link) {
	await page.goto(link);

	let missingPerson = {
		crawledFrom: "Schleswig-Holstein",
		crawledUrl: link,
		submitTipLink: link,
	};

	// Crawl description
	const text = await page.$eval("#content .s-richtext.js-richtext", (el) => el.textContent);
	missingPerson.description = text;

	return missingPerson;
}




/**
 _   _                   
| \ | |                  
|  \| | _____      _____ 
| . ` |/ _ \ \ /\ / / __|
| |\  |  __/\ V  V /\__ \
|_| \_|\___| \_/\_/ |___/
 */
async function scrapeAllNews() {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--ignore-certificate-errors"],
	});
	const page = await browser.newPage();
	await page.setViewport({
		width: 1920,
		height: 1080
	});

    logger.log({ level: "info", message: "Scraping News..." });
	for (let fn of scrapeNewsFunctions) {
	    try {
	        await fn(page)
	    } catch (err) {
	        logger.log({ level: 'error', message: `Etwas lief schief, während ${fn.name} ausgeführt wurde: ${err}` })
	    }
	}
    logger.log({ level: "info", message: "Finished scraping News" });

	await browser.close();
}

/**
 * SCRAPE BERLIN
 */
async function scrapeBerlinNewsList(page) {
	logger.log({ level: "info", message: "Scraping Berlin News..." });

    // Get already crawled News
    const alreadyCrawledNews = (await NewsPost.find({ crawledFrom: "Berlin" }).select("link -_id")).map(p => p.link);

    let allNews = []
	let pageNumber = 1;
    let pageNotEmpty = true;
    
    while (pageNotEmpty) {
        await page.goto(newsList.BERLIN(pageNumber));

        let currentPageNews = await page.evaluate(() => {            
            return Array.from(document.querySelectorAll("#layout-grid__area--maincontent ul.list--tablelist li")).map(el => {
                const date = el.querySelector(".cell.date")?.textContent
                const title = el.querySelector(".cell.text a")?.textContent
                const link = el.querySelector(".cell.text a")?.href
                const location = el.querySelector(".cell.text span")?.textContent?.split("Ereignisort: ")[1]

                return {
                    crawledFrom: "Berlin",
                    date,
                    title,
                    link,
                    location
                }
            })
        })

        if (currentPageNews.length > 0) {
            currentPageNews = currentPageNews.filter((newsPost) => !alreadyCrawledNews.includes(newsPost.link)).map(n => ({ ...n, date: parseDateTime(n.date, "dd.mm.yyyy hh:mi", ".", ":") }))
            allNews = [...allNews, ...currentPageNews]
            pageNumber++;
        } else {
            pageNotEmpty = false;
        }
    }

    if (allNews.length > 0) {
        try {
			await NewsPost.insertMany(allNews, { ordered: false });
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während die Berlin News inseriert wurden: ${err}`,
			});
		}
    }
}

/**
 * SCRAPE BAYERN
 */
async function scrapeBayernNewsList(page) {
	logger.log({ level: "info", message: "Scraping Bayern News..." });

    // Get already crawled News
    const alreadyCrawledNews = (await NewsPost.find({ crawledFrom: "Bayern" }).select("link -_id")).map(p => p.link);

    // Crawl news
    await page.goto(newsList.BAYERN);

    let allNews = await page.evaluate(() => {            
        return window.montagedata?.map((newsPost) => ({
            crawledFrom: "Bayern",
            date: newsPost.date,
            title: newsPost.title,
            link: "https://www.polizei.bayern.de" + newsPost.href,
            description: newsPost.teaser ? newsPost.teaser.slice(0, 250).trim().concat("...") : null,
            location: newsPost.organization?.name
        }))
    })

    allNews = allNews.filter((newsPost) => !alreadyCrawledNews.includes(newsPost.link) && new Date(newsPost.date).getTime() > Date.now() - NEWS_CRAWL_BACK_TO)

    if (allNews.length > 0) {
        try {
			await NewsPost.insertMany(allNews, { ordered: false });
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während die Bayern News inseriert wurden: ${err}`,
			});
		}
    }
}

/**
 * SCRAPE BRANDENBURG
 */
async function scrapeBrandenburgNewsList(page) {
	logger.log({ level: "info", message: "Scraping Brandenburg News..." });

    // Get already crawled News
    const alreadyCrawledNews = (await NewsPost.find({ crawledFrom: "Brandenburg" }).select("link -_id")).map(p => p.link);

    // Crawl news
    let allNews = []
	let pageNumber = 1;
    let pageNotEmpty = true;
    let newsAreTooOld = false;
    
    while (pageNotEmpty && !newsAreTooOld) {
        // Make first visit to following link to activate 50 results per page
        if (pageNumber === 1) {
            await page.goto("https://polizei.brandenburg.de/suche/typ/Meldungen/kategorie/null/limit/50?fullResultList=1")
        } else {
            await page.goto(newsList.BRANDENBURG(pageNumber));
        }

        let currentPageNews = await page.evaluate(() => {            
            const pageNews = []
            const pageItems = document.querySelectorAll("#pbb-subcontent ul.pbb-searchlist li")

            pageItems.forEach(el => {
                const dateEl = el.querySelector("p span").childNodes[0].textContent;
                if (dateEl.includes("Termin")) 
                    return;

                const date = dateEl.split("Artikel vom")[1].trim();
                const title = el.querySelector("h4 a strong").textContent;
                const link = el.querySelector("h4 a").href;
                const location = el.querySelector("p span a")?.textContent || "Brandenburg";
    
                pageNews.push({
                    crawledFrom: "Brandenburg",
                    date,
                    title,
                    link,
                    location
                })
            })

            return pageNews;
        })

        currentPageNews = currentPageNews.map((newsPost) => ({
            ...newsPost,
            date: parseDate(newsPost.date, "dd.mm.yyyy", ".")
        })).filter(newsPost => !alreadyCrawledNews.includes(newsPost.link) && new Date(newsPost.date).getTime() > Date.now() - NEWS_CRAWL_BACK_TO);

        if (currentPageNews.length > 0) {
            allNews = [...allNews, ...currentPageNews]
            pageNumber++;
        } else {
            pageNotEmpty = false;
        }
    }

    if (allNews.length > 0) {
        try {
			await NewsPost.insertMany(allNews, { ordered: false });
		} catch (err) {
			logger.log({
				level: "error",
				message: `Etwas lief schief, während die Brandenburg News inseriert wurden: ${err}`,
			});
		}
    }
}




/**
 _    _ _   _ _     
| |  | | | (_) |    
| |  | | |_ _| |___ 
| |  | | __| | / __|
| |__| | |_| | \__ \
 \____/ \__|_|_|___/
*/

/**
 * Delete persons, which have been created more than 1 year ago
 */
async function deleteOldPersons() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await WantedPerson.deleteMany({ createdAt: { $lt: oneYearAgo } })
    await MissingPerson.deleteMany({ createdAt: { $lt: oneYearAgo } })
}

/**
 * Delete news, which have been created more than 6 months ago
 */
async function deleteOldNews() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    await NewsPost.deleteMany({ createdAt: { $lt: sixMonthsAgo } })
}

module.exports = {
    scrapeAllPersons,
    scrapeAllNews,
    deleteOldPersons,
    deleteOldNews
}