const mongoose = require("mongoose");

const WantedPersonSchema = new mongoose.Schema({
    isApproved: {
        type: Boolean,
        default: false,
    },
    crawledFrom: {
        type: String,
        enum: ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Niedersachsen", "Mecklenburg-Vorpommern", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"],
        required: true,
    },
    crawledUrl: {
        type: String,
        minlength: [1, "Der gecrawlt Link muss mindestens 1 Zeichen lang sein."],
        maxlength: [500, "Der gecrawlt Link darf höchstens 500 Zeichen lang sein."],
        trim: true,
        required: true
    },
    isUnknown: {
        type: Boolean,
        default: true,
    },
    firstName: {
        type: String,
        minlength: [1, "Der Vorname muss mindestens 1 Zeichen lang sein."],
        maxlength: [35, "Der Vorname darf höchstens 35 Zeichen lang sein."],
        trim: true,
    },
    lastName: {
        type: String,
        minlength: [1, "Der Nachname muss mindestens 1 Zeichen lang sein."],
        maxlength: [35, "Der Nachname darf höchstens 35 Zeichen lang sein."],
        trim: true,
    },
    offenses: {
        type: [
            {
                type: String,
                minLength: [1, "Ein Delikt muss mindestens 1 Zeichen lang sein."],
                maxLength: [200, "Ein Delikt darf höchstens 200 Zeichen lang sein."],
                trim: true,
            },
        ],
        required: true,
    },
    crimeSceneLocation: {
        type: String,
        minlength: [1, "Der Tatort muss mindestens 1 Zeichen lang sein."],
        maxlength: [150, "Der Tatort darf höchstens 150 Zeichen lang sein."],
        trim: true,
    },
    crimeSceneDateCrawled: {
        type: String,
        minlength: [1, "Tatzeit-/raum, muss mindestens 1 Zeichen lang sein."],
        maxlength: [200, "Tatzeit-/raum, darf höchstens 200 Zeichen lang sein."],
        trim: true,
    },
    crimeSceneDate: Date,
    bounty: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: "",
        maxlength: [10000, "Die Beschreibung darf höchstens 10000 Zeichen lang sein."],
        trim: true,
    },
    appearance: {
        type: [
            {
                type: String,
                minLength: [1, "Eine äußere Erscheinung muss mindestens 1 Zeichen lang sein."],
                maxLength: [500, "Eine äußere Erscheinung darf höchstens 500 Zeichen lang sein."],
                trim: true,
            },
        ],
    },
    age: {
        type: Number,
        min: 0
    },
    gender: {
        type: String,
        enum: ["männlich", "weiblich", "unbekannt"],
        default: "unbekannt",
    },
    height: {
        type: Number,
        min: [1, "Die Höhe des Tatverdächtigen muss mindestens 1cm betragen."],
    },
    nationality: {
        type: String,
        minLength: [1, "Die Nationalität muss mindestens 1 Zeichen lang sein."],
        maxLength: [100, "Die Nationalität darf höchstens 100 Zeichen lang sein."],
        default: "unbekannt",
    },
    submitTipLink: {
        type: String,
        minlength: [1, 'Der "Hinweis abgeben" Link muss mindestens 1 Zeichen lang sein.'],
        maxlength: [500, 'Der "Hinweis abgeben" Link darf höchstens 500 Zeichen lang sein.'],
        trim: true,
        required: true
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("WantedPerson", WantedPersonSchema);
