import fs from "fs";
import path from "path";
import Liquid from "liquid";
import yaml from "js-yaml";
import fm from "front-matter";

const engine = new Liquid.Engine();

// Optional: register filters/tags here
// engine.registerFilters({...});
// engine.registerTag("myTag", MyTagClass);

function loadJekyllData(configPath = "_config.yml") {
  try {
    const absolutePath = path.resolve(process.cwd(), configPath);
    const fileContents = fs.readFileSync(absolutePath, "utf8");
    const configData = yaml.load(fileContents) || {};
    return { site: configData };
  } catch (err) {
    console.warn("Could not load Jekyll config:", err.message);
    return { site: {} };
  }
}

const jekyllData = loadJekyllData();

export default async function liquidLoader(source) {
  const callback = this.async();

  const parsed = fm(source);
  const frontMatterData = parsed.attributes || {};
  const content = parsed.body;

  const templateData = { ...jekyllData, ...frontMatterData };

  try {
    const rendered = await engine.parseAndRender(content, templateData);
    callback(null, rendered);
  } catch (err) {
    callback(err);
  }
}
