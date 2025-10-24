import fs from "fs";
import path from "path";
import Liquid from "liquid";
import yaml from "js-yaml";
import fm from "front-matter";
import webpack from "webpack";
const { sources } = webpack;

export default class LiquidJsPlugin {
  constructor(options = {}) {
    this.options = options;
    this.engine = new Liquid.Engine();

    // Register custom filters/tags if provided
    if (options.filters) this.engine.registerFilters(options.filters);
    if (options.tags) {
      for (const [name, TagClass] of Object.entries(options.tags)) {
        this.engine.registerTag(name, TagClass);
      }
    }
  }

  // Load _config.yml (Jekyll)
  loadJekyllData() {
    try {
      const configPath = this.options.jekyllConfig || "_config.yml";
      const absolutePath = path.resolve(process.cwd(), configPath);
      const fileContents = fs.readFileSync(absolutePath, "utf8");
      const configData = yaml.load(fileContents) || {};
      return { site: configData };
    } catch (err) {
      console.warn("Could not load Jekyll config:", err.message);
      return { site: {} };
    }
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("LiquidJsPlugin", (compilation) => {
      // Use additionalAssets for async processing
      compilation.hooks.additionalAssets.tapPromise("LiquidJsPlugin", async () => {
        const root = path.resolve(this.options.context || compiler.context);
        this.engine.registerFileSystem(new Liquid.LocalFileSystem(root));

        // Load Jekyll data
        const jekyllData = this.loadJekyllData();
        const dataSource = this.options.data || jekyllData;

        for (const filename of Object.keys(compilation.assets)) {
          if (!filename.endsWith(".js")) continue;

          const asset = compilation.getAsset(filename);
          const contentWithFM = asset.source.source();

          // Extract YAML front matter
          const parsed = fm(contentWithFM);
          const frontMatterData = parsed.attributes || {};
          const content = parsed.body;

          // Merge Jekyll site data + front matter
          let templateData = {};
          if (typeof dataSource === "function") {
            try {
              templateData = dataSource(filename);
            } catch (err) {
              compilation.errors.push(err);
              continue;
            }
          } else {
            templateData = { ...dataSource, ...frontMatterData };
          }

          try {
            const rendered = await this.engine.parseAndRender(content, templateData);
            compilation.updateAsset(filename, new sources.RawSource(rendered));
          } catch (err) {
            compilation.errors.push(err);
          }
        }
      });
    });
  }
}
