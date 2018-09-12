const crypto = require('crypto');
const convert = require('xml-js');

class KeyHandler
{
    constructor(appHandler)
    {
        this.app = appHandler;

        //TODO: ADD SETTING
        this.SimplifyChars = {"l":"L","1":"","I":"i"};

        this.Cipher = 'aes-256-ctr';
    }

    /**
     * Generates a license key for a specified software
     * @param {String} sid 
     * @param {String} name 
     * @param {String} distributor 
     * @param {Object} userinfo 
     */
    GenerateSoftwareKey(sid,name,distributor,userinfo)
    {
        let random = this.GenerateRandomString(25);

        let hmac = crypto.createHmac('sha512',random);

        hmac.update(sid);
        hmac.update(name);
        hmac.update(distributor);

        let key = hmac.digest('base64');
        key = this.SimplifyKey(key);

        //TODO: ADD SETTING
        key = key.substr(0,10);


        let info = {"key": key, "sid": sid, "name": name, "distributor": distributor, "user": userinfo};

        let keyfile = convert.json2xml(info);

        let AES = crypto.createCipher(this.Cipher,key);
        let eKeyfile = AES.update(keyfile,'utf8','hex');
        eKeyfile += AES.final('hex');

        let hash = crypto.createHash('sha512');
        hash.update(eKeyfile);

        return {"key":key, "keyfile": eKeyfile, "hash": hash.digest('hex')};
    }

    /**
     * Generates a license key for a version
     * @param {String} sid 
     * @param {String} name 
     * @param {String} distributor 
     * @param {String} vid 
     * @param {String} vlabel
     * @param {Object} userinfo
     */
    GenerateVersionKey(sid,name,distributor,vid,vlabel,userinfo)
    {
        let random = this.GenerateRandomString(25);

        let hmac = crypto.createHmac('sha512',random);

        hmac.update(sid);
        hmac.update(name);
        hmac.update(distributor);
        hmac.update(vid);
        hmac.update(vlabel);

        let key = hmac.digest('base64');
        key = this.SimplifyKey(key);

        //TODO: ADD SETTING
        key = key.substr(0,10);


        let info = {"key": key, "sid": sid, "name": name, "distributor": distributor, "vid": vid, "vlabel": vlabel, "user": userinfo};

        let keyfile = convert.json2xml(info);

        let AES = crypto.createCipher(this.Cipher,key);
        let eKeyfile = AES.update(keyfile,'utf8','hex');
        eKeyfile += AES.final('hex');

        let hash = crypto.createHash('sha512');
        hash.update(eKeyfile);

        return {"key":key, "keyfile": eKeyfile, "hash": hash.digest('hex')};
    }

    /**
     * Generates a random string with a specified length
     * @param {Number} length 
     */
    GenerateRandomString(length)
    {
        function RandomLetter()
        {
            let randomBytesNum = crypto.randomBytes(1).readInt8(0) + 128;
            let randomFloat = randomBytesNum / 255;
            let randomNum = Math.floor(randomFloat * (alphabet.length-1));

            return alphabet[randomNum];
        }

        let rndStr = "";

        for (let i = 0; i < length; i++)
        {
            rndStr += RandomLetter();    
        }

        return rndStr;
    }

    /**
     * Makes the key better readable
     * @param {String} key 
     */
    SimplifyKey(key)
    {
        let chars = Object.keys(this.SimplifyChars);

        for (let i = 0; i < chars.length; i++)
        {
            const char = chars[i];
            
            key = key.ReplaceAll(char,this.SimplifyChars[char]);
        }

        return key;
    }

    /**
     * 
     * @param {String} key 
     * @param {String} keyfile 
     * @param {String} newKeyfile 
     * @param {Object} validator 
     * @param {KeyHandlerCallbackInterface.CanActivateKey} callback 
     */
    CanActivateKey(key,keyfile,newKeyfile,userinfo,validator,callback)
    {
        if(key !== validator.key)
        {
            callback("Keys do not match!",false);
            return;
        }

        if(!this.CheckHash(keyfile,validator))
        {
            callback("Key file has been tempered with!",false);
            return;
        }

        let dKeyfile    = convert.xml2json(this.Decipher(key,keyfile));
        let dNewKeyfile = convert.xml2json(this.Decipher(key,newKeyfile));

        if(!this.CompareKeyFiles(dKeyfile,dNewKeyfile,validator))
        {
            callback("The keyfiles do not match!",false);
            return;
        }

        //TODO: Check Userinfo

        callback(null,true);
    }

    /**
     * Checks if a file has been tempered with.
     * @param {String} keyfile 
     * @param {Object} validator 
     */
    CheckHash(keyfile,validator)
    {
        let hash = crypto.createHash('sha512');
        hash.update(keyfile);

        let hashedFile = hash.digest('hex');

        return keyfile === validator.hash;
    }

    /**
     * Deciphers an input with a key
     * @param {String} key 
     * @param {String} input 
     */
    Decipher(key,input)
    {
        let DeAES = crypto.createDecipher(this.Cipher,key);

        let output = DeAES.update(input, 'hex', 'utf8');

        return output + DeAES.final('utf8');
    }

    /**
     * Compares the keyfiles of the user with eachother and the server's keyfile
     * @param {Object} f1 
     * @param {Object} f2 
     * @param {Object} validator 
     * @returns Boolean
     */
    CompareKeyFiles(f1,f2,validator)
    {
        let sid = f1.sid === f2.sid === validator.file.sid;
        let name = f1.name === f2.name === validator.file.name;
        let key = f1.key === f2.key === validator.file.key;
        let distributor = f1.distributor === f2.distributor === validator.file.distributor;
        let user = f1.user === f2.user === validator.file.user;

        let other = true;

        if(validator.file.vid) other = other && f1.vid == f2.vid == validator.file.vid;
        if(validator.file.vlabel) other = other && f1.vlabel == f2.vlabel == validator.file.vlabel;

        return sid && name && key && distributor && user && other;
    }
}

var KeyHandlerCallbackInterface = {};

/**
 * 
 * @param {String} message 
 * @param {Boolean} valid 
 */
KeyHandlerCallbackInterface.CanActivateKey = function(message,valid) {};




String.prototype.ReplaceAll = function(search, replacement)
{
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = KeyHandler;