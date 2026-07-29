
/* global hexo */

'use strict';
const yaml = require('js-yaml');

function extractBvid(url) {
  const patterns = [
    /bilibili\.com\/video\/(BV[\w]+)/,
    /bilibili\.com\/video\/av(\d+)/,
    /b23\.tv\/(BV[\w]+)/,
    /b23\.tv\/(av\d+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function postMedia(args, content) {
  if(!args[0] || !content) {
    return
  }
  const list = yaml.load(content);
  switch(args[0]) {
    case 'video':
    case 'audio':
      return `<div class="media-container"><div class="player" data-type="${args[0]}" data-src='${JSON.stringify(list)}'></div></div>`;
    case 'bilibili':
      const bilibiliList = list.map(function(item) {
        if (typeof item === 'string') {
          return { bvid: extractBvid(item), url: item };
        }
        if (item.url) {
          item.bvid = extractBvid(item.url);
        }
        return item;
      }).filter(function(item) { return item && item.bvid; });
      return `<div class="media-container"><div class="player bilibili-player" data-type="bilibili" data-src='${JSON.stringify(bilibiliList)}'></div></div>`;
  }

}

hexo.extend.tag.register('media', postMedia, {ends: true});

//   return `<video src="${args}" preload="metadata" controls playsinline poster="">Sorry, your browser does not support the video tag.</video>`;
