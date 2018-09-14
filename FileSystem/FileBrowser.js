const fs = require('fs');

class FileBrowser
{
    /**
     * Create a FileBrowser
     * @param {String} basePath The absolute folder path, you cannot escape this path
     */
    constructor(basePath)
    {
        this.BasePath = basePath;
        this.BaseFolder = new Folder(basePath, "");
    }

    /**
     * Check if the folder is the basepath.
     * @param {Folder} folder The folder to check
     * @returns {Boolean} Is Base Path
     */
    IsBasePath(folder)
    {
        return folder.Path == this.BasePath;
    }

    /**
     * Check if the folder path is a valid path.
     * @param {Folder} folder The folder to check
     * @returns {Boolean} Is Valid Path
     */
    IsValidFolderPath(folder)
    {
        return !folder.RelativePath.contains("../") && folder.Path.split(this.BasePath).length > 1;
    }

    /**
     * Check if the file path is a valid path.
     * @param {File} file The file to check
     * @returns {Boolean} Is Valid Path
     */
    IsValidFilePath(file)
    {
        return !file.RelativePath.contains("../") && file.Path.split(this.BasePath).length > 1;
    }

    /**
     *  Get all files and folders from the base folder
     */
    ReadBaseFolder()
    {
        return this.BaseFolder.ReadFolder();
    }

    /**
     *  Get all files and folders from a parent folder
     * @param {String} path A relative path, from the basefolder, of the parent folder
     * @returns {{"Files":File[],"Folders":Folder[]}}
     */
    ReadFolder(path)
    {
        let f = new Folder(this.BasePath + "/" + path, path);

        if(this.IsValidFolderPath(f))
        {
            return f.ReadFolder();
        }
        else
        {
            return {"Files":[],"Folders":[]};
        }
    }
}

class Folder
{
    /**
     * 
     * @param {String} path 
     * @param {String} relativePath 
     */
    constructor(path,relativePath)
    {
        this.Path = path;
        this.RelativePath = relativePath;

        this.Stats = fs.statSync(path);
    }

    /**
     * Get all files and folders from a parent folder
     * @returns {{"Files":File[],"Folders":Folder[]}}
     */
    ReadFolder()
    {
        let pathStrings = fs.readdirSync(this.Path);

        let files = [];
        let folders = [];

        for (let i = 0; i < pathStrings.length; i++)
        {
            const path = pathStrings[i];
            
            let relPath = this.RelativePath + "/" + path.split(this.Path)[1];

            if(fs.statSync(path).isDirectory())
            {
                let folder = new File(path,relPath);
                folders.push(folder);
            }
            else
            {
                let file = new File(path,relPath);
                files.push(file);
            }
        }

        return {"Files": files, "Folders" : folders};
    }

    /**
     * Get the name of the Folder (name)
     * @returns {String} Foldername
     */
    GetName()
    {
        let pathPieces = this.RelativePath.split('/');

        //Get last entry
        return pathPieces[pathPieces.length - 1];
    }
}

class File
{
    /**
     * 
     * @param {String} path 
     * @param {String} relativePath 
     */
    constructor(path,relativePath)
    {
        this.Path = path;
        this.RelativePath = relativePath;

        this.Stats = fs.statSync(path);
    }

    /**
     * Get the name of the File (name).(extension)
     * @returns {String} Filename
     */
    GetName()
    {
        let pathPieces = this.RelativePath.split('/');

        //Get last entry
        return pathPieces[pathPieces.length - 1];
    }
}

module.exports = FileBrowser;