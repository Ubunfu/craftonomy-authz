const errors = require("./ErrorMessage");

function handle(error, res) {
    switch (error.message) {
        case errors.ERROR_MISSING_GRANT_TYPE:
            res.status(400)
                .send({
                    error: 'invalid_grant'
                });
            break;
        default:
            res.status(500)
                .send({
                    error: 'internal_server_error'
                });
            break;

    }
}

module.exports = {handle}