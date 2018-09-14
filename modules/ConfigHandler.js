const fs = require('fs');

let config;
Reload();

function Save()
{
    let configstr = JSON.stringify(config);

    if(fs.existsSync("dev-config.json"))
    {
        fs.writeFileSync("dev-config.json",configstr);
    }
    else
    {
        fs.writeFileSync("config.json",configstr);
    }

    Reload();
}

/**
 * Reload the config file
 */
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

    let versionInfo = require('../VersionInfo.json');
    config.VersionInfo = versionInfo;

    config.Reload = Reload;
    config.Save = Save;
    config.ReadSSL = ReadSSL;
}

/**
 * Read the ssl certificates
 */
function ReadSSL()
{
    let ssl = {
        "key": fs.readFileSync(config.ssl.key , 'utf8'),
        "cert": fs.readFileSync(config.ssl.cert, 'utf8'),
        "passphrase": config.passphrase
    }

    return ssl;
}

module.exports = config;