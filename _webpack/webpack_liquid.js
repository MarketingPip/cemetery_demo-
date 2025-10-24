import fs from "fs";
import path from "path";
import Liquid from "liquid";
import yaml from "js-yaml";
import fm from "front-matter"; // parse YAML front matter
import webpack from "webpack";

const { sources } = webpack;

export default class LiquidJsPlugin {
  constructor(options = {}) {
    this.options = options;
    this.engine = new Liquid.Engine();
  }

  loadJekyllData() {
    try {
      const configPath = this.options.jekyllConfig || "_config.yml";
      const absolutePath = path.resolve(process.cwd(), configPath);
      const fileContents = fs.readFileSync(absolutePath, "utf8");
      const configData = yaml.load(fileContents) || {};
      return { site: configData }; // wrap under "site" for {{ site.baseurl }}
    } catch (err) {
      console.warn("Could not load Jekyll config:", err.message);
      return { site: {} };
    }
  }

  apply(compiler) {
    const root = path.resolve(this.options.context || compiler.context);
    this.engine.registerFileSystem(new Liquid.LocalFileSystem(root));

    if (typeof this.options.filters === "object") {
      this.engine.registerFilters(this.options.filters);
    }

    const jekyllData = this.loadJekyllData();
    const dataSource = this.options.data || jekyllData;

    compiler.hooks.compilation.tap("LiquidJsPlugin", (compilation) => {
      compilation.hooks.buildModule.tapPromise("LiquidJsPlugin", async (module) => {
        if (!module.resource || !module.resource.endsWith(".js")) return;

        let rawContent;
        try {
          rawContent = fs.readFileSync(module.resource, "utf8");
        } catch (err) {
          compilation.errors.push(err);
          return;
        }

        // Parse YAML front matter
        const parsed = fm(rawContent);
        const frontMatterData = parsed.attributes || {};
        const content = parsed.body || "";

        // Merge front matter data with site data
        let templateData = {};
        if (typeof dataSource === "function") {
          try {
            templateData = dataSource(module.resource);
          } catch (err) {
            compilation.errors.push(err);
          }
        } else {
          templateData = { ...dataSource, ...frontMatterData };
        }

        try {
          const rendered = await this.engine.parseAndRender(content, templateData);

          // Replace module source with rendered content
          if (module._source) {
            module._source._value = rendered;
          } else {
            module._source = new sources.RawSource(rendered);
          }
        } catch (err) {
          compilation.errors.push(err);
        }
      });
    });
  }
}
