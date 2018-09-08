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

config.Reload = Reload;
config.Save = Save;

module.exports = config;