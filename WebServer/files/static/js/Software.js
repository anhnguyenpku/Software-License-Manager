$(document).ready(function()
{
    socket.emit("software.list");

    $(".software-submit").click(function()
    {
        $("form#softform").submit();
    });
});

socket.on("software.list",function(list)
{
    for (let i = 0; i < list.length; i++)
    {
        const softItem = list[i];
        
        var html = "<tr><td>" + softItem.id + "</td> <td>" + softItem.name + "</td> <td>" + softItem.distributor +
            "</td> <td>" + softItem.version + "</td> <td>0</td> <td><a href='/software/" + softItem.id + "' class='button is-info'>View</a></td></tr>";
        
        $("table tbody").append(html);
    }
});