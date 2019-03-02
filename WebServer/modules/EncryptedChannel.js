const crypto = require("crypto");

const diffie = crypto.createDiffieHellman(4);

class EncryptedChannel
{
    /**
     * @param {diffie} masterKeys 
     */
    constructor(socket, masterKeys)
    {
        this.socket = socket;
        
        this.id = socket.id;
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
        this.socket.emit("encrypt.constants",
        {
            "encoding": EncryptedChannel.encoding,
            "cipher": EncryptedChannel.cipher
        });

        this.socket.emit("encrypt.keys",
        {
            "prime": this.keys.getPrime(),
            "generator": this.keys.getGenerator(),
            "publickey": this.keys.getPublicKey()
        });

        var channel = this;
        this.socket.on("encrypt.keys",function(keys)
        {
            channel.secret = channel.keys.computeSecret(keys.publickey);

            channel.socket.emit("encrypt.verify");
        });

        this.socket.on("encrypt.verify",function(verificationCode)
        {
            if(channel.verificationCode == channel.DecryptMessage(verificationCode))
            {
                channel.socket.emit("encrypt.succes");
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

    /**
     * @param {Object} msg 
     */
    EncryptMessage(msg)
    {
        let msgStr = JSON.stringify(msg);

        let cipher = crypto.createCipher(EncryptedChannel.cipher,this.secret);
        
        let out = cipher.update(msgStr,'utf8',EncryptedChannel.encoding);
        return out + cipher.final(EncryptedChannel.encoding);
    }

    /**
     * @param {Buffer} msg
     */
    DecryptMessage(msg)
    {
        let decipher = crypto.createDecipher(EncryptedChannel.cipher,this.secret);
        
        let out = decipher.update(msg,EncryptedChannel.encoding,'utf8');
        out += decipher.final('utf8');

        return JSON.parse(out);
    }

    /**
     * @returns {diffie}
     */
    static CreateMasterKeys()
    {
        var num = Number.parseInt(EncryptedChannel.primeLength);
        let diff = crypto.createDiffieHellman(num);
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

module.exports = EncryptedChannel;