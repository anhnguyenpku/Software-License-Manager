class SessionInfo
{
    constructor(req)
    {
        this.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        this.cookies = req.cookies;
    }
}

module.exports = SessionInfo;