export function errorHandler(err, req, res, next) {
    if (err.isOperational) {
        return res.status(err.status).json({
            message: err.message
        });
    } else {
        console.error(err.stack);
        return res.status(500).json({
            message: 'Server error'
        });
    }
}