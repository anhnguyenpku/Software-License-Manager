encryptionEvents.on("loaded",function()
{
    socket.emit("config.list");
});

socket.on("config.list",function(list)
{
    let config = Decrypt(list);
    
    var pairs = JsonToKeyValuePairs(config);
    for (let i = 0; i < pairs.length; i++)
    {
        const pair = pairs[i];
        var html = "<tr><td>" + pair.key + "</td> <td>" + pair.value + "</td></tr>";
        
        $("table tbody").append(html);
    }

    $("#loader").remove();
});

/**
 * @param {Object} json
 * @returns {{"key":String, "value":Object}[]} 
 */
function JsonToKeyValuePairs(json)
{
    var pairs = [];
    
    for(let key in json)
    {
        if(IsJson(json[key]))
        {
            var subPairs = JsonToKeyValuePairs(json[key]);
            for (let i = 0; i < subPairs.length; i++)
            {
                const pair = subPairs[i];
                pairs.push({key: key + "." + pair.key, value: pair.value});
            }
        }
        else
        {
            pairs.push({key: key, value: json[key]});
        }
    }

    return pairs;
}

function IsJson(object)
{
    const stringConstructor = "test".constructor;
    const arrayConstructor = [].constructor;
    const objectConstructor = {}.constructor;

    if (object === null)
    {
        return false;
    }
    else if (object === undefined)
    {
        return false;
    }
    else if (object.constructor === stringConstructor)
    {
        return false;
    }
    else if (object.constructor === arrayConstructor)
    {
        return false;
    }
    else if (object.constructor === objectConstructor)
    {
        return true;
    }
    else
    {
        return false;
    }
}