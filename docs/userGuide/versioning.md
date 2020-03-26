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

## Archiving your site

To archive a specific site version, you can use the `markbind archive <version_name>` [command](cliCommands.html#archive-command).

This builds and archives your current site into the `_versions/output/<version_name>` directory, while outputting it to the `versions/<version_name>`
subdirectory in the output folder.

<box type="warning" header="On baseUrl"><md>
Note that versioning is highly dependent on the baseUrl you specify at the time of archiving.
Hence, you should still choose your baseUrl wisely as good practice!
</md></box>

#### Rebuilding past versions

You can rebuild all versions previously archived with the `markbind rebuild-archive` [command](cliCommands.html#rebuild-archive-command),
or a specific version with `markbind archive <version>`.

#### Removing past versions

To remove a specific version, you can use the `markbind remove-archive` [command](cliCommands.html#remove-archive-command).

## Displaying your versions

You can include your versions in the [site navigation menu]({{baseUrl}}/userGuide/usingComponents.html#site-navigation-menus) like so using the `<versions></versions>` component.



<include src="outputBox.md" boilerplate>
<span id="code">

```{.no-line-numbers}
* [:house: Home]({{ baseUrl }}/index.html)
---
* Docs
  * [User Guide]({{ baseUrl }}/ug.html)
  * [Dev Guide]({{ baseUrl }}/dg.html)
---
* [Search]({{ baseUrl }}/search.html)
  * [Google Search](https://www.google.com/)
  * [YouTube Search](https://www.youtube.com/)
---
* [Contact]({{ baseUrl }}/contact.html)
* Versions
  * <versions></versions>
```
</span>
<span id="output">
<img height="300" src="{{baseUrl}}/images/versioningOutput.png" alt="site versioning example output" />
</span>
</include>
