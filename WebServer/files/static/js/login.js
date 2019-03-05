var socket = io(window.location.href);

encryptionEvents.on("loaded",function()
{
    $("form").submit(function(e)
    {
        e.preventDefault();

        var log = $("#login").val();
        var pass = $("#password").val();

        var authInfo = 
        {
            "login": log,
            "password": SecurePassword(log,pass)
        }

        socket.emit("auth.login", Encrypt(authInfo));

        $(".darkner").show();
    });
});

function SecurePassword(login,password)
{
    return sha512.hmac(login,password);
}

//Socket Events

socket.on("failed",function(message)
{
    //Display message
    console.log(Decrypt(message));
});

socket.on("success",function(cookieEn)
{
    var cookie = Decrypt(cookieEn);
    
    SetCookie("seskey",cookie,999);

    setTimeout(RedirectToHome,100);

    function RedirectToHome()
    {
        window.location.href = "/";
    }
});