#!/usr/bin/env node


// Entry file for Markbind project
const chokidar = require('chokidar');
const fs = require('fs-extra-promise');
const liveServer = require('live-server');
const path = require('path');
const program = require('commander');
const Promise = require('bluebird');
const ignore = require('ignore');
const walkSync = require('walk-sync');

const _ = {};
_.isBoolean = require('lodash/isBoolean');

const cliUtil = require('./src/util/cliUtil');
const { ensurePosix } = require('./src/lib/markbind/src/utils');
const fsUtil = require('./src/util/fsUtil');
const logger = require('./src/util/logger');
const Site = require('./src/Site');

const {
  ACCEPTED_COMMANDS,
  ACCEPTED_COMMANDS_ALIAS,
  INDEX_MARKDOWN_FILE,
  LAZY_LOADING_SITE_FILE_NAME,
  SITE_CONFIG_NAME,
  SITE_FOLDER_NAME,
  VERSIONS_DATA_FILE_NAME,
  VERSIONS_FOLDER_NAME,
  VERSIONS_SOURCE_FOLDER_NAME,
} = require('./src/constants');
const CLI_VERSION = require('./package.json').version;

process.title = 'MarkBind';
process.stdout.write(
  `${String.fromCharCode(27)}]0; MarkBind${String.fromCharCode(7)}`,
);

function printHeader() {
  logger.logo();
  logger.log(` v${CLI_VERSION}`);
}

function handleError(error) {
  logger.error(error.message);
  process.exitCode = 1;
}

/**
 * Copies the previously built versions as specified in the version data to the site output path.
 * Also copies the version data file.
 */
async function copyPreviousVersions(rootFolder, siteOutputPath) {
  const versionsJsonSourcePath = path.join(rootFolder, VERSIONS_DATA_FILE_NAME);
  if (!fs.existsSync(versionsJsonSourcePath)) {
    return Promise.resolve();
  }

  const versionsJson = fs.readJsonSync(versionsJsonSourcePath);
  const versionsJsonSiteOutputPath = path.join(siteOutputPath, VERSIONS_DATA_FILE_NAME);
  fs.outputJsonSync(versionsJsonSiteOutputPath, versionsJson);

  const versionsOutputFolder = path.join(rootFolder, VERSIONS_SOURCE_FOLDER_NAME, 'output');
  const versionsOutputPath = path.join(siteOutputPath, VERSIONS_FOLDER_NAME);

  const copyVersions = Object.keys(versionsJson.versions).map((version) => {
    const versionSourcePath = path.join(versionsOutputFolder, version);
    return fs.existsAsync(versionSourcePath)
      .then(exists => (exists
        ? fs.copyAsync(versionSourcePath, path.join(versionsOutputPath, version))
        : Promise.resolve()));
  });

  return Promise.all(copyVersions);
}

function createVersionsJsonIfNeeded(rootFolder, currentBaseUrl) {
  const versionsJsonPath = path.join(rootFolder, VERSIONS_DATA_FILE_NAME);
  const exists = fs.existsSync(versionsJsonPath);

  if (!exists) {
    const versionsJson = {
      current: {
        baseUrl: currentBaseUrl,
      },
      versions: {},
    };
    logger.info(`No existing ${VERSIONS_DATA_FILE_NAME} found, creating a new one.`);
    fs.outputJsonSync(versionsJsonPath, versionsJson);
  }
}

// We want to customize the help message to print MarkBind's header,
// but commander.js does not provide an API directly for doing so.
// Hence we override commander's outputHelp() completely.
program.defaultOutputHelp = program.outputHelp;
program.outputHelp = function (cb) {
  printHeader();
  this.defaultOutputHelp(cb);
};

program
  .allowUnknownOption()
  .usage('<command>');

program
  .name('markbind')
  .version(CLI_VERSION);

program
  .command('init [root]')
  .option('-c, --convert', 'convert a GitHub wiki or docs folder to a MarkBind website')
  .option('-t, --template <type>', 'initialise markbind with a specified template', 'default')
  .alias('i')
  .description('init a markbind website project')
  .action((root, options) => {
    const rootFolder = path.resolve(root || process.cwd());
    const outputRoot = path.join(rootFolder, SITE_FOLDER_NAME);
    printHeader();
    if (options.convert) {
      if (fs.existsSync(path.resolve(rootFolder, 'site.json'))) {
        logger.error('Cannot convert an existing MarkBind website!');
        return;
      }
    }
    Site.initSite(rootFolder, options.template)
      .then(() => {
        logger.info('Initialization success.');
      })
      .then(() => {
        if (options.convert) {
          logger.info('Converting to MarkBind website.');
          new Site(rootFolder, outputRoot).convert()
            .then(() => {
              logger.info('Conversion success.');
            })
            .catch(handleError);
        }
      })
      .catch(handleError);
  });

program
  .command('serve [root]')
  .alias('s')
  .description('build then serve a website from a directory')
  .option('-f, --force-reload', 'force a full reload of all site files when a file is changed')
  .option('-n, --no-open', 'do not automatically open the site in browser')
  .option('-o, --one-page [file]', 'build and serve only a single page in the site initially,'
    + 'building more pages when they are navigated to. Also lazily rebuilds only the page being viewed when'
    + 'there are changes to the source files (if needed), building others when navigated to')
  .option('-p, --port <port>', 'port for server to listen on (Default is 8080)')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .action((userSpecifiedRoot, options) => {
    let rootFolder;
    try {
      rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);

      if (options.forceReload && options.onePage) {
        handleError(new Error('Oops! You shouldn\'t need to use the --force-reload option with --one-page.'));
        process.exit();
      }
    } catch (err) {
      handleError(err);
    }
    const logsFolder = path.join(rootFolder, '_markbind/logs');
    const outputFolder = path.join(rootFolder, SITE_FOLDER_NAME);

    let onePagePath = options.onePage === true ? INDEX_MARKDOWN_FILE : options.onePage;
    onePagePath = onePagePath ? ensurePosix(onePagePath) : onePagePath;

    const site = new Site(rootFolder, outputFolder, onePagePath, options.forceReload, options.siteConfig);

    const addHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file add: ${filePath}`);
      Promise.resolve('').then(() => {
        if (fsUtil.isSourceFile(filePath) || site.isPluginSourceFile(filePath)) {
          return site.rebuildSourceFiles(filePath);
        }
        return site.buildAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    const changeHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file change: ${filePath}`);
      Promise.resolve('').then(() => {
        if (fsUtil.isSourceFile(filePath) || site.isPluginSourceFile(filePath)) {
          return site.rebuildAffectedSourceFiles(filePath);
        }
        return site.buildAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    const removeHandler = (filePath) => {
      logger.info(`[${new Date().toLocaleTimeString()}] Reload for file deletion: ${filePath}`);
      Promise.resolve('').then(() => {
        if (fsUtil.isSourceFile(filePath) || site.isPluginSourceFile(filePath)) {
          return site.rebuildSourceFiles(filePath);
        }
        return site.removeAsset(filePath);
      }).catch((err) => {
        logger.error(err.message);
      });
    };

    const onePageHtmlUrl = onePagePath && `/${onePagePath.replace(/\.(md|mbd|mbdf)$/, '.html')}`;

    // server config
    const serverConfig = {
      open: options.open && (onePageHtmlUrl || true),
      logLevel: 0,
      root: outputFolder,
      port: options.port || 8080,
      middleware: [],
      mount: [],
    };

    printHeader();

    site
      .readSiteConfig()
      .then((config) => {
        serverConfig.mount.push([config.baseUrl || '/', outputFolder]);

        if (onePagePath) {
          const lazyReloadMiddleware = function (req, res, next) {
            const urlExtension = path.posix.extname(req.url);

            const hasEndingSlash = req.url.endsWith('/');
            const hasNoExtension = urlExtension === '';
            const isHtmlFileRequest = urlExtension === '.html' || hasEndingSlash || hasNoExtension;

            if (!isHtmlFileRequest || req.url.endsWith('._include_.html')) {
              next();
              return;
            }

            if (hasNoExtension && !hasEndingSlash) {
              // Urls of type 'host/userGuide' - check if 'userGuide' is a raw file or does not exist
              const diskFilePath = path.resolve(rootFolder, req.url);
              if (!fs.existsSync(diskFilePath) || !fs.isDirectorySync(diskFilePath)) {
                // Request for a raw file
                next();
                return;
              }
            }

            const urlWithoutBaseUrl = req.url.replace(config.baseUrl, '');
            // Map 'hostname/userGuide/' and 'hostname/userGuide' to hostname/userGuide/index.
            const urlWithIndex = (hasNoExtension || hasEndingSlash)
              ? path.posix.join(urlWithoutBaseUrl, 'index')
              : urlWithoutBaseUrl;
            const urlWithoutExtension = fsUtil.removeExtension(urlWithIndex);

            const didInitiateRebuild = site.changeCurrentPage(urlWithoutExtension);
            if (didInitiateRebuild) {
              req.url = ensurePosix(path.join(config.baseUrl || '/', LAZY_LOADING_SITE_FILE_NAME));
            }
            next();
          };

          serverConfig.middleware.push(lazyReloadMiddleware);
        }

        return site.generate();
      })
      .then(() => copyPreviousVersions(rootFolder, outputFolder))
      .then(() => {
        const watcher = chokidar.watch(rootFolder, {
          ignored: [
            logsFolder,
            outputFolder,
            /(^|[/\\])\../,
            x => x.endsWith('___jb_tmp___'), x => x.endsWith('___jb_old___'), // IDE temp files
          ],
          ignoreInitial: true,
        });
        watcher
          .on('add', addHandler)
          .on('change', changeHandler)
          .on('unlink', removeHandler);
      })
      .then(() => {
        const server = liveServer.start(serverConfig);
        server.addListener('listening', () => {
          const address = server.address();
          const serveHost = address.address === '0.0.0.0' ? '127.0.0.1' : address.address;
          const serveURL = `http://${serveHost}:${address.port}`;
          logger.info(`Serving "${outputFolder}" at ${serveURL}`);
          logger.info('Press CTRL+C to stop ...');
        });
      })
      .catch(handleError);
  });

program
  .command('build [root] [output]')
  .alias('b')
  .option('--baseUrl [baseUrl]',
          'optional flag which overrides baseUrl in site.json, leave argument empty for empty baseUrl')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .description('build a website')
  .action((userSpecifiedRoot, output, options) => {
    // if --baseUrl contains no arguments (options.baseUrl === true) then set baseUrl to empty string
    const optionBaseUrl = _.isBoolean(options.baseUrl) ? '' : options.baseUrl;
    let rootFolder;
    try {
      rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);
    } catch (err) {
      handleError(err);
    }
    const defaultOutputRoot = path.join(rootFolder, SITE_FOLDER_NAME);
    const outputFolder = output ? path.resolve(process.cwd(), output) : defaultOutputRoot;
    printHeader();
    new Site(rootFolder, outputFolder, undefined, undefined, options.siteConfig)
      .generate(optionBaseUrl)
      .then(() => copyPreviousVersions(rootFolder, outputFolder))
      .then(() => {
        logger.info('Build success!');
      })
      .catch(handleError);
  });

program
  .command('archive <version> [root] [output]')
  .alias('a')
  .option('--baseUrl [baseUrl]',
          'optional flag which overrides baseUrl in site.json, leave argument empty for empty baseUrl')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .option('-r --remove-source', 'keeps the source files (default: false)')
  .description('archives the website into the versions subdirectory')
  .action(async (version, userSpecifiedRoot, output, options) => {
    let rootFolder;
    try {
      rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);
    } catch (err) {
      handleError(err);
    }

    const versionOutputFolder = path.join(rootFolder, VERSIONS_SOURCE_FOLDER_NAME, 'output', version);
    const siteOutputFolder = output
      ? path.resolve(process.cwd(), output)
      : path.join(rootFolder, SITE_FOLDER_NAME);

    // if --baseUrl contains no arguments (options.baseUrl === true) then set baseUrl to empty string
    const optionBaseUrl = options.baseUrl === true ? '' : options.baseUrl;
    const {
      baseUrl: siteConfigBaseUrl,
    } = fs.readJsonSync(path.join(rootFolder, options.siteConfig || SITE_CONFIG_NAME));

    const currentBaseUrl = optionBaseUrl || siteConfigBaseUrl || '/';
    const versionBaseUrl = path.posix.join(currentBaseUrl, VERSIONS_FOLDER_NAME, version);

    printHeader();

    fs.emptydirSync(versionOutputFolder);
    const site = new Site(rootFolder, versionOutputFolder, undefined, undefined, options.siteConfig);
    await site.generate(versionBaseUrl, currentBaseUrl === '/' ? '' : currentBaseUrl);

    createVersionsJsonIfNeeded(rootFolder, currentBaseUrl);
    const versionsJsonSourcePath = path.join(rootFolder, VERSIONS_DATA_FILE_NAME);

    // Update version data
    const versionsJson = fs.readJsonSync(versionsJsonSourcePath);
    versionsJson.versions[version] = {
      baseUrl: versionBaseUrl,
      keepSource: false,
    };

    // Copy the source
    let copySources = Promise.resolve();
    if (!options.removeSource) {
      const ignoreConfig = [
        VERSIONS_SOURCE_FOLDER_NAME,
        VERSIONS_DATA_FILE_NAME,
        path.relative(rootFolder, siteOutputFolder),
      ];
      const fileIgnore = ignore().add(ignoreConfig);
      const fileRelativePaths = walkSync(rootFolder, { directories: false });
      const filteredRelativePaths = fileIgnore.filter(fileRelativePaths);
      const versionSourceOutputFolder = path.join(rootFolder, VERSIONS_SOURCE_FOLDER_NAME, 'source', version);
      copySources = filteredRelativePaths.map(filePath => fs.copyAsync(
        path.join(rootFolder, filePath),
        path.join(versionSourceOutputFolder, filePath)));
      copySources = Promise.all(copySources);
      versionsJson.versions[version].keepSource = true;
    }

    fs.outputJsonSync(versionsJsonSourcePath, versionsJson);

    // Copy the site that was just built to the output folder as well
    fs.emptydirSync(siteOutputFolder);
    fs.copySync(versionOutputFolder, siteOutputFolder);

    // Copy previous versions, including the one just archived, and the updated version data.
    await copyPreviousVersions(rootFolder, siteOutputFolder);
    await copySources;

    logger.info(`Archived ${version}. Remember to read the docs if you want to change the baseUrl!`);
  });

program
  .command('rebuild-archive [root] [output]')
  .alias('r')
  .option('--baseUrl [baseUrl]',
          'optional flag which overrides baseUrl in site.json, leave argument empty for empty baseUrl')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .option('-b, --build', 'builds the current site as well (default: false)')
  .description('re-archives all versions of the website which\'s source files were kept before'
              + 'into the versions subdirectory again. Useful for changing baseUrl.')
  .action(async (userSpecifiedRoot, output, options) => {
    let rootFolder;
    try {
      rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);
    } catch (err) {
      handleError(err);
    }

    const versionsJsonSourcePath = path.join(rootFolder, VERSIONS_DATA_FILE_NAME);
    if (!fs.existsSync(versionsJsonSourcePath)) {
      logger.warn(`No ${VERSIONS_DATA_FILE_NAME} found, exiting.`);
      process.exit();
    }
    const versionsJson = fs.readJsonSync(versionsJsonSourcePath);

    const versionsSourceFolder = path.join(rootFolder, VERSIONS_SOURCE_FOLDER_NAME, 'source');
    const versionsOutputFolder = path.join(rootFolder, VERSIONS_SOURCE_FOLDER_NAME, 'output');

    // if --baseUrl contains no arguments (options.baseUrl === true) then set baseUrl to empty string
    const optionBaseUrl = _.isBoolean(options.baseUrl) ? '' : options.baseUrl;
    const siteConfigBaseUrl = fs.readJsonSync(
      path.join(rootFolder, options.siteConfig || SITE_CONFIG_NAME)).baseUrl;
    const currentBaseUrl = optionBaseUrl || siteConfigBaseUrl || '/';

    const versionsWithSourceFiles = Object.keys(versionsJson.versions).filter((version) => {
      if (versionsJson[version].keepSource) {
        return true;
      }
      logger.warn(`Skipping ${version} as its source files weren't kept...`);
      return false;
    });

    logger.info('Rebuilding versions with source files... this may take quite a while');
    for (let i = 0; i < versionsWithSourceFiles.length; i += 1) {
      const version = versionsWithSourceFiles[i];
      const versionBaseUrl = path.posix.join(currentBaseUrl, VERSIONS_FOLDER_NAME, version);
      versionsJson.versions[version].baseUrl = versionBaseUrl;
      const versionRoot = path.join(versionsSourceFolder, version);
      const versionOutput = path.join(versionsOutputFolder, version);

      fs.emptydirSync(versionOutput);
      const site = new Site(versionRoot, versionOutput, undefined, undefined, options.siteConfig);
      // Limit to generating one site at a time to avoid overwhelming the system
      // eslint-disable-next-line no-await-in-loop
      await site.generate(versionBaseUrl, currentBaseUrl === '/' ? '' : currentBaseUrl);
      logger.info(`${version} rebuilt!`);
    }

    // Update version data
    versionsJson.current.baseUrl = currentBaseUrl;
    fs.outputJsonSync(versionsJsonSourcePath, versionsJson);

    if (options.build) {
      const outputFolder = output
        ? path.resolve(process.cwd(), output)
        : path.join(rootFolder, SITE_FOLDER_NAME);
      printHeader();
      const site = new Site(rootFolder, outputFolder, undefined, undefined, options.siteConfig);
      await site.generate(optionBaseUrl);

      await copyPreviousVersions(rootFolder, outputFolder);
      logger.info('Main site rebuilt!');
    }

    logger.info('Rebuilt all archives with source files!');
  });

program
  .command('remove-archive [version] [root]')
  .description('Removes a version')
  .option('--all-versions', 'warning: removes all versions (default: false)')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .action(async (version, userSpecifiedRoot, options) => {
    let rootFolder;
    try {
      rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);
    } catch (err) {
      handleError(err);
    }

    const versionsJsonSourcePath = path.join(rootFolder, VERSIONS_DATA_FILE_NAME);
    if (!fs.existsSync(versionsJsonSourcePath)) {
      logger.warn(`No ${VERSIONS_DATA_FILE_NAME} found, exiting.`);
      process.exit();
    }

    const versionsSourceFolder = path.join(rootFolder, VERSIONS_SOURCE_FOLDER_NAME, 'source');
    const versionsOutputFolder = path.join(rootFolder, VERSIONS_SOURCE_FOLDER_NAME, 'output');
    if (options.allVersions) {
      await fs.removeAsync(versionsJsonSourcePath);
      fs.emptydirSync(versionsSourceFolder);
      fs.emptydirSync(versionsOutputFolder);
      process.exit();
    }

    const versionsJson = fs.readJsonSync(versionsJsonSourcePath);
    versionsJson[version] = undefined;

    await fs.removeAsync(path.join(versionsSourceFolder, version));
    await fs.removeAsync(path.join(versionsOutputFolder, version));
  });

program
  .command('deploy')
  .alias('d')
  .description('deploy the site to the repo\'s Github pages')
  .option('-t, --travis [tokenVar]', 'deploy the site in Travis [GITHUB_TOKEN]')
  .option('-s, --site-config <file>', 'specify the site config file (default: site.json)')
  .action((options) => {
    const rootFolder = path.resolve(process.cwd());
    const outputRoot = path.join(rootFolder, SITE_FOLDER_NAME);
    new Site(rootFolder, outputRoot, undefined, undefined, options.siteConfig).deploy(options.travis)
      .then(() => {
        logger.info('Deployed!');
      })
      .catch(handleError);
    printHeader();
  });

program.parse(process.argv);

if (!program.args.length
  || !(ACCEPTED_COMMANDS.concat(ACCEPTED_COMMANDS_ALIAS)).includes(process.argv[2])) {
  if (program.args.length) {
    logger.warn(`Command '${program.args[0]}' doesn't exist, run "markbind --help" to list commands.`);
  } else {
    program.help();
  }
}
