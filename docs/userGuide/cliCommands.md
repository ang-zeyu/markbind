<frontmatter>
  title: "User Guide: Command Line Interface (CLI)"
  layout: userGuide
  pageNav: default
</frontmatter>

# MarkBind CLI

### Overview

An overview of MarkBind's Command Line Interface (CLI) can be referenced with `markbind --help`:
```
$ markbind --help
Usage: markbind <command>
 
 Options:
   -V, --version                      output the version number
   -h, --help                         output usage information
 
 Commands:
   init|i [options] [root]            init a markbind website project
   serve|s [options] [root]           build then serve a website from a directory
   build|b [options] [root] [output]  build a website
   deploy|d [options]                 deploy the site to the repo's Github pages
```
<hr><!-- ========================================================================== -->

### `init` Command
<br>

**Format:** `markbind init [options] [root]`

**Alias:** `markbind i`

**Description:** Initializes a directory into a MarkBind site by creating a skeleton structure for the website which includes a `index.md` and a `site.json`.

**Arguments:**
* `[root]`<br>
  Root directory. Default is the current directory.<br>
  {{ icon_example }} `./myWebsite`

<panel header="**Options** :fas-cogs:" type="minimal">

**Options** :fas-cogs:

* `-c`, `--convert`<br>
  Convert an existing GitHub wiki or `docs` folder into a MarkBind website. See [Converting an existing Github project]({{ baseUrl }}/userGuide/markBindInTheProjectWorkflow.html#converting-existing-project-documentation-wiki) for more information.

{{ icon_examples }}
* `markbind init` : Initializes the site in the current working directory.
* `markbind init ./myWebsite` : Initializes the site in `./myWebsite` directory.
* `markbind init --convert` : Converts the Github wiki or `docs` folder in the current working directory into a MarkBind website.

</panel>

<hr><!-- ========================================================================== -->

### `serve` Command
<br>

**Format:** `markbind serve [options] [root]`

**Alias:** `markbind s`

**Description:** Does the following steps:
1. Builds the site and puts the generated files in a directory named `_site`.
1. Starts a web server instance locally and makes the site available at `http://127.0.0.1:8080`.
1. Opens a <trigger trigger="click" for="modal:cliCommands-livePreview">live preview</trigger> of the website.

<modal large header="Live Preview" id="modal:cliCommands-livePreview">
<include src="glossary.md#live-preview" inline/>
</modal>

**Arguments:**
* `[root]`<br>
  Root directory. The default is the directory where this command was executed.<br>
  {{ icon_example }} `./myWebsite`

<panel header="**Options** :fas-cogs:" type="minimal">

**Options** :fas-cogs:

* `-o <file>`, `--one-page <file>`<br>
 Serves only a single page from your website **initially**. If `<file>` is not specified, it defaults to `index.md/mbf/mbdf`.<br>
  * Thereafter, when changes to source files have been made, only the page being viewed will be rebuilt if it was affected.<br>
  * Navigating to a new page will build the new page, if it has not been built before, or there were some changes to source files that affected it before navigating to it.<br>
  * {{ icon_example }} `--one-page guide/index.md`

<box type="info" light header="Caveats" style="width: calc(100% - 50px); position: relative; left: 40px;">

Essentially, this optional feature is very useful when writing content, more so if your build times are starting to slow down!

The caveat is that not building all pages during the initial process, or not rebuilding all affected pages when a file changes, will cause your search results for these pages to be empty or outdated, until you navigate to them to trigger a rebuild.
</box>


* `-s <file>`, `--site-config <file>`<br>
   Specify the site config file (default: `site.json`)<br>
   {{ icon_example }} `-s otherSite.json`

* `-n`, `--no-open`<br>
   Don't open a live preview in the browser automatically.

* `-f`, `--force-reload`<br>
   Force live reload to process all files in the site, instead of just the relevant files. This option is useful when you are modifying a file that is not a file type monitored by the <trigger trigger="click" for="modal:cliCommands-livePreview">live preview</trigger> feature.

* `-p <port>`, `--port <port>`<br>
    Serve the website in the specified port.


{{ icon_examples }}
* `markbind serve`
* `markbind serve ./myWebsite`
* `markbind serve -p 8888 -s otherSite.json`

</panel>

<hr><!-- ========================================================================== -->

### `build` Command
<br>

**Format:** `markbind build [root] [output] [options]`

**Alias:** `markbind b`

**Description:** Generates the site to the directory named `_site` in the current directory.

**Arguments:**
* `[output]`<br>
  Put the generated files in the specified directory<br>
  {{ icon_example }} `../myOutDir`

* `[root] [output]`<br>
  Read source files from the `[root]` directory and put the generated files in the specified `[output]` directory<br>
  {{ icon_example }} `./myWebsite ../myOutDir`

<panel header="**Options** :fas-cogs:" type="minimal">

**Options** :fas-cogs:

<div id="build-options">

* `--baseUrl <base>`<br>
  Override the `baseUrl` property (read from the `site.json`) with the given `<base>` value.<br>
  {{ icon_example }} `--baseUrl staging`

* `-s <file>`, `--site-config <file>`<br>
  Specify the site config file (default: `site.json`)<br>
  {{ icon_example }} `-s otherSite.json`

</div>

**{{ icon_examples }}**
* `markbind build`
* `markbind build ./myWebsite ./myOutDir`
* `markbind build ./stagingDir --baseUrl staging`

</panel>

<hr><!-- ========================================================================== -->

### `archive` Command
<br>

**Format:** `markbind archive <version_name> [root] [output] [options]`

**Alias:** `markbind a`

**Description:** Builds and archives the site to the `_versions/output/<version_name>`,
                 while outputting it to the `versions` subdirectory in the output folder.

**Arguments:**
* `<version_name>`<br>
  The version name to use.
  {{ icon_example }} `v1.0`

* `[output]`<br>
  The output directory of the site (not the archived version)<br>
  {{ icon_example }} `../myOutDir`

* `[root]`<br>
  The root directory of the site's source files<br>
  {{ icon_example }} `./docs`

<panel header="**Options** :fas-cogs:" type="minimal">

**Options** :fas-cogs:

<panel header="Shared options from `markbind build`" type="minimal" src="cliCommands.md/#build-options" />

`markbind archive` options:

* `-r`, `--remove-source`<br>
  By default, markbind also archives your source files and assets to `_versions/source/<version_name>` so that you
  can make changes later on easily, such as changing the baseUrl of past versions.
  If you are using version control, and want full manual control over version control of source files and assets instead,
  you can use this option to disable archiving of source files.

<box type="warning" header="Using `-r` with `markbind rebuild-archive`"><md>
Note that if you use this option, `markbind rebuild-archive` will not be able to rebuild this version later on automatically!
Instead, you would have to checkout the appropriate version in your version control system and archive the site again from there.
</md></box>

**{{ icon_examples }}**
* `markbind archive 1.0`
* `markbind archive 1.0 --baseUrl /userGuide` - builds the site using the `/userGuide` baseUrl instead.

</panel>

<hr><!-- ========================================================================== -->

### `rebuild-archive` Command
<br>

**Format:** `markbind rebuild-archive [root] [output] [options]`

**Alias:** `markbind r`

**Description:** Rebuilds all previous versions of the site which's source files was preserved (the default),
                 then builds the current site and copies the version output to the output directory with the current site.
                 The `baseUrl` used in generating all sites is as specified with the `--baseUrl` option or the one in the
                 root site configuration file.

**Arguments:**
* `[output]`<br>
  The output directory of the site<br>
  {{ icon_example }} `../myOutDir`

* `[root]`<br>
  The root directory of the site's source files<br>
  {{ icon_example }} `./docs`

<panel header="**Options** :fas-cogs:" type="minimal">

**Options** :fas-cogs:

<panel header="Shared options from `markbind build`" type="minimal" src="cliCommands.md/#build-options" />

`markbind rebuild-archive` options:

* `-b`, `--build`<br>
  Build the current site as well, and copy all previously generated versions to the output folder.

**{{ icon_examples }}**
* `markbind rebuild-archive`
* `markbind rebuild-archive -b`

</panel>

<hr><!-- ========================================================================== -->

### `remove-archive` Command
<br>

**Format:** `markbind remove-archive [version] [root] [options]`

**Description:** Removes a previously built archive version properly, updating the `json` file markbind uses internally.

**Arguments:**
* `[version]`<br>
  The version name to remove<br>
  {{ icon_example }} `v1.0`

* `[root]`<br>
  The root directory of the site's source files<br>
  {{ icon_example }} `./docs`


**Options** :fas-cogs:

* `--all-versions`<br>
  Removes all versions. Ignored if `[version]` is specified.
* `-s <file>`, `--site-config <file>`<br>
  Specify the site config file (default: `site.json`)<br>
  {{ icon_example }} `-s otherSite.json`


**{{ icon_examples }}**
* `markbind remove-archive v1.0`
* `markbind remove-archive --all-versions`

<hr><!-- ========================================================================== -->

### `deploy` Command
<br>

**Format:** `markbind deploy [options]`

**Alias:** `markbind d`

**Description:** Deploys the site to the repo's Github pages by pushing everything in the generated site (default dir: `_site`) to the `gh-pages` branch of the current git working directory's remote repo.

<panel header="**Options** :fas-cogs:" type="minimal">

**Options** :fas-cogs:

* `-t <githubTokenName>`, `--travis <githubTokenName>`<br>
  Deploy the site in Travis CI using the GitHub personal access token stored in `<githubTokenName>`. (default: `GITHUB_TOKEN`)<br>
  {{ icon_example }} `-t PA_TOKEN`

%%{{ icon_info }} Related: [User Guide: Deploying the Website](deployingTheSite.html).%%

</panel>

<hr><!-- ========================================================================== -->

### `--help` Option
<br>

**Format:** `markbind [command] --help`

**Alias:** `markbind [command] -h`

**Description:** Prints a summary of MarkBind commands or a detailed usage guide for the given `command`.

{{ icon_examples }}
* `markbind --help` : Prints a summary of MarkBind commands.
* `markbind serve --help` : Prints a detailed usage guide for the `serve` command.
