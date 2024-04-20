const cron = require("node-cron");
const { scrapeAllPersons, scrapeAllNews, deleteOldNews, deleteOldPersons } = require("../utils/scraper")

// Crawl persons, every 4 hours
cron.schedule("0 */4 * * *", () => {
    scrapeAllPersons();
});

// Crawl news, every 30 minutes
cron.schedule("*/30 * * * *", () => {
    scrapeAllNews();
});

// Crawl news, every 1 day
cron.schedule("0 0 * * *", () => {
    deleteOldNews();
    deleteOldPersons();
});
