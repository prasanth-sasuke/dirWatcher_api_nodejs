module.exports.success = (message, result, code) => {
    return {
        error: false,
        message: message,
        result: result,
        code: code
    }
}
module.exports.error = (message,code) => {
    
    return {
        error: true,
        message: message,
        code: code
    }
}