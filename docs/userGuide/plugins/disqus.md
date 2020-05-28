<frontmatter>
  title: "User Guide: Disqus"
  layout: userGuide
  pageNav: "default"
</frontmatter>

## Disqus

This plugin allows you to use [disqus](https://disqus.com/) for your site with the `<disqus />` component.

To enable it, add `disqus` to your site's plugins, and supply your disqus `embedLink` key through `pluginsContext`.  

```js { heading="site.json" }
{
  ...
  "plugins": [
    "disqus"
  ],
  "pluginsContext": {
    "disqus": {
      "embedLink": "https://markbind-test.disqus.com/embed.js"
    }
  },
  ...
}
```

Then, add the `<disqus />` component to display it wherever you wish.

#### Page identifier

By default, the disqus [page identifier](https://help.disqus.com/en/articles/1717082-what-is-a-disqus-identifier) defaults
to the page url, ignoring your base url. If you want to change this (for example to share the same thread across multiple pages),
simply add the `identifier` attribute.

{{ icon_example }}  `<disqus identifier="your_shared_thread_id" />`.

#### Lazy loading

This plugin also adopts lazy loading for your disqus component by default (only loading the disqus script when the user scrolls
within `300px` of it) to improve the initial page load times.

If you want to disable this, simply add the following attribute `<disqus immediate />`

<box type="important" header="Multiple `<disqus />` components in the same page">

You should not include multiple `<disqus />` components in a single file, or [use an]({{baseUrl}}/userGuide/reusingContents.html#includes)
`<include />` on another file with a `<disqus />` component. You can do so for `<panel src="...">` [components]({{baseUrl}}/userGuide/usingComponents.html#panels) with a src attribute however.

If you want to place the `<disqus />` component at a common location, consider placing it in your [expressive layouts file]({{baseUrl}}/userGuide/tweakingThePageStructure.html#using-expressive-layout-templates)!

</box>
