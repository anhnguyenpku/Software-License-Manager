const fs = require('fs');

let config;
Reload();

function Save()
{

}

function Reload()
{
    if(fs.existsSync("dev-config.json"))
    {
        config = require('../dev-config.json');
    }
    else
    {
        config = require('../config.json');
    }
}

function ReadSSL()
{
    let ssl = {
        "key": fs.readFileSync(config.ssl.key , 'utf8'),
        "cert": fs.readFileSync(config.ssl.cert, 'utf8'),
        "passphrase": config.passphrase
    }

    return ssl;
}

config.Reload = Reload;
config.Save = Save;
config.ReadSSL = ReadSSL;

module.exports = config;