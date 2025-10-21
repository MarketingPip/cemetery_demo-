import tocbot from "tocbot"

tocbot.init({
   tocSelector: '#toc-sidebar',     // container for TOC (your nav)
 contentSelector: ".markdown",

  headingSelector: 'h2, h3',        // headings you want included
  collapseDepth: 6,                 // so sub-headings are nested
  listClass: 'ml-4 space-y-1',           // apply your classes to <ul> Tocbot generates
  itemClass: 'toc-link',                   // classes for <li> (add if needed)
  linkClass: 'toc-link',    // classes for links
  isCollapsedClass: 'hidden',      // classes for collapsed lists
   activeLinkClass: 'active',
   scrollSmooth: true,
  headingsOffset: 64 + 16 * 2,
});
