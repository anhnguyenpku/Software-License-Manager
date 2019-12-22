let setts;

class Settings
{
    constructor(database,callback)
    {
        this.Settings = [];
        setts = this;

        database.Connect(function(err,db,stop)
        {
            if(err)
            {
                callback(err);
                return;
            }

            var coll = db.collection("Settings");
            coll.find().toArray(function(err,res)
            {
                for(let i = 0; i < res.length; i++)
                {
                    const settGroup = res[i];

                    for(let key in Object.keys(settGroup))
                    {
                        if(key == "_id" || key == "type") continue;

                        setts.Settings.push({"key":settGroup.type + "." + key,"value":settGroup[key]});
                    }

                }
            });

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