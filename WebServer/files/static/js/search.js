class Searcher
{
    constructor (searchBar,object)
    {
        this.bar = searchBar;
        this.events = new EventEmitter();
        this.object = object;
    }

    AddEvents()
    {
        var searcher = this;
        $(this.bar).on('input',function(e)
        {
            searcher.Search($(searcher.bar).val(),function(results)
            {
                searcher.events.emit("found",results);
            });
        });
    }

    SetObject(object)
    {
        this.object = object;
    }

    /**
     * Search the object with the given query.
     * @param {String} query A query string
     * @param {Function} callback A callbacl Function
     */
    async Search(query,callback)
    {
        if(query == "" || query == null || query == undefined)
        {
            callback(this.object);
            return;
        }

        $(this.bar).toggleClass("is-loading",true);
        
        var queryArr = query.split(';');
        var resultArr = [];

        for(let i = 0; i < queryArr.length; i++)
        {
            const q = queryArr[i];
            let results = this.SearchSingleQuery(q);

            for(let i = 0; i < results.length; i++)
            {
                const r = results[i];
                
                if(!resultArr.contains(r)) resultArr.push(r);
            }
        }

        callback(resultArr);

        $(this.bar).toggleClass("is-loading",false);
    }

    /**
     * Search the array with a single query
     * @param {String} query A single query String
     * @returns {Array}
     */
    SearchSingleQuery(query)
    {
        var output = [];
        if(query.contains('='))
        {
            let qArr = query.split('=');
            var key = qArr[0];
            var value = qArr[1];

            for(let i = 0; i < this.object.length; i++)
            {
                const obj = this.object[i];

                if(obj[key].toLowerCase().contains(value.toLowerCase()))
                {
                    output.push(obj);
                }
            }
        }
        else
        {
            for(let i = 0; i < this.object.length; i++)
            {
                const obj = this.object[i];

                for(const key in obj)
                {
                    "".toLowerCase
                    if(obj[key].toLowerCase().contains(query.toLowerCase()))
                    {
                        output.push(obj);
                        break;
                    }
                }
            }
        }

        return output;
    }
}

String.prototype.contains = function(it)
{
    return this.indexOf(it) != -1;
};

Array.prototype.contains = function(it)
{
    return $.inArray(it,this,0) != -1;
}

Number.prototype.contains = function(it)
{
    try
    {
        return this.toString().indexOf(it) != -1;
    }
    catch
    {
        return false;
    }
};