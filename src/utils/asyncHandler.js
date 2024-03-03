const  asyncHandlerUsingPromise = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error));
    }
}



// Method  using asnc-await
const asyncHandlerUsingAsyncAwait = (functn) => {
    async (req, res, next) => {
        try {
            await functn(req, res, next);
        } catch (error) {
            res.status(error.code || 500).json({
                success: false,
                message: error.message
            })
        }
    }
}

export {asyncHandlerUsingPromise, asyncHandlerUsingAsyncAwait}