/* global hexo */

'use strict';

hexo.extend.filter.register('after_post_render', data => {
  const { config } = hexo;
  const theme = hexo.theme.config;

  data.content = data.content.replace(/<img([^>]*) src=/img, (match, attrs) => {
    let newAttrs = attrs;
    if (!/loading=/.test(newAttrs)) {
      newAttrs += ' loading="lazy"';
    }
    if (!/decoding=/.test(newAttrs)) {
      newAttrs += ' decoding="async"';
    }
    return `<img${newAttrs} src=`;
  });

  const url = require('url');
  const siteHost = url.parse(config.url).hostname || config.url;
  data.content = data.content.replace(/<a[^>]* href="([^"]+)"[^>]*>([^<]*)<\/a>/img, (match, href, html) => {
    if (!href) return match;

    let link = url.parse(href);
    if (!link.protocol || link.hostname === siteHost) return match;

    return `<span class="exturl" data-url="${Buffer.from(href).toString('base64')}">${html}</span>`;
  });

}, 0);
