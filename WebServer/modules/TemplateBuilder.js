const fs = require('fs');
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
                menuoptions[options.subMenu.toLowerCase() + "-sub-menu"] = fs.readFileSync(submenuFolder + options.subMenu + ".html").toString();
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

    Refresh()
    {
        //Page Templates
        this.MainTemplate = fs.readFileSync( templateFolder + "template.html").toString();
        this.LoginTemplate = fs.readFileSync(templateFolder + "loginTemplate.html").toString();

        this.Error = {};
        this.Error.e404 = fs.readFileSync(templateFolder + "404.html").toString();

        //Components
        this.MenuTemplate = fs.readFileSync(templateFolder + "menu.html").toString();
    }
}

module.exports = TemplateBuilder;