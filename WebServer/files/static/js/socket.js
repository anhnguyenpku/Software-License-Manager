var socket = io();
socket.emit("auth.validate",GetCookie("seskey"));