function ApiHandler(app,req,res)
{
    res.set('Content-Type', 'application/json; charset=utf-8');

    //TODO: Implement API
    res.send(({"ERRROR": "Api calls cannot be made yet."}));
}

module.exports = ApiHandler;