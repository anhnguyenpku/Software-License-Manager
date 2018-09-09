class SessionInfo
{
    constructor(req)
    {
        this.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        this.cookies = req.cookies;
    }
}

class SocketSessionInfo
{
    constructor(req)
    {
        this.ip = req.handshake.address;
        this.cookies = {};
    }
}

module.exports = {"SessionInfo":SessionInfo,"SocketSessionInfo":SocketSessionInfo};