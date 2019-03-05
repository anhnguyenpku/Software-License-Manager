var socket = io("/dashboard");
encryptionEvents.on("loaded",function()
{
    socket.emit("auth.validate",Encrypt(GetCookie("seskey")));
});