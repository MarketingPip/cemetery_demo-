import fs from "fs";
import path from "path";
import { sources } from "webpack";
import Liquid from "liquid-node";
import yaml from "js-yaml";

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
      return { site: configData }; // Wrap under "site" for {{ site.baseurl }}
    } catch (err) {
      console.warn("Could not load Jekyll config:", err.message);
      return { site: {} };
    }
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("LiquidJsPlugin", (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: "LiquidJsPlugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        async (assets) => {
          const root = path.resolve(this.options.context || compiler.context);
          this.engine.registerFileSystem(new Liquid.LocalFileSystem(root));

          if (typeof this.options.filters === "object") {
            this.engine.registerFilters(this.options.filters);
          }

          // Load Jekyll config data into "site"
          const jekyllData = this.loadJekyllData();
          const dataSource = this.options.data || jekyllData;

          for (const filename of Object.keys(assets)) {
            if (!filename.endsWith(".js")) continue;

            const asset = compilation.getAsset(filename);
            const content = asset.source.source();

            let templateData = {};
            if (typeof dataSource === "function") {
              try {
                templateData = dataSource(filename);
              } catch (err) {
                compilation.errors.push(err);
                continue;
              }
            } else {
              templateData = dataSource;
            }

            try {
              const rendered = await this.engine.parseAndRender(content, templateData);
              compilation.updateAsset(filename, new sources.RawSource(rendered));
            } catch (err) {
              compilation.errors.push(err);
            }
          }
        }
      );
    });
  }
}
