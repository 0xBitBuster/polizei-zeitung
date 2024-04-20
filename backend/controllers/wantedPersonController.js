const WantedPerson = require("../models/WantedPerson");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync")
const { getAuthLevel, AUTH_LEVELS } = require("../middleware/auth");
const MissingPerson = require("../models/MissingPerson");

/**
 * Get all wanted Persons
 * @route   GET /api/wanted
 * @access  Internal, Admin
 */
exports.wantedPersons = catchAsync(async (req, res, next) => {    
    const wantedPersons = await WantedPerson.find({ isApproved: true }).select("-__v").sort({ date: -1 });

    return res.json({ 
        ok: true, 
        wantedPersons 
    });
});

/**
 * Get all unapproved wanted Persons
 * @route   GET /api/wanted/unapproved
 * @access  Admin
 */
exports.unapprovedWantedPersons = catchAsync(async (req, res, next) => {    
    const wantedPersons = await WantedPerson.find({ isApproved: false }).select("-__v").limit(20);

    return res.json({ 
        ok: true, 
        wantedPersons 
    });
});

/**
 * Get a wanted Person
 * @route   GET /api/wanted/:id?admin=1
 * @access  Internal, Admin
 */
exports.wantedPerson = catchAsync(async (req, res, next) => {
    const isAdmin = Boolean(req.query.admin)
    if (isAdmin && getAuthLevel(req) < AUTH_LEVELS.ADMIN) {
        return next(new AppError("You need to have higher privileges to use this query.", 400))
    }
    
    const { id } = req.params
    const filter = isAdmin ? {} : { isApproved: true };
    const wantedPerson = await WantedPerson.findOne({ _id: id, ...filter })

    return res.json({ 
        ok: true, 
        wantedPerson 
    });
});

/**
 * Publish a new wanted Person
 * @route   POST /api/wanted
 * @access  Admin
 */
exports.publishWantedPerson = catchAsync(async (req, res, next) => {
    const { crawledFrom, crawledUrl, isUnknown, firstName, lastName, offenses, crimeSceneLocation, crimeSceneDate, bounty, description, appearance, birthDate, gender, height, nationality, submitTipLink } = req.body
    const wantedPerson = await WantedPerson.create({ 
        isApproved: true,
        crawledFrom, 
        crawledUrl,
        isUnknown,
        firstName, 
        lastName, 
        offenses, 
        crimeSceneLocation, 
        crimeSceneDate,
        bounty, 
        description, 
        appearance, 
        birthDate, 
        gender, 
        height, 
        nationality, 
        submitTipLink 
    })

    return res.json({ 
        ok: true, 
        msg: `Die gefahndete Person wurde veröffentlicht und hat die ID "${wantedPerson._id}"` 
    });
});

/**
 * Delete a wanted Person
 * @route   DELETE /api/wanted/:id
 * @access  Admin
 */
exports.deleteWantedPerson = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const person = await WantedPerson.findByIdAndDelete(id)
    if (!person) {
        return next(new AppError("Diese Person wurde nicht gefunden.", 404))
    }

    return res.json({ 
        ok: true, 
        msg: "Die gefahndete Person wurde gelöscht." 
    });
});

/**
 * Approve or Edit a wanted Person
 * @route   PUT /api/wanted/:id
 * @access  Admin
 */
exports.editWantedPerson = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { isApproved, crawledFrom, crawledUrl, isUnknown, firstName, lastName, offenses, crimeSceneLocation, crimeSceneDateCrawled, crimeSceneDate, bounty, description, appearance, birthDate, gender, height, nationality, submitTipLink } = req.body
    
    const wantedPerson = await WantedPerson.findByIdAndUpdate(id, { 
        isApproved,
        crawledFrom, 
        crawledUrl,
        isUnknown,
        firstName, 
        lastName, 
        offenses, 
        crimeSceneLocation, 
        crimeSceneDateCrawled,
        crimeSceneDate,
        bounty, 
        description, 
        appearance, 
        birthDate, 
        gender, 
        height, 
        nationality, 
        submitTipLink 
    }, { runValidators: true })
    if (!wantedPerson) {
        return next(new AppError("Diese Person wurde nicht gefunden.", 404))
    }

    return res.json({ 
        ok: true, 
        msg: "Die gefahndete Person wurde bearbeitet." 
    });
});


/**
 * Convert a wanted person into a missing person
 * @route   POST /api/wanted/:id/convert
 * @access  Admin
 */
exports.convertWantedPerson = catchAsync(async (req, res, next) => {
    const { id } = req.params
    
    const wantedPerson = await WantedPerson.findById(id)
    if (!wantedPerson) {
        return next(new AppError("Diese Person wurde nicht gefunden.", 404))
    }

    const missingPerson = {
        ...wantedPerson,
        lastSeenLocation: wantedPerson.crimeSceneLocation,
        lastSeenDateCrawled: wantedPerson.crimeSceneDateCrawled,
        lastSeenDate: wantedPerson.crimeSceneDate
    }

    delete missingPerson.offenses;
    delete missingPerson.crimeSceneLocation;
    delete missingPerson.crimeSceneDateCrawled;
    delete missingPerson.crimeSceneDate;

    await MissingPerson.create(missingPerson)
    await WantedPerson.findByIdAndDelete(id)

    return res.json({ 
        ok: true, 
        msg: "Die gefahndete Person wurde konvertiert." 
    });
});

