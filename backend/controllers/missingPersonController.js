const MissingPerson = require("../models/MissingPerson");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync")
const { getAuthLevel, AUTH_LEVELS } = require("../middleware/auth");
const WantedPerson = require("../models/WantedPerson");

/**
 * Get all missing Persons
 * @route   GET /api/missing
 * @access  Internal, Admin
 */
exports.missingPersons = catchAsync(async (req, res, next) => {
    const missingPersons = await MissingPerson.find({ isApproved: true }).select("-__v").sort({ date: -1 });

    return res.json({ 
        ok: true, 
        missingPersons 
    });
});

/**
 * Get all unapproved missing Persons
 * @route   GET /api/missing/unapproved
 * @access  Admin
 */
exports.unapprovedMissingPersons = catchAsync(async (req, res, next) => {    
    const missingPersons = await MissingPerson.find({ isApproved: false }).select("-__v").limit(20);

    return res.json({ 
        ok: true, 
        missingPersons 
    });
});

/**
 * Get a missing Person
 * @route   GET /api/missing/:id?admin=1
 * @access  Internal, Admin
 */
exports.missingPerson = catchAsync(async (req, res, next) => {
    const isAdmin = Boolean(req.query.admin)
    if (isAdmin && getAuthLevel(req) < AUTH_LEVELS.ADMIN) {
        return next(new AppError("You need to have higher privileges to use this query.", 400))
    }

    const { id } = req.params
    const filter = isAdmin ? {} : { isApproved: true };
    const missingPerson = await MissingPerson.findOne({ _id: id, ...filter })

    return res.json({ 
        ok: true, 
        missingPerson 
    });
});

/**
 * Publish a new missing Person
 * @route   POST /api/missing
 * @access  Admin
 */
exports.publishMissingPerson = catchAsync(async (req, res, next) => {
    const { crawledFrom, crawledUrl, firstName, lastName, lastSeenLocation, lastSeenDate, bounty, description, appearance, birthPlace, birthDate, gender, height, nationality, submitTipLink } = req.body
    const missingPerson = await MissingPerson.create({ 
        isApproved: true,
        crawledFrom,
        crawledUrl,
        firstName, 
        lastName, 
        lastSeenLocation, 
        lastSeenDate, 
        bounty, 
        description, 
        appearance, 
        birthPlace, 
        birthDate, 
        gender, 
        height, 
        nationality, 
        submitTipLink 
    })

    return res.json({ 
        ok: true, 
        msg: `Die vermisste Person wurde veröffentlicht und hat die ID "${missingPerson._id}"` 
    });
});

/**
 * Delete a missing Person
 * @route   DELETE /api/missing/:id
 * @access  Admin
 */
exports.deleteMissingPerson = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const person = await MissingPerson.findByIdAndDelete(id)
    if (!person) {
        return next(new AppError("Diese Person wurde nicht gefunden.", 404))
    }

    return res.json({ 
        ok: true, 
        msg: "Die vermisste Person wurde gelöscht." 
    });
});

/**
 * Approve or Edit a missing Person
 * @route   PUT /api/missing/:id
 * @access  Admin
 */
exports.editMissingPerson = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { isApproved, crawledFrom, crawledUrl, isUnknown, firstName, lastName, lastSeenLocation, lastSeenDateCrawled, lastSeenDate, bounty, description, appearance, birthDate, gender, height, nationality, submitTipLink } = req.body
    
    const missingPerson = await MissingPerson.findByIdAndUpdate(id, { 
        isApproved,
        crawledFrom, 
        crawledUrl,
        isUnknown,
        firstName, 
        lastName, 
        lastSeenLocation, 
        lastSeenDateCrawled,
        lastSeenDate,
        bounty, 
        description, 
        appearance, 
        birthDate, 
        gender, 
        height, 
        nationality, 
        submitTipLink 
    }, { runValidators: true })
    if (!missingPerson) {
        return next(new AppError("Diese Person wurde nicht gefunden.", 404))
    }

    return res.json({ 
        ok: true, 
        msg: "Die vermisste Person wurde bearbeitet." 
    });
});

/**
 * Convert a missing person into a wanted person
 * @route   POST /api/missing/:id/convert
 * @access  Admin
 */
exports.convertMissingPerson = catchAsync(async (req, res, next) => {
    const { id } = req.params
    
    const missingPerson = await MissingPerson.findById(id)
    if (!missingPerson) {
        return next(new AppError("Diese Person wurde nicht gefunden.", 404))
    }

    const wantedPerson = {
        ...missingPerson,
        crimeSceneLocation: missingPerson.lastSeenLocation,
        crimeSceneDateCrawled: missingPerson.lastSeenDateCrawled,
        crimeSceneDate: missingPerson.lastSeenDate,
        offenses: []
    }

    delete wantedPerson.lastSeenLocation;
    delete wantedPerson.lastSeenDateCrawled;
    delete wantedPerson.lastSeenDate;

    await WantedPerson.create(wantedPerson)
    await MissingPerson.findByIdAndDelete(id)

    return res.json({ 
        ok: true, 
        msg: "Die vermisste Person wurde konvertiert." 
    });
});
