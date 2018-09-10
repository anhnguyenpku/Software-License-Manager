const fs = require('fs');
const mustache = require('mustache');

const templateFolder = __dirname + "/../files/templates/";
const pagesFolder = __dirname + "/../files/pages/";

class TemplateBuilder
{
    constructor()
    {
        this.Refresh();
    }

    BuildPage(page,options)
    {
        this.Refresh();

        let pageHtml = fs.readFileSync(pagesFolder + page + ".html").toString();

        let menuoptions = {};
        menuoptions[page] = "is-active";

        if(!options.title) options.title = page;
        options.menu = mustache.to_html(this.MenuTemplate,menuoptions);

        if(fs.existsSync(__dirname + "/../files/static/js/" + page + ".js")) options.scripts = '<script src="/js/' + page + '.js"></script>';
        if(fs.existsSync(__dirname + "/../files/static/css/" + page + ".css")) options.styles = '<link rel="stylesheet" href="/css/' + page + '.css">';

        options.page = mustache.render(pageHtml,options);

        let output = mustache.to_html(this.MainTemplate,options);

        return output;
    }
    
    BuildLoginPage(options)
    {
        this.Refresh();

        let output = mustache.to_html(this.LoginTemplate,options);

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