const mongoose = require("mongoose");

const NewsPostSchema = new mongoose.Schema({
    crawledFrom: {
        type: String,
        enum: ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Niedersachsen", "Mecklenburg-Vorpommern", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"],
        required: true,
    },
    title: {
        type: String,
        minlength: [1, "Der Titel muss mindestens 1 Zeichen lang sein."],
        maxlength: [200, 'Der Titel darf höchstens 200 Zeichen lang sein.'],
        required: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [400, "Die Beschreibung darf höchstens 400 Zeichen lang sein."]
    },
    location: {
        type: String,
        minlength: [1, "Der Ort muss mindestens 1 Zeichen lang sein."],
        maxlength: [150, 'Der Ort darf höchstens 150 Zeichen lang sein.'],
    },
    date: {
        type: Date,
        default: Date.now()
    },
    link: {
        type: String,
        minlength: [1, 'Der Nachrichten Link muss mindestens 1 Zeichen lang sein.'],
        maxlength: [500, 'Der Nachrichten Link darf höchstens 500 Zeichen lang sein.'],
        trim: true,
        required: true
    },
});

module.exports = mongoose.model("NewsPost", NewsPostSchema);
