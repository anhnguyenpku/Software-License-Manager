const fs = require('fs');

const contentPath = 'Content';
const executablesPath = contentPath + '/executables';

fs.mkdir(contentPath,function(err)
{
    if(err)
    {
        LogError(err);
        return;
    }

    fs.mkdir(executablesPath, LogError);
});

function LogError(err)
{
    if(err)
        console.log("Error: " + err.message);
}