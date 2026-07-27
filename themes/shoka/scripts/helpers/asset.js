/* global hexo */

'use strict';
const { htmlTag, url_for } = require('hexo-util');
const theme_env = require('../../package.json');

hexo.extend.helper.register('hexo_env', function (type) {
  return this.env[type]
})

hexo.extend.helper.register('theme_env', function (type) {
  return theme_env[type]
})

hexo.extend.helper.register('_vendor_font', () => {
  const config = hexo.theme.config.font;

  if (!config || !config.enable) return '';

  const fontDisplay = '&display=swap';
  const fontSubset = '&subset=latin,latin-ext';
  const fontStyles = ':300,300italic,400,400italic,700,700italic';
  const fontHost = '//fonts.googleapis.com';

  //Get a font list from config
  let fontFamilies = ['global', 'logo', 'title', 'headings', 'posts', 'codes'].map(item => {
    if (config[item] && config[item].family && config[item].external) {
      return config[item].family + fontStyles;
    }
    return '';
  });

  fontFamilies = fontFamilies.filter(item => item !== '');
  fontFamilies = [...new Set(fontFamilies)];
  fontFamilies = fontFamilies.join('|');

  // Merge extra parameters to the final processed font string
  if (fontFamilies) {
    // 实现字体的异步加载
    return `<link rel="preload" href="${fontHost}/css?family=${fontFamilies.concat(fontDisplay, fontSubset)}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${fontHost}/css?family=${fontFamilies.concat(fontDisplay, fontSubset)}"></noscript>`;
  }
  return '';
});


hexo.extend.helper.register('_vendor_js', function() {
  const config = hexo.theme.config.vendors.js;
  const { statics, js } = hexo.theme.config;
  const version = theme_env['version'];

  if (!config) return '';

  const vendorMap = {
    pace: 'vendors/pace.min.js',
    pjax: 'vendors/pjax.min.js',
    anime: 'vendors/anime.min.js',
    lazyload: 'vendors/lazyload.min.js',
    quicklink: 'vendors/quicklink.min.js'
  };

  let result = '';
  const vendors = ['pace', 'pjax', 'fetch', 'anime', 'algolia', 'instantsearch', 'lazyload', 'quicklink'];

  vendors.forEach((item, index) => {
    if (config[item] && vendorMap[item]) {
      const src = url_for.call(this, `${statics}${js}/${vendorMap[item]}?v=${version}`);
      if (item === 'pace' || item === 'anime' || item === 'lazyload') {
        result += htmlTag('script', { src }, '');
      } else {
        result += htmlTag('script', { src, defer: true }, '');
      }
    }
  });

  return result;
});

hexo.extend.helper.register('_css', function(...urls) {
  const { statics, css } = hexo.theme.config;

  return urls.map(url => htmlTag('link', { rel: 'stylesheet', href: url_for.call(this, `${statics}${css}/${url}?v=${theme_env['version']}`) })).join('');
});


hexo.extend.helper.register('_js', function(...urls) {
  const { statics, js } = hexo.theme.config;

  return urls.map(url => htmlTag('script', { src: url_for.call(this, `${statics}${js}/${url}?v=${theme_env['version']}`) }, '')).join('');
});
