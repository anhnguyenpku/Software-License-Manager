let setts;

class Settings
{
    constructor(database,callback)
    {
        setts = this;

        database.Query("SELECT * FROM `slm_settings`",function(results,fields,err)
        {
            if(err)
            {
                callback(err);
                return;
            }

            setts.Settings = results;
            callback(null);
        });
    }

    /**
     * Gives the setting value of the requested key.
     * @param {String} key The setting key
     */
    GetSetting(key)
    {
        let output = {"key": key, "value":""};
        
        this.Settings.forEach(setting =>
        {
            if(setting.key === key)
            {
                output = setting;
                return;
            }
        });

        return output.value;
    }
}

module.exports = Settings;