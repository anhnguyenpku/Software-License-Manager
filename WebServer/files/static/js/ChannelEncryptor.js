const crypto = require("crypto-browserify");
var eSocket = io();

var encryptionConstants = {"encoding": "base64", "cipher": "aes-256-ctr"};

eSocket.on("encrypt.constants",function(data)
{
    encryptionConstants.encoding = data.encoding;
    encryptionConstants.cipher = data.cipher;
});

if(sessionStorage.getItem("secret") == null || sessionStorage.getItem("secret") == "")
{
    eSocket.on("encrypt.keys",function(data)
    {
        sessionStorage.setItem("id",socket.id);
        sessionStorage.setItem("serverKeys", data);

        var diffie = crypto.createDiffieHellman(data.prime,data.generator);
        var publickey = diffie.generateKeys();

        sessionStorage.setItem("secret",diffie.computeSecret(data.publickey));

        eSocket.emit("encrypt.keys",{"publickey": publickey});

    });

    eSocket.on("encrypt.verify",function(data)
    {
        crypto
    });
}
else
{
    eSocket.emit("encrypt.encrypted");
}

function Encrypt(msg)
{

}

function Decrypt(msg)
{

}