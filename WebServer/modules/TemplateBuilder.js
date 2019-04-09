const fs = require('fs');
const os = require('os');
const ip = require('ip');
const mustache = require('mustache');

const templateFolder = __dirname + "/../files/templates/";
const pagesFolder = __dirname + "/../files/pages/";
const submenuFolder = __dirname + "/../files/menus/";

class TemplateBuilder
{
    constructor()
    {
        this.Refresh();
    }

    /**
     * Build the requested Page.
     * @param {String} page The name of the page (Case Sesnitive).
     * @param {Object} buildOptions Build Options are options that influence the built page.
     * @param {Object} options Options that influence what the builder does.
     */
    BuildPage(page,buildOptions,options)
    {
        this.Refresh();

        let pageHtml = fs.readFileSync(pagesFolder + page + ".html").toString();

        let menuoptions = {};
        menuoptions[page] = "is-active";

        if(!buildOptions.title) buildOptions.title = page;        

        if(options)
        {
            if(options.subMenu)
            {
                menuoptions[options.subMenu] = "is-active";

                var renderedSubMenu = mustache.render(fs.readFileSync(submenuFolder + options.subMenu + ".html").toString(),buildOptions);
                menuoptions[options.subMenu.toLowerCase() + "-sub-menu"] = renderedSubMenu;
            }
        }


        buildOptions.menu = mustache.to_html(this.MenuTemplate,menuoptions);

        if(fs.existsSync(__dirname + "/../files/static/js/" + page + ".js")) buildOptions.scripts = '<script src="/js/' + page + '.js"></script>';
        if(fs.existsSync(__dirname + "/../files/static/css/" + page + ".css")) buildOptions.styles = '<link rel="stylesheet" href="/css/' + page + '.css">';

        buildOptions.page = mustache.render(pageHtml,buildOptions);

        let output = mustache.to_html(this.MainTemplate,buildOptions);

        return output;
    }
    
    BuildLoginPage(buildOptions)
    {
        this.Refresh();

        let output = mustache.to_html(this.LoginTemplate,buildOptions);

        return output;
    }

    BuildErrorPage(code)
    {
        this.Refresh();
        return this.Error["e" + code];
    }

    BuildSystemInfoOptions(versionInfo)
    {
        let buildOptions = versionInfo;
        
        //SLM Info Part
        let authorHtml = "<ul>";

        for (let i = 0; i < buildOptions.Authors.length; i++)
        {
            const author = buildOptions.Authors[i];
            
            authorHtml += "<li> <a href='" + author.Link + "'>" + author.Name + "</a> <span class='has-small-text'>aka " + author.Alias + "</span></li>";
        }

        authorHtml += "</ul>";
        buildOptions["Authors-html"] = authorHtml;

        //OS Info Part

        let cpu = os.cpus()[0];
        let arch = os.arch();

        let time = os.uptime();
        let hours = Math.floor(time / 60 / 60);
        time -= hours * 60 * 60;
        let minutes = Math.floor(time / 60);
        time -= minutes * 60;
        let secconds = Math.floor(time);
        let uptime = hours + "h " + minutes + "m " + secconds + "s";

        let platforms = {"win32":"Windows", "linux": "Linux", "darwin": "Mac OS"};

        let osHtml = "System <strong>" + os.hostname() + "</strong>";
        osHtml += "<br/>";
        osHtml += "Running <strong>" + platforms[os.platform()] + " " + os.release() + " " + arch + "</strong>";
        osHtml += "<br/>";
        osHtml += "Has been running for <strong>" + uptime + "</strong>";
        osHtml += '<div class="small-spacer"></div>';
        osHtml += "CPU: <strong>" + cpu.model + "</strong>";
        osHtml += "<br/>";
        osHtml += "Memory: <strong>" + Math.round(os.totalmem() / 1024 / 1024 / 1024).toString() + ".0 GB</strong>";
        osHtml += '<div class="small-spacer"></div>';
        osHtml += "Local ip: <strong>" + ip.address() + "</strong>";

        buildOptions["os"] = osHtml;
        
        return buildOptions;
    }

    /**
     * @param {Array} options An array of objects with an id and name
     */
    BuildDropDownOptions(options)
    {
        var dropdown = "";
        options.forEach(function(opt)
        {
            dropdown += "<option value='" + id + "'>" + opt.name + "</option>";
        });

        return options;
    }

    Refresh()
    {
        //Page Templates
        this.MainTemplate = fs.readFileSync( templateFolder + "template.html").toString();
        this.LoginTemplate = fs.readFileSync(templateFolder + "loginTemplate.html").toString();

        this.Error = {};
        this.Error.e404 = fs.readFileSync(templateFolder + "404.html").toString();

        //Menus
        this.MenuTemplate = fs.readFileSync(templateFolder + "menu.html").toString();
    }
}

module.exports = TemplateBuilder;