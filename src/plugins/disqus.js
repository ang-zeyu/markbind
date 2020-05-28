const cheerio = module.parent.require('cheerio');

/**
 * Converts shorthand syntax to proper Markbind syntax
 * @param content of the page
 */
module.exports = {
  postRenderNode: (node, pluginContext, frontMatter, config) => {
    if (node.name === 'disqus') {
      node.name = 'div';

      if (config.isDynamic) {
        return node;
      }

      const { embedLink } = pluginContext;
      if (!embedLink) {
        console.warn('embedLink configuration not specified for the disqus plugin!');
        return node;
      }

      const pageIdentifier = node.attribs.identifier || config.src;
      const immediateLoadString = node.attribs.immediate !== undefined ? ' || true' : '';

      delete node.attribs.url;
      delete node.attribs.identifier;
      delete node.attribs.immediate;
      node.attribs.id = 'disqus_thread';
      node.attribs.style = 'min-height: 100px';

      const disqusScriptEmbed = `
<script>
var disqus_config = function () {
  this.page.identifier = '${pageIdentifier}';
};
var disqus_loaded = false;
var disqus_observer = new IntersectionObserver(function(entries, o) {
  if (disqus_loaded) {
    o.unobserve(document.getElementById('disqus_thread'));
  }
  if ((entries.find(e => e.isIntersecting)${immediateLoadString}) && !disqus_loaded) {
    disqus_loaded = true;
    var d = document, s = d.createElement('script');
    s.src = '${embedLink}';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  }
}, { rootMargin: '300px' });
window.addEventListener('load', () => disqus_observer.observe(document.getElementById('disqus_thread')));
</script>
`;

      cheerio(node).after(disqusScriptEmbed);
    }

    return node;
  },
};
