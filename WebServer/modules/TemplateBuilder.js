const fs = require('fs');
const mustache = require('mustache');

const templateFolder = __dirname + "/../html/templates/";
const pagesFolder = __dirname + "/../html/pages/";

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

        options.title = page;
        options.menu = mustache.to_html(this.MenuTemplate,menuoptions);
        options.page = pageHtml;

        let output = mustache.to_html(this.MainTemplate,options);

        return output;
    }
    
    BuildLoginPage(options)
    {
        this.Refresh();

        let output = mustache.to_html(this.LoginTemplate,options);

        return output;
    }

    Refresh()
    {
        //Page Templates
        this.MainTemplate = fs.readFileSync( templateFolder + "template.html").toString();
        this.LoginTemplate = fs.readFileSync(templateFolder + "loginTemplate.html").toString();

        //Components
        this.MenuTemplate = fs.readFileSync(templateFolder + "menu.html").toString();
    }
}

module.exports = TemplateBuilder;