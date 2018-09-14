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
     * @returns {{"Files":File[],"Folders":Folder[]}}
     */
    ReadBaseFolder()
    {
        return this.BaseFolder.ReadFolder();
    }

    /**
     *  Get all files and folders from the base folder, safe to send to a client
     * @returns {{"Files":BrowserSafeFile[],"Folders":BrowserSafeFolder[],"folder":BrowserSafeFolder}}
     */
    ReadBaseFolderSafe()
    {
        return this.BaseFolder.ReadFolderSafe(this);
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

    /**
     *  Get all files and folders from a parent folder, safe to send to a client
     * @param {String} path A relative path, from the basefolder, of the parent folder
     * @returns {{"Files":BrowserSafeFile[],"Folders":BrowserSafeFolder[],"folder":BrowserSafeFolder}}
     */
    ReadFolderSafe(path)
    {
        let f = new Folder(this.BasePath + "/" + path, path);

        if(this.IsValidFolderPath(f))
        {
            return f.ReadFolderSafe(this);
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
            
            let relPath = this.RelativePath + "/" + path;
            let absPath = this.Path + "/" + path;

            if(fs.statSync(path).isDirectory())
            {
                let folder = new Folder(absPath,relPath);
                folders.push(folder);
            }
            else
            {
                let file = new File(absPath,relPath);
                files.push(file);
            }
        }

        return {"Files": files, "Folders" : folders};
    }

    /**
     * Get all files and folders from a parent folder, safe to send to a client
     * @param {FileBrowser} fileBrowser
     * @returns {{"Files":BrowserSafeFile[],"Folders":BrowserSafeFolder[],"folder":BrowserSafeFolder}}
     */
    ReadFolderSafe(fileBrowser)
    {
        let pathStrings = fs.readdirSync(this.Path);

        let files = [];
        let folders = [];

        for (let i = 0; i < pathStrings.length; i++)
        {
            const path = pathStrings[i];
            
            let relPath = this.RelativePath + "/" + path;
            let absPath = this.Path + "/" + path;

            if(fs.statSync(absPath).isDirectory())
            {
                let folder = new Folder(absPath,relPath).GetBrowserSafeFolder();
                folders.push(folder);
            }
            else
            {
                let file = new File(absPath,relPath).GetBrowserSafeFile();
                files.push(file);
            }
        }

        return {"Files": files, "Folders" : folders, "folder": this.GetParentFolder(fileBrowser).GetBrowserSafeFolder()};
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

    /**
     * Returns a folder safe to send to a client
     * @returns {BrowserrSafeFolder} folder
     */
    GetBrowserSafeFolder()
    {
        return new BrowserSafeFolder(this);
    }

    /**
     * Get the parent folder of this folder
     * @param {FileBrowser} fileBrowser 
     */
    GetParentFolder(fileBrowser)
    {
        let splits = this.RelativePath.split("/");
        let end = splits[splits.length -1];

        let path = this.Path.substr(0, this.Path.length - end.length);
        let relPath = this.RelativePath.substr(0, this.RelativePath.length - end.length);

        let folder = new Folder(path,relPath);

        if(fileBrowser.IsValidFolderPath(folder))
        {
            return folder;
        }
        else
        {
            return this;
        }
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

    /**
     * Returns a file safe to send to a client
     * @returns {BrowserrSafeFile} file
     */
    GetBrowserSafeFile()
    {
        return new BrowserSafeFile(this);
    }
}

class BrowserSafeFolder
{
    /**
     * Create a browser safe folder
     * @param {Folder} folder 
     */
    constructor(folder)
    {
        this.Path = folder.RelativePath;
        this.Name = folder.GetName();
    }
}

class BrowserSafeFile
{
    /**
     * Create a browser safe folder
     * @param {File} file 
     */
    constructor(file)
    {
        this.Path = file.RelativePath;
        this.Name = file.GetName();
    }
}

String.prototype.contains = function(it)
{
     return this.indexOf(it) != -1;
};

module.exports = FileBrowser;