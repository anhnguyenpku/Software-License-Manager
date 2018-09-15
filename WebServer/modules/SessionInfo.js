const ipaddr = require('ipaddr.js');

class SessionInfo
{
    constructor(req)
    {
        this.ip = this.ProcessIp(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        this.cookies = req.cookies;
    }


    /**
     * Process the given ipadress to a generic ipv6 adress
     * @param {String} ip 
     * @returns {String} ipV6 adress
     */
    ProcessIp(ip)
    {

        let addr = ipaddr.parse(ip);
        return addr.toNormalizedString();
    }
}

class SocketSessionInfo
{
    constructor(req)
    {
        this.ip = this.ProcessIp(req.handshake.address);
        this.cookies = {};
    }

    /**
     * Process the given ipadress to a generic ipv6 adress
     * @param {String} ip 
     * @returns {String} ipV6 adress
     */
    ProcessIp(ip)
    {

        let addr = ipaddr.parse(ip);
        return addr.toNormalizedString();
    }
}

module.exports = {"SessionInfo":SessionInfo,"SocketSessionInfo":SocketSessionInfo};