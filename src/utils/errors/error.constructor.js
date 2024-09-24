import errorObject from './errorObject.js'

class customError extends Error {
    constructor(status = 400, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        /*  name: string;
            message: string;
            stack?: string; */
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, customError);
        }

        // Custom debugging information
        this.status = status;
    }
}

let errors = {}

for(const router of Object.keys(errorObject)){
    errors[router] = {}
    for(const error of Object.keys(errorObject[router])){
        const info = errorObject[router][error]
        errors[router][error] = new customError(info.status, "customError", info.message)
    }
}

export default errors