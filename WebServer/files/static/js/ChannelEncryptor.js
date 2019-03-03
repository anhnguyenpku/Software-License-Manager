const crypto = require("crypto");

var eSocket = io();

var encryptionConstants = 
    {
        "encoding": "base64",
        "cipher": "aes-256-ctr",
        "iv": new Uint8Array(),
        "salt": new Uint8Array(),
        "keyLenght": 32,
    };

eSocket.on("encrypt.constants",function(data)
{
    encryptionConstants = data;
    encryptionConstants.iv = new Uint8Array(encryptionConstants.iv);
    encryptionConstants.salt = new Uint8Array(encryptionConstants.salt);
});

if(sessionStorage.getItem("secret") == null || sessionStorage.getItem("secret") == "")
{
    eSocket.on("encrypt.keys",function(data)
    {
        sessionStorage.setItem("id",socket.id);
        sessionStorage.setItem("serverKeys", data);

        var primeBuffer = new Uint8Array(data.prime);
        var genBuffer = new Uint8Array(data.generator);
        var pubBuffer = new Uint8Array(data.publickey);

        var diffie = crypto.createDiffieHellman(primeBuffer,genBuffer);
        var publickey = diffie.generateKeys();

        var tempSecret = diffie.computeSecret(pubBuffer);
        
        sessionStorage.setItem("secret",);

        eSocket.emit("encrypt.keys",{"publickey": publickey});

    });

    eSocket.on("encrypt.verify",function(data)
    {
        var dec = Decrypt(data);
        console.log(dec);

        var ec = Encrypt(dec);
        eSocket.emit("encrypt.verify",ec);
    });
}
else
{
    eSocket.emit("encrypt.encrypted");
}

function Encrypt(msg)
{
    var msgStr = JSON.stringify(msg);

    var cipher = crypto.createCipheriv(encryptionConstants.cipher,sessionStorage.getItem("secret"),"slm");
    var out = cipher.update(msgStr,'utf8',encryptionConstants.encoding);
    
    return out + cipher.final(encryptionConstants.encoding);
}

function Decrypt(msg)
{
    var cipher = crypto.createDecipheriv(encryptionConstants.cipher,sessionStorage.getItem("secret"),"slm");
    var out = cipher.update(msg,encryptionConstants.encoding,'utf8');
    
    var msg = out + cipher.final('utf8');

    return JSON.parse(msg);
}