const crypto = require("crypto");
const scrypt = require("scryptsy");

class EncryptedChannel
{
    /**
     * @param {diffie} masterKeys 
     */
    constructor(socket, masterKeys)
    {
        this.socket = socket;
        
        this.id = socket.id;

        this.salt = crypto.randomBytes(EncryptedChannel.keyLength).toString('base64');
        this.iv = crypto.randomBytes(16);

        this.verificationCode = crypto.randomBytes(16).toString('base64');

        this.keys = crypto.createDiffieHellman(masterKeys.getPrime(),masterKeys.getGenerator());
        this.keys.setPrivateKey(masterKeys.getPrivateKey());
        this.keys.setPublicKey(masterKeys.getPublicKey());

        /**
         * @type {Buffer}
         */
        this.secret;

        this.SetupChannel();
    }

    async SetupChannel()
    {
        var channel = this;

        this.EmitConstants(this.socket);

        this.socket.emit("encrypt.keys",
        {
            "prime": this.keys.getPrime(),
            "generator": this.keys.getGenerator(),
            "publickey": this.keys.getPublicKey()
        });

        this.socket.on("encrypt.keys",async function(keys)
        {
            var pubBuffer = Buffer.from(keys.publickey);
            channel.secret = channel.keys.computeSecret(pubBuffer);

            channel.secret = scrypt(channel.secret,channel.salt,
                EncryptedChannel.scrypt.N, EncryptedChannel.scrypt.r, EncryptedChannel.scrypt.p,
                EncryptedChannel.keyLength);

                channel.socket.emit("encrypt.verify",channel.EncryptMessage(channel.verificationCode));
        });

        this.socket.on("encrypt.verify",function(verificationCode)
        {
            if(channel.verificationCode == channel.DecryptMessage(verificationCode))
            {
                channel.socket.emit("encrypt.success");
                channel.socket.channel = channel;
            }
            else
            {
                this.socket.emit("encrypt.keys",
                {
                    "prime": this.keys.getPrime(),
                    "generator": this.keys.getGenerator(),
                    "publickey": this.keys.getPublicKey(),
                    "encoding": EncryptedChannel.encoding
                });
            }
        });
    }

    async EmitConstants(socket)
    {
        var channel = this;
        this.socket = socket;
                
        this.socket.emit("encrypt.constants",
        {
            "encoding": EncryptedChannel.encoding,
            "cipher": EncryptedChannel.cipher,
            "keyLenght": EncryptedChannel.keyLength,
            "iv": channel.iv,
            "salt": channel.salt,
            "scrypt": EncryptedChannel.scrypt
        });
    }

    /**
     * @param {Object} msg 
     */
    EncryptMessage(msg)
    {
        let msgStr = JSON.stringify(msg);
        
        let cipher = crypto.createCipheriv(EncryptedChannel.cipher,this.secret,this.iv);
        
        let out = cipher.update(msgStr,'utf8',EncryptedChannel.encoding);
        return out + cipher.final(EncryptedChannel.encoding);
    }

    /**
     * @param {Buffer} msg
     */
    DecryptMessage(msg)
    {
        let decipher = crypto.createDecipheriv(EncryptedChannel.cipher,this.secret,this.iv);
        
        let out = decipher.update(msg,EncryptedChannel.encoding,'utf8');
        out += decipher.final('utf8');

        return JSON.parse(out);
    }

    static CreateMasterKeys()
    {
        var primeLength = 8;
        let diff = crypto.createDiffieHellman(primeLength /*EncryptedChannel.primeLength*/);
        diff.generateKeys();

        return diff;
    }
}

/**
 * @type {Number}
 */
EncryptedChannel.encoding = "base64";
EncryptedChannel.cipher = "aes-256-ctr";
EncryptedChannel.primeLength = 1024;
EncryptedChannel.keyLength = 32;
EncryptedChannel.scrypt = {"N":1024, "r":8, "p": 1};

module.exports = EncryptedChannel;