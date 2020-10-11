
const loggers = {
    log: console.log,
    warn: console.warn,
    error: console.error,
}

function disableLogging () {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
}

function enableLogging () {
    console.log = loggers.log;
    console.warn = loggers.warn;
    console.error = loggers.error;
}

module.exports = {
    enableLogging,
    disableLogging
}
