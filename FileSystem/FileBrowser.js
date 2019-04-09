const fs = require('fs');
const path = require('path');

const absolutePath = path.join(__dirname,"..","Content");

class FileBrowser
{
    /**
     * Create a filebrowser
     * @param {String} path The relative path of the folder
     * @param {String} parent The relative path of the parent folder
     * @param {String} baseParent The relative path of the base parent folder, this is the folder the filebrowser cannot leave
     */
    constructor (folderPath = "/", parent = "/", baseParent = "/")
    {
        if(FileBrowser.IsValidParent(baseParent) && 
            FileBrowser.IsValid(parent,baseParent) && FileBrowser.IsValid(folderPath, parent))
        {
            this.path = folderPath;
            this.parent = parent;
            this.base = baseParent;
        }
        else
        {
            this.path = "/";
            this.parent = "/";
            this.base = "/";
        }
    }

    /**
     * Read all files and folders in the current folder
     * @param {function(Error,{"path":String ,"folders": Folder[], "files": File[]})} callback 
     */
    async ReadFolder(callback)
    {
        const browser = this;

        var data = {"path":browser.GetRelativePath() ,"folders": [], "files":[]};
        if(!FileBrowser.PathEquals(this.path,this.parent))
        {
            data.folders.push(new Folder( path.join(browser.GetRelativePath() , ".."),"..."));
        }

        fs.readdir(this.GetAbsolutePath(),function(err,files)
        {
            if(err)
            {
                callback(err,null);
                return;
            }

            for (let i = 0; i < files.length; i++)
            {
                const file = files[i];
                const filePath = browser.GetAbsoluteItemPath(file);
                const relPath = browser.GetRelativeItemPath(file);
                const info = fs.lstatSync(filePath);
                
                if(info.isDirectory())
                {
                    data.folders.push(new Folder(relPath,file));
                }
                else if(info.isFile())
                {
                    data.files.push(new File(relPath,file));
                }
            }

            callback(null,data);
        });
    }

    /**
     * Get the absolute path of the FileBrowser
     * @returns {String}
     */
    GetAbsolutePath()
    {
        return path.join(absolutePath,this.base,this.path);
    }

    /**
     * Get the relative path of the FileBrowser
     * @returns {String}
     */
    GetRelativePath()
    {
        return this.path;
    }

    /**
     * Get the absolute path for a given item
     * @param {String} item Name of the item
     * @returns {String}
     */
    GetAbsoluteItemPath(item)
    {
        return path.join(absolutePath,this.base,this.path,item);
    }

    /**
     * Get the relative path for a given item
     * @param {String} item Name of the item
     * @returns {String}
     */
    GetRelativeItemPath(item)
    {
        return path.join(this.path,item);
    }

    /**
     * Create a new FileBowser that is restricted to the given path
     * @param {String[]} restrictedPaths relative path of the restricted folder of the new FileBrowser
     * @param {Strin} folderPath relative path of the new FileBrowser, relative to the restricted path
     * @returns {FileBrowser}
     */
    GetRestrictedFileBrowser(restrictedPaths,folderPath)
    {
        var resPath = "";
        
        for (let i = 0; i < restrictedPaths.length; i++)
        {
            const p = restrictedPaths[i];
            resPath = path.join(resPath,p);
        }
        
        var relPath = folderPath;
        
        return new FileBrowser(relPath,path.join(relPath,'..'),resPath);
    }

    /**
     * Create a new Filebrowser
     * @param {String} path Relative path of the new FileBrowser
     * @returns {FileBrowser}
     */
    GetSubFileBrowser(path)
    {
        return new FileBrowser(path,this.path,this.base);
    }

    /**
     * Checks if two relative paths are equal
     * @param {String} path1 First relative path
     * @param {String} path2 Seccond relaive path
     * @returns {Boolean}
     */
    static PathEquals(path1, path2)
    {
        return path.join(absolutePath,path1) == path.join(absolutePath,path2);
    }

    /**
     * Check if the relative folderpath is a valid folder path
     * @param {String} folderPath The realtive folder path
     * @param {String} parent The parents relative folder path
     */
    static IsValid(folderPath, parent)
    {
        var absParent = path.join(absolutePath,parent);
        return path.join(absParent,folderPath).contains(absParent);
    }

    /**
     * Check if the parents relative folderpath is a valid folder path
     * @param {String} folderPath The parents relative folder path
     */
    static IsValidParent(folderPath)
    {
        return path.join(absolutePath,folderPath).contains(absolutePath);
    }
}

class Folder
{
    constructor(path,name)
    {
        this.path = path;
        this.name = name;
    }
}

class File
{
    constructor(path,name)
    {
        this.path = path;
        this.name = name;
    }
}

String.prototype.contains = function(it)
{
     return this.indexOf(it) != -1;
};

module.exports = FileBrowser;