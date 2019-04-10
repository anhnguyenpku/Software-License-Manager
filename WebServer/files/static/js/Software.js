var searcher = new Searcher("#search input",[]);

encryptionEvents.on("loaded", function()
{
    socket.emit("software.list");
    searcher.AddEvents();

    $(".software-submit").click(function()
    {
        $("form#softform").submit();
    });
});

socket.on("software.list",function(listEn)
{
    var list = Decrypt(listEn);
    searcher.SetObject(list);

    UpdateTable(list);
});

searcher.events.on("found",function(list)
{
    UpdateTable(list);
});

function UpdateTable(list)
{
    $("table tbody").empty();

    for (let i = 0; i < list.length; i++)
    {
        const softItem = list[i];
        
        let html = "<tr><td>" + softItem.id + "</td> <td>" + softItem.name + "</td> <td>" + softItem.distributor +
            "</td> <td>" + softItem.version + "</td> <td>0</td> <td><a href='/software/" + softItem.id + "' class='button is-info'>View</a></td></tr>";
        
        $("table tbody").append(html);
        $("#addSoftware").toggleClass("is-loading",false);

        $("#addSoftware").click(function()
        {
            $("#softModal").toggleClass("is-active",true);
        });
    }
}