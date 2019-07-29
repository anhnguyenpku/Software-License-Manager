const crypto = require('crypto');
const convert = require('xml-js');

const KeyEncoding  = require('./KeyEncoding');

class LicenseHandler
{
    constructor(software,version)
    {
        this.sid = software;
        this.vid = version;
        this.encoding = new KeyEncoding("ABCDEFHJKMNPQRSTUVWXYZ23456789");
    }
    
    /**
     * Register a license key
     * @param {Object} ownerdetails The owners details.
     * @returns The xml key
     */
    async Register(ownerdetails,callback)
    {
        //Generate key
        var bytes = crypto.randomBytes(1024);
        var keyBytes = crypto.pbkdf2Sync(JSON.stringify(ownerdetails),bytes,1000,16,'sha512');
        var key = this.encoding.ToString(keyBytes,true);

        ownerdetails.Key = key;

        var data = {
            "LicenseInfo":
            {
                "Software":
                {
                    "Name": "",
                    "Id": this.sid,
                },
                "Owner": ownerdetails
            }
        }
        
        //Generate keys
        var keyoptions = {
            modulusLength: 4096,
            publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
            },
            privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
            }
        };

        const {privateKey,publicKey} = crypto.generateKeyPairSync("rsa",keyoptions);
        
        //Create signer
        var signer = crypto.createSign('SHA256');

        //Generate xml and write it to the signer
        var xml = convert.js2xml(data,{compact: true, spaces:4});
        signer.update(xml);
        
        //Create a signature
        var signature = signer.sign(privateKey,'hex');
        
        //Add the signature to the xml
        data.LicenseInfo.Signature = signature;
        var signedXML = convert.js2xml(data,{compact: true,spaces:4});

        //TODO: Register all the data in the database

        callback(signedXML);
    }

    /**
     * Verify a xml string
     * @param {String} xml A XML string with signature
     * @param {*} callback 
     */
    async Verify(xml,callback)
    {
        var stripped = this.StripXML(xml);

        //TODO: Get from database
        var publicKey = "";

        var verifier = crypto.createVerify("SHA256");
        verifier.update(stripped.xml);

        callback(verifier.verify(publicKey,stripped.signature));
    }

    /**
     * Remove the signature tag from the xml and output the signature string.
     * @param {String} xml The xml with signature
     * @returns The signature and the stripped xml
     */
    StripXML(xml)
    {
        let json = convert.xml2js(xml,{compact: true});

        let si = xml.indexOf("<Signature>");
        let sie = xml.indexOf("</Signature>") + "</Signature>".length;
        let strippedXML = xml.substr(0,si) + xml.substr(sie);

        return {xml:strippedXML,signature:json.signature};
    }
}


String.prototype.ReplaceAll = function(search, replacement)
{
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = LicenseHandler;