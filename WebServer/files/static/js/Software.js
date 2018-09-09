$(document).ready(function()
{
    socket.emit("software.list");
});

socket.on("software.list",function(list)
{
    for (let i = 0; i < list.length; i++)
    {
        const softItem = list[i];
        
        var html = "<tr><td>" + softItem.id + "</td> <td>" + softItem.name + "</td> <td>" + softItem.version + "</td> <td>0</td> <td><a class='button is-info'>Edit</a></td></tr>";
        $("table tbody").append(html);
    }
});