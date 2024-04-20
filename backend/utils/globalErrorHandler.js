const AppError = require("./AppError");

const handleCastErrorDB = (err) => {
    const message = `${err.path} besitzt einen unzulässigen Wert: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `${value} ist bereits vergeben.`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {  
    const message = err.errors[Object.keys(err.errors)[0]]?.message;
    return new AppError(message, 400);
};

const sendError = (err, req, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            ok: false,
            msg: err.message,
        });
    }

    console.error("ERROR: ", err);
    return res.status(500).json({
        ok: false,
        msg: "Irgendetwas ist sehr schief gelaufen! Versuche es bitte erneut.",
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);

    sendError(err, req, res);
};
