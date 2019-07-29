class KeyEncoding
{
    constructor(chars)
    {
        this.baseNum = chars.length - 1;
        this.chars = chars.split('');
        this.numchars = Math.ceil(log(this.baseNum,256));
    }

    /**
     * 
     * @param {Buffer} bytes The bytes to encode to this encoding
     * @param {Boolean} rotate
     */
    ToString(bytes,rotate = false)
    {
        var output = "";
        
        for(let i = 0; i < bytes.length; i++)
        {
            var num = bytes.readUInt8(i);
            var str = "";

            for(let j = 1; j <= this.numchars ; j++)
            {
                var n = num % Math.pow(this.baseNum + 1,j);
                str = this.chars[n] + str;
                num -= n;
            }

            output += str;
        }

        if(rotate) output = this.RotateString(output);
        return output;
    }

    RotateString(string)
    {
        var newstring = "";
        for(let i = 0; i < string.length; i++)
        {
            var pos = (i + 1 + this.chars.indexOf(string[i]))%(this.baseNum + 1);
            newstring += this.chars[pos];
        }

        return newstring;
    }

}

function log(x,base)
{
    return Math.log(x)/Math.log(base);
}

module.exports = KeyEncoding;