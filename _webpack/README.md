# 🧱 Webpack Setup for Jekyll

This folder (`_webpack/`) contains a **custom Webpack configuration** used to bundle and optimize JavaScript, handle asset copying, and ensure compatibility with older browsers for your **Jekyll** site.

---

## 📦 Overview

The `webpack.config.babel.js` file provides a modern asset pipeline for Jekyll, enabling:

* **ES6+ to ES5 transpilation** using Babel (`@babel/preset-env`)
* **Minification** of JavaScript with `terser-webpack-plugin`
* **Automatic splitting** of shared code into separate chunks
* **Copying of external assets**, such as Font Awesome, into your Jekyll `assets` directory

This setup keeps your Jekyll site lightweight, modular, and production-ready.

---

## 📁 Folder Structure

```
jekyll-site/
├── _webpack/
│   ├── webpack.config.babel.js     # Webpack configuration file
│   └── (your JS source files)
├── assets/
│   ├── js/                   # Compiled JS output
│   ├── css/
│   └── webfonts/
└── ...
```

---

## ⚙️ Features Explained

### 1. **Entry Points**

You can define multiple JavaScript entry points inside the `entry` section:

```js
entry: {
  main: './_webpack/main.js',
  gallery: './_webpack/mygallery.js',
},
```

Each file will be compiled and output as:

```
assets/js/main.min.js
assets/js/gallery.min.js
```

---

### 2. **Babel Transpilation**

All `.js` files (except in `node_modules`) are transpiled from modern JavaScript (ES6+) to ES5 for better browser support.

---

### 3. **Optimization**

Webpack minimizes and splits code efficiently:

* **`TerserPlugin`** removes comments and compresses code.
* **`splitChunks`** extracts shared code into separate bundles for caching efficiency.

---

### 4. **CopyPlugin (Font Awesome Integration)**

Automatically copies Font Awesome assets:

* `all.min.css` → `assets/css/font-awesome.css`
* Webfonts → `assets/webfonts/`

You can add more patterns to copy other dependencies if needed.

---

### 5. **Output Configuration**

Bundled JavaScript is written to:

```
assets/js/[name].min.js
```

The `[name]` corresponds to each entry point’s key.

---

## 🚀 Usage

Add the compiled JavaScript to your layouts:

```liquid
<script src="{{ '/assets/js/main.min.js' | relative_url }}"></script>
```

Include Font Awesome if needed:

```liquid
<link rel="stylesheet" href="{{ '/assets/css/font-awesome.css' | relative_url }}">
```

---

## 🧩 Customization

* Add new JS files under `_webpack/` and declare them as entry points.
* Modify the `CopyPlugin` patterns to include additional libraries.
* Adjust Babel presets for newer syntax support.

---

## 🧰 Recommended Commands

| Command         | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `npm run build` | Run Webpack build (you can alias it in `package.json`)      |
| `npm run watch` | Watch for file changes (add `--watch` to the build command) |

Example `scripts` section in `package.json`:

```json
"scripts": {
  "build": "webpack --config _webpack/webpack.config.js --mode production",
  "watch": "webpack --config _webpack/webpack.config.js --watch --mode development"
}
```

---

## 🪶 Notes

* This Jekyll theme doesn’t process the `_webpack` folder by default, keeping your build logic separate from site content.
* All output files go directly into the Jekyll `assets/` directory, which Jekyll serves as part of your site. You can modify the output path(s) if needed.
