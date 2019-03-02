/**
 * Log a message
 * @param {String} source The class or object this function is called from
 * @param {String} message The message
 */
function Log(source,message)
{
    var timestamp = GetTime();

    console.log(ReplaceColor('[' + timestamp + '] &3' + source + '&r : ' + message));
}

/**
 * Log an error message
 * @param {String} source The class or object this function is called from
 * @param {String} message The error message
 */
function Error(source,message)
{
    var timestamp = GetTime();

    console.log(ReplaceColor('[' + timestamp + '] &3' + source + '&r : &1(Error)&r ' + message));
}

function Empty()
{
    console.log("");
}

function GetTime()
{
    var date = new Date();
    var timestamp = AddZeros(date.getDate()) + "/" 
        + AddZeros(date.getMonth() + 1) + "/" + date.getFullYear() + " " 
        + AddZeros(date.getHours()) + ":" + AddZeros(date.getMinutes()) + ":" + AddZeros(date.getSeconds());
    
    return timestamp;
}

function AddZeros(s)
{
    if(parseInt(s) < 10)
    {
        s = "0" + s;
    }
    return s;
}

/**
 * Replace all color tags in a string with color formatting
 * @param {String} text The input text
 */
function ReplaceColor(text)
{
    //Actions
    text = text.replaceAll("&q","\x1b[1m");
    text = text.replaceAll("&r","\x1b[0m");
    text = text.replaceAll("&s","\x1b[2m");
    text = text.replaceAll("&t","\x1b[4m");
    text = text.replaceAll("&u","\x1b[5m");
    text = text.replaceAll("&v","\x1b[7m");
    text = text.replaceAll("&w","\x1b[8m");

    //Foreground colors
    text = text.replaceAll("&0","\x1b[30m");
    text = text.replaceAll("&1","\x1b[31m");
    text = text.replaceAll("&2","\x1b[32m");
    text = text.replaceAll("&3","\x1b[33m");
    text = text.replaceAll("&4","\x1b[34m");
    text = text.replaceAll("&5","\x1b[35m");
    text = text.replaceAll("&6","\x1b[36m");
    text = text.replaceAll("&7","\x1b[37m");

    //Background colors
    text = text.replaceAll("&a","\x1b[40m");
    text = text.replaceAll("&b","\x1b[41m");
    text = text.replaceAll("&C","\x1b[42m");
    text = text.replaceAll("&D","\x1b[43m");
    text = text.replaceAll("&e","\x1b[44m");
    text = text.replaceAll("&g","\x1b[45m");
    text = text.replaceAll("&h","\x1b[46m");
    text = text.replaceAll("&f","\x1b[47m");

    return text;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = {"Log":Log, "Empty":Empty, "Error":Error, "ReplaceColor": ReplaceColor};