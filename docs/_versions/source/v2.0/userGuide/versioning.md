<variable name="title" id="title">Versioning</variable>
<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide
  pageNav: default
</frontmatter>

# {{ title }}

<span class="lead">

**MarkBind also supports several handy utilities for versioning your site.**
</span>

## Archiving a site version

To archive a specific site version, you can use the `markbind archive <version_name>` [command](cliCommands.html#archive-command).

This builds and archives your current site into the `_versions/output/<version_name>` directory, while outputting it to the `versions/<version_name>`
subdirectory in the output folder.

<box type="warning" header="On baseUrl"><md>
Note that versioning is highly dependent on the baseUrl you specify at the time of archiving.
Hence, you should still choose your baseUrl wisely as good practice!
</md></box>

## Rebuilding past versions

You can rebuild all versions previouslay archived with the `markbind rebuild-archive` [command](cliCommands.html#rebuild-archive-command),
or a specific version with `markbind archive <version>`.

## Removing past versions

To remove a specific version, you can use the `markbind remove-archive` [command](cliCommands.html#remove-archive-command).
