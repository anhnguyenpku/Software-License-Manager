/**
 * Log a message
 * @param {String} source The class or object this function is called from
 * @param {String} message The message
 */
function Log(source,message)
{
    var timestamp = GetTime();
        
    console.log( '[' + timestamp + '] ' + '\x1b[33m' + source + "\x1b[0m" , ": " + message);
}

/**
 * Log an error message
 * @param {String} source The class or object this function is called from
 * @param {String} message The error message
 */
function Error(source,message)
{
    var timestamp = GetTime();

    console.log( '[' + timestamp + '] ' + '\x1b[33m' + source + "\x1b[0m" + " : (\x1b[31mError\x1b[0m) " + message);
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
module.exports = {"Log":Log, "Empty":Empty, "Error":Error};