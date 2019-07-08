$(window).ready(function()
{
    $("button.submit").click(function(){$("form#changepassform").submit();});
    $(".button#change").click(function() {$("div#passModal").toggleClass("is-active",true);});
    $("form#changepassform").submit(ChangePassword);
});

function ChangePassword(e)
{
    e.preventDefault();

    let curr = SecurePassword($("input[name=current]").val());
    let newP = SecurePassword($("input[name=new]").val());
    let repeat = SecurePassword($("input[name=repeat]").val());

    if(newP != repeat)
    {
        //do something
        return;
    }

    socket.emit("user.chanePassword",Encrypt(
    {
        "login": login,
        "oldPWD": curr,
        "newPWD": newP
    }));

}

function SecurePassword(password)
{
    return sha512.hmac(login,password);
}

socket.on("error.user.changePassword",function(enMsg)
{
    var msg = Decrypt(enMsg);
    alert(msg);
});

socket.on("user.changePassword",function()
{
    $("div#passModal").toggleClass("is-active",false);
});