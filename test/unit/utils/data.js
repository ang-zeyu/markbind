const path = require('path');

module.exports.LAYOUT_FILES_DEFAULT = [
  'footer.md',
  'head.md',
  'header.md',
  'navigation.md',
  'styles.css',
];

module.exports.LAYOUT_SCRIPTS_DEFAULT = '// eslint-disable-next-line no-undef\n'
  + 'MarkBind.afterSetup(() => {\n'
  + '  // Include code to be called after MarkBind setup here.\n'
  + '});\n';

module.exports.PAGE_NJK = `
<!DOCTYPE html>
<html lang="en-us">
<head>
    {{ headFileTopContent }}
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="generator" content=" markBindVersion ">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="{{ asset.bootstrap }}">
    <link rel="stylesheet" href="{{ asset.bootstrapVue }}">
    <link rel="stylesheet" href="{{ asset.fontAwesome }}">
    <link rel="stylesheet" href="{{ asset.glyphicons }}">
    <link rel="stylesheet" href="{{ asset.highlight }}">
    <link rel="stylesheet" href="{{ asset.markbind }}">
    <link rel="stylesheet" href="{{ asset.layoutStyle }}">
    {% if siteNav %}
        <link rel="stylesheet" href="{{ asset.siteNavCss }}">
    {% endif %}
    {{ headFileBottomContent }}
    {% if faviconUrl %}
        <link rel="icon" href="{{ faviconUrl }}">
    {% endif %}
</head>
<body>
<div id="app">
    {{ content }}
</div>
</body>
<script src="{{ asset.vue }}"></script>
<script src="{{ asset.components }}"></script>
<script src="{{ asset.bootstrapUtilityJs }}"></script>
<script src="{{ asset.polyfillJs }}"></script>
<script src="{{ asset.bootstrapVueJs }}"></script>
<script>
  const baseUrl = '{{ baseUrl }}';
</script>
<script src="{{ asset.setup }}"></script>
<script src="{{ asset.layoutScript }}"></script>
</html>
`;

module.exports.SITE_JSON_DEFAULT = '{\n'
  + '  "baseUrl": "",\n'
  + '  "titlePrefix": "",\n'
  + '  "ignore": [\n'
  + '    "_markbind/layouts/*",\n'
  + '    "_markbind/logs/*",\n'
  + '    "_site/*",\n'
  + '    "site.json",\n'
  + '    "*.md",\n'
  + '    "*.mbd",\n'
  + '    "*.mbdf",\n'
  + '    "*.njk",\n'
  + '    ".git/*"\n'
  + '  ],\n'
  + '  "pages": [\n'
  + '    {\n'
  + '      "src": "index.md",\n'
  + '      "title": "Hello World"\n'
  + '    },\n'
  + '    {\n'
  + '      "glob" : "**/index.md"\n'
  + '    },\n'
  + '    {\n'
  + '      "glob" : "**/*.+(md|mbd)"\n'
  + '    }\n'
  + '  ],\n'
  + '  "deploy": {\n'
  + '    "message": "Site Update."\n'
  + '  }\n'
  + '}\n';

module.exports.ABOUT_MD_DEFAULT = '# About\n'
  + 'Welcome to your **About Us** page.\n';

module.exports.FOOTER_MD_DEFAULT = '<footer>\n'
  + '  <div class="text-center">\n'
  + '    This is a dynamic height footer that supports markdown <md>:smile:</md>!\n'
  + '  </div>\n'
  + '  <!-- Support MarkBind by including a link to us on your landing page! -->\n'
  + '  <div class="text-center">\n'
  + '    <small>[Generated by {{MarkBind}} on {{timestamp}}]</small>\n'
  + '  </div>\n'
  + '</footer>\n';

module.exports.HEADER_MD_DEFAULT = '<header>\n'
  + '  <div class="bg-primary display-4 text-center text-white">\n'
  + '    <br>\n'
  + '    Start authoring your MarkBind website.\n'
  + '    <br>\n'
  + '    <br>\n'
  + '  </div>\n'
  + '</header>\n';

module.exports.INDEX_MD_DEFAULT = '<frontmatter>\n'
  + '  title: "Hello World"\n'
  + '  footer: footer.md\n'
  + '  header: header.md\n'
  + '  siteNav: site-nav.md\n'
  + '</frontmatter>\n\n'
  + '# Hello world\n'
  + 'Welcome to your page generated with MarkBind.\n';

module.exports.SITE_NAV_MD_DEFAULT = '<navigation>\n'
  + '* [Home :glyphicon-home:]({{baseUrl}}/index.html)\n'
  + '</navigation>\n';

module.exports.TOP_NAV_DEFAULT = '<header><navbar placement="top" type="inverse">\n'
  + '  <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand">'
  + '<i class="far fa-file-image"></i></a>\n'
  + '  <li><a href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>\n'
  + '  <li><a href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>\n'
  + '  <li slot="right">\n'
  + '    <form class="navbar-form">\n'
  + '      <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"'
  + ' menu-align-right></searchbar>\n'
  + '    </form>\n'
  + '  </li>\n'
  + '</navbar></header>';

module.exports.USER_VARIABLES_DEFAULT = '<variable name="example">\n'
  + 'To inject this HTML segment in your markbind files, use {{ example }} where you want to place it.\n'
  + 'More generally, surround the segment\'s id with double curly braces.\n'
  + '</variable>';

const DEFAULT_TEMPLATE_DIRECTORY = path.dirname(require.resolve('@markbind/core/template/default/site.json'));

function getDefaultTemplateFileFullPath(relativePath) {
  return path.join(DEFAULT_TEMPLATE_DIRECTORY, relativePath);
}
module.exports.getDefaultTemplateFileFullPath = getDefaultTemplateFileFullPath;

module.exports.DEFAULT_TEMPLATE_FILES = {
  [getDefaultTemplateFileFullPath('index.md')]: module.exports.INDEX_MD_DEFAULT,
  [getDefaultTemplateFileFullPath('site.json')]: module.exports.SITE_JSON_DEFAULT,
  [getDefaultTemplateFileFullPath('_markbind/boilerplates/')]: '',
  [getDefaultTemplateFileFullPath('_markbind/head/')]: '',
  [getDefaultTemplateFileFullPath('_markbind/headers/header.md')]: module.exports.HEADER_MD_DEFAULT,
  [getDefaultTemplateFileFullPath('_markbind/footers/footer.md')]: module.exports.FOOTER_MD_DEFAULT,
  [getDefaultTemplateFileFullPath('_markbind/navigation/site-nav.md')]: module.exports.SITE_NAV_MD_DEFAULT,
  [getDefaultTemplateFileFullPath('_markbind/variables.md')]: module.exports.USER_VARIABLES_DEFAULT,
  [getDefaultTemplateFileFullPath('_markbind/plugins')]: '',
  [getDefaultTemplateFileFullPath('_markbind/layouts/default/footer.md')]: '',
  [getDefaultTemplateFileFullPath('_markbind/layouts/default/header.md')]: '',
  [getDefaultTemplateFileFullPath('_markbind/layouts/default/head.md')]: '',
  [getDefaultTemplateFileFullPath('_markbind/layouts/default/navigation.md')]: '',
  [getDefaultTemplateFileFullPath('_markbind/layouts/default/styles.css')]: '',
  [getDefaultTemplateFileFullPath('_markbind/layouts/default/scripts.js')]: module.exports
    .LAYOUT_SCRIPTS_DEFAULT,
};

const ASSET_DIRECTORY = path.join(path.dirname(require.resolve('@markbind/core/package.json')), 'asset');
function getAssetFileFullPath(relativePath) {
  return path.join(ASSET_DIRECTORY, relativePath);
}

module.exports.ASSETS = {
  [getAssetFileFullPath('css/bootstrap.min.css')]: '',
  [getAssetFileFullPath('css/bootstrap.min.css.map')]: '',
  [getAssetFileFullPath('css/github.min.css')]: '',
  [getAssetFileFullPath('css/markbind.css')]: '',
  [getAssetFileFullPath('css/page-nav.css')]: '',
  [getAssetFileFullPath('css/site-nav.css')]: '',

  [getAssetFileFullPath('js/bootstrap-utility.min.js')]: '',
  [getAssetFileFullPath('js/setup.js')]: '',
  [getAssetFileFullPath('js/vue.min.js')]: '',
};
