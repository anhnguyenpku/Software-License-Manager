var socket = io("/dashboard");
socket.emit("auth.validate",Encrypt(GetCookie("seskey")));