const path = require('path');

module.exports = {
  // index.js
  ACCEPTED_COMMANDS: ['init', 'build', 'serve', 'deploy'],
  ACCEPTED_COMMANDS_ALIAS: ['i', 'b', 's', 'd'],

  // src/Site.js
  CONFIG_FOLDER_NAME: '_markbind',
  HEADING_INDEXING_LEVEL_DEFAULT: 3,
  SITE_ASSET_FOLDER_NAME: 'asset',
  SITE_FOLDER_NAME: '_site',
  TEMP_FOLDER_NAME: '.temp',
  TEMPLATE_SITE_ASSET_FOLDER_NAME: 'markbind',

  ABOUT_MARKDOWN_FILE: 'about.md',
  FAVICON_DEFAULT_PATH: 'favicon.ico',
  FOOTER_PATH: '_markbind/footers/footer.md',
  INDEX_MARKDOWN_FILE: 'index.md',
  MARKBIND_DEFAULT_PLUGIN_DIRECTORY: path.join(path.dirname(require.resolve('@markbind/core')),
                                               'src/plugins/default'),
  MARKBIND_PLUGIN_DIRECTORY: path.join(path.dirname(require.resolve('@markbind/core')), 'src/plugins'),
  MARKBIND_PLUGIN_PREFIX: 'markbind-plugin-',
  MAX_CONCURRENT_PAGE_GENERATION_PROMISES: 4,
  PAGE_TEMPLATE_NAME: 'page.njk',
  PROJECT_PLUGIN_FOLDER_NAME: '_markbind/plugins',
  SITE_CONFIG_NAME: 'site.json',
  SITE_DATA_NAME: 'siteData.json',
  LAYOUT_SITE_FOLDER_NAME: 'layouts',
  LAZY_LOADING_SITE_FILE_NAME: 'LazyLiveReloadLoadingSite.html',
  LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT: 30000,
  LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT: 5000,
  USER_VARIABLES_PATH: '_markbind/variables.md',
  WIKI_SITE_NAV_PATH: '_Sidebar.md',
  WIKI_FOOTER_PATH: '_Footer.md',
  MARKBIND_WEBSITE_URL: 'https://markbind.org/',

  // src/template/template.js
  requiredFiles: ['index.md', 'site.json', '_markbind/'],
};
