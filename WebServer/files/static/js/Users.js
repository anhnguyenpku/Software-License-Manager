$(window).ready(function()
{
    socket.emit("user.users");
});

socket.on("user.users",function(list)
{
    for (let i = 0; i < list.length; i++)
    {
        const user = list[i];
        
        var html = "<tr><td>" + user.id + "</td> <td>" + user.name + "</td><td><a href='/user/" + user.id + "' class='button is-info'>Manage</a></td></tr>";
        
        $("table tbody").append(html);
        $("#addUser").toggleClass("is-loading",false);
    }
});