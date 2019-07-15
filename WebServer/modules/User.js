const APP = require('../../modules/AppHandler');
/**
 * @type {APP}
 */
var app;

class User
{
    constructor (id)
    {
        this.id = id;
        this.groupId;
        this.login;
        this.group;
        this.permissions = {};
    }

    Load(callback)
    {
        const user = this;

        //Query for 
        app.Database.GetUserById(this.id,function(results,fields,err)
        {
            if(err)
            {
                callback(err);
                return;
            }
            else if(results.length == 0)
            {
                callback(new Error("User doesn't exist!"));
                return;
            }

            const usr = results[0];
            user.groupId = usr.group;
            user.login = usr.login;

            user.LoadPermissions(callback);
        });
    }

    LoadPermissions(callback)
    {
        const user = this;
        app.Database.GetGroupById(this.groupId,function(results,fields,err)
        {
            if(err)
            {
                callback(err);
                return;
            }
            else if(results.length == 0)
            {
                callback(new Error("Group doesn't exist!"));
                return;
            }

            const grp = results[0];
            user.group = grp;
            user.permissions = JSON.parse(grp.permissions);

            callback();
        });
    }

    HasPermission(req)
    {
        const post = Object.keys(req.body).length != 0;
        const route = req.path;

        if(req.route === "/" && !post) return true;

        if(this.permissions["su"] === true)
        {
            return true;
        }
        else if(route.indexOf("/settings") !== -1 || route.indexOf("/config") !== -1 || route.indexOf("/system") !== -1)
        {
            return false;
        }
        else if(this.permissions["readonly"] === true)
        {
            if(post || !this.IsAllowedUsersPage(route)) return false;
            else if(!post && this.IsAllowedUsersPage(route))
            {
                return true;
            }
        }
        else if(this.permissions["softwareManager"] === true || this.permissions["softwareManager"] === true)
        {
            return this.IsAllowedUsersPage(route);
        }

        return false;
    }

    /**
     * Check if a route is an allowed non-superuser user-route or not.
     * @param {String} route The route the user is located
     * @returns A boolean which represents if the route is allowed or not.
     */
    IsAllowedUsersPage(route)
    {
        if(route.indexOf("user") !== -1)
        {
            if(route.indexOf("/users") !== -1)
            {
                return false;
            }
            else if(route.indexOf("/user/profile") === -1)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
        else if(route.indexOf("permissions") !== -1)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    static SetupModule(appHandler)
    {
        app = appHandler;
    }
}

module.exports = User;