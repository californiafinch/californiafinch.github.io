var CONFIG = {"version":"0.2.5","hostname":"https://californiafinch.github.io","root":"/","statics":"/","favicon":{"normal":"images/favicon.ico","hidden":"images/failure.ico"},"darkmode":false,"auto_scroll":false,"js":{"valine":"gh/amehime/MiniValine@4.2.2-beta10/dist/MiniValine.min.js","chart":"npm/frappe-charts@1.6.2/dist/frappe-charts.min.iife.min.js","copy_tex":"npm/katex@0.16.11/dist/contrib/copy-tex.min.js","fancybox":"combine/npm/jquery@3.7.1/dist/jquery.min.js,npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js,npm/justifiedGallery@3.8.1/dist/js/jquery.justifiedGallery.min.js"},"css":{"valine":"css/comment.css","katex":"npm/katex@0.16.11/dist/katex.min.css","mermaid":"css/mermaid.css","fancybox":"combine/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css,npm/justifiedGallery@3.8.1/dist/css/justifiedGallery.min.css"},"loader":{"start":true,"switch":true},"search":null,"quicklink":{"timeout":3000,"priority":true},"audio":[{"title":"love music","list":["https://music.163.com/#/playlist?id=10119070118"]}],"fireworks":["rgba(255,182,185,.9)","rgba(250,227,217,.9)","rgba(187,222,214,.9)","rgba(138,198,209,.9)"]};var getRndInteger = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var getDocHeight = function () {
  return $('main > .inner').offsetHeight;
}

var getScript = function(url, callback, condition) {
  if (condition) {
    callback();
  } else {
    var script = document.createElement('script');
    script.onload = script.onreadystatechange = function(_, isAbort) {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = script.onreadystatechange = null;
        if (!isAbort && callback) setTimeout(callback, 0);
      }
    };
    script.src = url;
    document.head.appendChild(script);
  }
}

var assetUrl = function(asset, type) {
  var str = CONFIG[asset][type]
  if(str.indexOf('npm')>-1||str.indexOf('gh')>-1||str.indexOf('combine')>-1)
    return "//cdn.jsdelivr.net/" + str

  if(str.indexOf('http')>-1)
    return str

  return statics + str;
}

var vendorJs = function(type, callback, condition) {
  if(LOCAL[type]) {
    getScript(assetUrl("js", type), callback || function(){
      window[type] = true;
    }, condition || window[type]);
  }
}

var vendorCss = function(type, condition) {
  if(window['css'+type])
    return;

  if(LOCAL[type]) {

    document.head.createChild('link', {
      rel: 'stylesheet',
      href: assetUrl("css", type)
    });

    window['css'+type] = true;
  }
}

var pjaxScript = function(element) {
  var code = element.text || element.textContent || element.innerHTML || '';
  var parent = element.parentNode;
  parent.removeChild(element);
  var script = document.createElement('script');
  if (element.id) {
    script.id = element.id;
  }
  if (element.className) {
    script.className = element.className;
  }
  if (element.type) {
    script.type = element.type;
  }
  if (element.src) {
    script.src = element.src;
    script.async = false;
  }
  if (element.dataset.pjax !== undefined) {
    script.dataset.pjax = '';
  }
  if (code !== '') {
    script.appendChild(document.createTextNode(code));
  }
  parent.appendChild(script);
}

var pageScroll = function(target, offset, complete) {
  var opt = {
    targets: typeof offset == 'number' ? target.parentNode : document.scrollingElement,
    duration: 500,
    easing: "easeInOutQuad",
    scrollTop: offset || (typeof target == 'number' ? target : (target ? target.top() + document.documentElement.scrollTop - siteNavHeight : 0)),
    complete: function() {
      complete && complete()
    }
  }
  anime(opt);
}

var transition = function(target, type, complete) {
  var animation = {}
  var display = 'none'
  switch(type) {
    case 0:
      animation = {opacity: [1, 0]}
    break;
    case 1:
      animation = {opacity: [0, 1]}
      display = 'block'
    break;
    case 'bounceUpIn':
      animation = {
        begin: function(anim) {
          target.display('block')
        },
        translateY: [
          { value: -60, duration: 200 },
          { value: 10, duration: 200 },
          { value: -5, duration: 200 },
          { value: 0, duration: 200 }
        ],
        opacity: [0, 1]
      }
      display = 'block'
    break;
    case 'shrinkIn':
      animation = {
        begin: function(anim) {
          target.display('block')
        },
        scale: [
          { value: 1.1, duration: 300 },
          { value: 1, duration: 200 }
        ],
        opacity: 1
      }
      display = 'block'
    break;
    case 'slideRightIn':
      animation = {
        begin: function(anim) {
          target.display('block')
        },
        translateX: [100, 0],
        opacity: [0, 1]
      }
      display = 'block'
    break;
    case 'slideRightOut':
      animation = {
        translateX: [0, 100],
        opacity: [1, 0]
      }
    break;
    default:
      animation = type
      display = type.display
    break;
  }
  anime(Object.assign({
    targets: target,
    duration: 200,
    easing: 'linear'
  }, animation)).finished.then(function() {
      target.display(display)
      complete && complete()
    });
}

var store = {
  get: function(item) {
    return localStorage.getItem(item);
  },
  set: function(item, str) {
    localStorage.setItem(item, str);
    return str;
  },
  del: function(item) {
    localStorage.removeItem(item);
  }
}

var escapeHtml = function(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
var $ = function(selector, element) {
  element = element || document;
  if(selector.indexOf('#') === 0) {
    return element.getElementById(selector.replace('#', ''))
  }
  return element.querySelector(selector)
};

$.all = function(selector, element) {
  element = element || document;
  return element.querySelectorAll(selector)
};

$.each = function(selector, callback, element) {
  return $.all(selector, element).forEach(callback)
}


Object.assign(HTMLElement.prototype, {
  createChild: function(tag, obj, positon) {
    var child = document.createElement(tag);
    Object.assign(child, obj)
    switch(positon) {
      case 'after':
        this.insertAfter(child)
        break;
      case 'replace':
        this.innerHTML = ""
      default:
        this.appendChild(child)
    }
    return child
  },
  wrap: function (obj) {
    var box = document.createElement('div');
    Object.assign(box, obj)
    this.parentNode.insertBefore(box, this);
    this.parentNode.removeChild(this);
    box.appendChild(this);
  },
  height: function(h) {
    if(h) {
      this.style.height = typeof h == 'number' ? h + 'rem' : h;
    }
    return this.getBoundingClientRect().height
  },
  width: function(w) {
    if(w) {
      this.style.width = typeof w == 'number' ? w + 'rem' : w;
    }
    return this.getBoundingClientRect().width
  },
  top: function() {
    return this.getBoundingClientRect().top
  },
  left:function() {
    return this.getBoundingClientRect().left
  },
  attr: function(type, value) {
    if(value === null) {
      return this.removeAttribute(type)
    }

    if(value) {
      this.setAttribute(type, value)
      return this
    } else {
      return this.getAttribute(type)
    }
  },
  insertAfter: function(element) {
    var parent = this.parentNode;
    if(parent.lastChild == this){
        parent.appendChild(element);
    }else{
        parent.insertBefore(element, this.nextSibling);
    }
  },
  display: function(d) {
    if(d == null) {
      return this.style.display
    } else {
      this.style.display = d;
      return this
    }
  },
  child: function(selector) {
    return $(selector, this)
  },
  find: function(selector) {
    return $.all(selector, this)
  },
  _class: function(type, className, display) {
    var classNames = className.indexOf(' ') ?  className.split(' ') : [className];
    var that = this;
    classNames.forEach(function(name) {
      if(type == 'toggle') {
        that.classList.toggle(name, display)
      } else {
        that.classList[type](name)
      }
    })
  },
  addClass: function(className) {
    this._class('add', className);
    return this;
  },
  removeClass: function(className) {
    this._class('remove', className);
    return this;
  },
  toggleClass: function(className, display) {
    this._class('toggle', className, display);
    return this;
  },
  hasClass: function(className) {
    return this.classList.contains(className)
  }
});
var NOWPLAYING = null
const isMobile = /mobile/i.test(window.navigator.userAgent);
const mediaPlayer = function(t, config) {
  var option = {
    type: 'audio',
    mode: 'random',
    btns: ['play-pause', 'music'],
    controls: ['mode', 'backward', 'play-pause', 'forward', 'volume'],
    events: {
      "play-pause": function(event) {
          if(source.paused) {
            t.player.play()
          } else {
            t.player.pause()
          }
      },
      "music": function(event) {
        if(info.el.hasClass('show')) {
          info.hide()
        } else {
          info.el.addClass('show');
          playlist.scroll().title()
        }
      }
    }
  }, utils = {
    random: function(len) {
      return Math.floor((Math.random()*len))
    },
    parse: function(link) {
      var result = [];
      [
        ['music.163.com.*song.*id=(\\d+)', 'netease', 'song'],
        ['music.163.com.*album.*id=(\\d+)', 'netease', 'album'],
        ['music.163.com.*artist.*id=(\\d+)', 'netease', 'artist'],
        ['music.163.com.*playlist.*id=(\\d+)', 'netease', 'playlist'],
        ['music.163.com.*discover/toplist.*id=(\\d+)', 'netease', 'playlist'],
        ['y.qq.com.*song/(\\w+).html', 'tencent', 'song'],
        ['y.qq.com.*album/(\\w+).html', 'tencent', 'album'],
        ['y.qq.com.*singer/(\\w+).html', 'tencent', 'artist'],
        ['y.qq.com.*playsquare/(\\w+).html', 'tencent', 'playlist'],
        ['y.qq.com.*playlist/(\\w+).html', 'tencent', 'playlist'],
        ['xiami.com.*song/(\\w+)', 'xiami', 'song'],
        ['xiami.com.*album/(\\w+)', 'xiami', 'album'],
        ['xiami.com.*artist/(\\w+)', 'xiami', 'artist'],
        ['xiami.com.*collect/(\\w+)', 'xiami', 'playlist'],
        ['bilibili\\.com/video/(BV[\\w]+)', 'bilibili', 'video'],
        ['bilibili\\.com/video/av(\\d+)', 'bilibili', 'video'],
        ['b23\\.tv/(BV[\\w]+)', 'bilibili', 'video'],
        ['b23\\.tv/(av\\d+)', 'bilibili', 'video'],
      ].forEach(function(rule) {
        var patt = new RegExp(rule[0])
        var res = patt.exec(link)
        if (res !== null) {
          result = [rule[1], rule[2], res[1]]
        }
      })
      return result
    },
    fetch: function(source, retryCount = 0) {
      var list = []
      var MAX_RETRY = 2

      return new Promise(function(resolve, reject) {
        var completed = 0
        var total = source.length

        if (total === 0) {
          resolve(list)
          return
        }

        source.forEach(function(raw) {
          var meta = utils.parse(raw)
          if(meta[0]) {
            var skey = JSON.stringify(meta)
            var cachedPlaylist = store.get(skey)
            if(cachedPlaylist) {
              list.push.apply(list, JSON.parse(cachedPlaylist));
              completed++
              if (completed === total) resolve(list)
            } else {
              var fetchData = function(attempt) {
                if (meta[0] === 'bilibili') {
                  // B站API存在CORS限制，直接创建播放条目
                  var bvid = meta[2]
                  var items = []
                  // 创建30个分P条目（邓紫棋合集）
                  for (var i = 1; i <= 30; i++) {
                    items.push({
                      name: '邓紫棋合集 P' + i,
                      artist: 'B站音乐',
                      cover: '',
                      url: 'https://player.bilibili.com/player.html?bvid=' + bvid + '&page=' + i + '&high_quality=1&danmaku=0&autoplay=1',
                      type: 'bilibili',
                      bvid: bvid,
                      cid: 0
                    })
                  }
                  store.set(skey, JSON.stringify(items))
                  list.push.apply(list, items);
                  completed++
                  if (completed === total) resolve(list)
                } else {
                  fetch('https://api.i-meto.com/meting/api?server='+meta[0]+'&type='+meta[1]+'&id='+meta[2]+'&r='+ Math.random())
                    .then(function(response) {
                      if (!response.ok) throw new Error('HTTP error ' + response.status)
                      return response.json()
                    }).then(function(json) {
                      if (json && json.length > 0) {
                        store.set(skey, JSON.stringify(json))
                      }
                      list.push.apply(list, json);
                      completed++
                      if (completed === total) resolve(list)
                    }).catch(function(ex) {
                      if (attempt < MAX_RETRY) {
                        setTimeout(function() {
                          fetchData(attempt + 1)
                        }, 1000 * Math.pow(2, attempt))
                      } else {
                        completed++
                        if (completed === total) {
                          if (list.length > 0) {
                            resolve(list)
                          } else {
                            reject(ex)
                          }
                        }
                      }
                    })
                }
              }
              fetchData(retryCount)
            }
          } else {
            list.push(raw);
            completed++
            if (completed === total) resolve(list)
          }
        })
      })
    },
    secondToTime: function(second) {
      var add0 = function(num) {
        return isNaN(num) ? '00' : (num < 10 ? '0' + num : '' + num)
      };
      var hour = Math.floor(second / 3600);
      var min = Math.floor((second - hour * 3600) / 60);
      var sec = Math.floor(second - hour * 3600 - min * 60);
      return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(':');
    },
    nameMap: {
      dragStart: isMobile ? 'touchstart' : 'mousedown',
      dragMove: isMobile ? 'touchmove' : 'mousemove',
      dragEnd: isMobile ? 'touchend' : 'mouseup',
    }
  }, source = null;

  t.player = {
    _id: utils.random(999999),
    group: true,
    load: function(newList) {
      var d = ""
      var that = this

      if(newList && newList.length > 0) {
        if(this.options.rawList !== newList) {
          this.options.rawList = newList;
          playlist.clear()
        }
      } else {
        d = "none"
        this.pause()
      }
      for(var el in buttons.el) {
        buttons.el[el].display(d)
      }
      return this
    },
    saveState: function() {
      if (playlist.current()) {
        var state = {
          index: playlist.index,
          time: source.currentTime,
          mode: this.options.mode,
          volume: source.volume,
          muted: source.muted
        }
        store.set('_PlayerState_' + this._id, JSON.stringify(state))
      }
    },
    restoreState: function() {
      var stateStr = store.get('_PlayerState_' + this._id)
      if (stateStr) {
        try {
          var state = JSON.parse(stateStr)
          if (typeof state.index === 'number' && state.index >= 0 && state.index < playlist.data.length) {
            playlist.index = state.index
          }
          if (typeof state.mode === 'string') {
            this.options.mode = state.mode
            store.set('_PlayerMode', state.mode)
          }
          if (typeof state.volume === 'number') {
            this.volume(state.volume)
          }
          if (state.muted) {
            this.muted('muted')
          }
          return state
        } catch (e) {}
      }
      return null
    },
    fetch: function () {
      var that = this;
      return new Promise(function(resolve, reject) {
          if(playlist.data.length > 0) {
            resolve()
          } else {
            if(that.options.rawList) {
              var promises = [];

              that.options.rawList.forEach(function(raw, index) {
                promises.push(new Promise(function(resolve, reject) {
                  var group = index
                  var sourceData
                  if(!raw.list) {
                    group = 0
                    that.group = false
                    sourceData = [raw]
                  } else {
                    that.group = true
                    sourceData = raw.list
                  }
                  utils.fetch(sourceData).then(function(list) {
                    playlist.add(group, list)
                    resolve()
                  }).catch(function(ex) {
                    resolve()
                  })
                }))
              })

              Promise.all(promises).then(function() {
                resolve(true)
              })
            }
          }
        }).then(function(c) {
          if(c) {
            playlist.create()
            controller.create()
            that.mode()
            var savedState = that.restoreState()
            if (savedState && typeof savedState.time === 'number') {
              source.currentTime = savedState.time
            }
          }
        })
    },
    // 根据模式切换当前曲目index
    mode: function() {
      var total = playlist.data.length;

      if(!total || playlist.errnum == total)
        return;

      var step = controller.step == 'next' ? 1 : -1

      var next = function() {
        var index = playlist.index + step
        if(index > total || index < 0) {
          index = controller.step == 'next' ? 0 : total-1;
        }
        playlist.index = index;
      }

      var random = function() {
        var p = utils.random(total)
        if(playlist.index !== p) {
          playlist.index = p
        } else {
          next()
        }
      }

      switch (this.options.mode) {
        case 'random':
          random()
          break;
        case 'order':
          next()
          break;
        case 'loop':
          if(controller.step)
            next()

          if(playlist.index == -1)
            random()
          break;
      }

      this.init()
    },
    // 直接设置当前曲目index
    switch: function(index) {
      if(typeof index == 'number'
        && index != playlist.index
        && playlist.current()
        && !playlist.current().error) {
        playlist.index = index;
        this.init()
      }
    },
    // 更新source为当前曲目index
    init: function() {
      var item = playlist.current()

      if(!item || item['error']) {
        this.mode();
        return;
      }

      var playing = !source.paused
      if(playing) {
        this.stop()
      }

      if (item.type === 'bilibili') {
        // B站视频不走audio元素，直接渲染预览
        progress.create()
        if(this.options.type == 'audio')
          preview.create()
        if(playing) {
          this.play()
        }
      } else {
        source.attr('src', item.url);
        source.attr('title', item.name + ' - ' + item.artist);
        this.volume(store.get('_PlayerVolume') || '0.7')
        this.muted(store.get('_PlayerMuted'))

        progress.create()

        if(this.options.type == 'audio')
          preview.create()

        if(playing) {
          this.play()
        }
      }
    },
    play: function() {
      NOWPLAYING && NOWPLAYING.player.pause()

      if(playlist.current().error) {
        this.mode();
        return;
      }
      var that = this
      if (playlist.current().type === 'bilibili') {
        var iframe = preview.el && preview.el.find('iframe')[0]
        if (iframe) {
          iframe.contentWindow.postMessage(JSON.stringify({
            "type":"play"
          }), "*")
        }
        playlist.scroll()
      } else {
        source.play().then(function() {
          playlist.scroll()
        }).catch(function(e) {});
      }
    },
    pause: function() {
      if (playlist.current() && playlist.current().type === 'bilibili') {
        var iframe = preview.el && preview.el.find('iframe')[0]
        if (iframe) {
          iframe.contentWindow.postMessage(JSON.stringify({
            "type":"pause"
          }), "*")
        }
      } else {
        source.pause()
      }
      document.title = originTitle
    },
    stop: function() {
      if (playlist.current() && playlist.current().type === 'bilibili') {
        var iframe = preview.el && preview.el.find('iframe')[0]
        if (iframe) {
          iframe.contentWindow.postMessage(JSON.stringify({
            "type":"pause"
          }), "*")
        }
      } else {
        source.pause();
        source.currentTime = 0;
      }
      document.title = originTitle;
    },
    seek: function(time) {
      time = Math.max(time, 0)
      time = Math.min(time, source.duration)
      source.currentTime = time;
      progress.update(time / source.duration)
    },
    muted: function(status) {
      if(status == 'muted') {
        source.muted = status
        store.set('_PlayerMuted', status)
        controller.update(0)
      } else {
        store.del('_PlayerMuted')
        source.muted = false
        controller.update(source.volume)
      }
    },
    volume: function(percentage) {
      if (!isNaN(percentage)) {
        controller.update(percentage)
        store.set('_PlayerVolume', percentage)
        source.volume = percentage
      }
    },
    mini: function() {
      info.hide()
    }
  };

  var info = {
    el: null,
    create: function() {
      if(this.el)
        return;

      this.el = t.createChild('div', {
        className: 'player-info',
        innerHTML: (t.player.options.type == 'audio' ? '<div class="preview"></div>' : '') + '<div class="controller"></div><div class="playlist"></div>'
      }, 'after');

      preview.el = this.el.child(".preview");
      playlist.el = this.el.child(".playlist");
      controller.el = this.el.child(".controller");
    },
    hide: function() {
      var el = this.el
      el.addClass('hide');
      window.setTimeout(function() {
        el.removeClass('show hide')
      }, 300);
    }
  }

  var playlist = {
    el: null,
    data: [],
    index: -1,
    errnum: 0,
    add: function(group, list) {
      var that = this
      list.forEach(function(item, i) {
        item.group = group;
        item.name = escapeHtml(item.name || item.title || 'Meida name');
        item.artist = escapeHtml(item.artist || item.author || 'Anonymous');
        item.cover = item.cover || item.pic;
        item.type = item.type || 'normal';

        that.data.push(item);
      });
    },
    clear: function() {
      this.data = []
      this.el.innerHTML = ""

      if(this.index !== -1) {
        this.index = -1
        t.player.fetch()
      }
    },
    create: function() {
      var el = this.el

      this.data.map(function(item, index) {
        if(item.el)
          return

        var id = 'list-' + t.player._id + '-'+item.group
        var tab = $('#' + id)
        if(!tab) {
          tab = el.createChild('div', {
            id: id,
            className: t.player.group ?'tab':'',
            innerHTML: '<ol></ol>',
          })
          if(t.player.group) {
            tab.attr('data-title', t.player.options.rawList[item.group]['title'])
                .attr('data-id', t.player._id)
          }
        }

        item.el = tab.child('ol').createChild('li', {
          title: item.name + ' - ' + item.artist,
          innerHTML: '<span class="info"><span>'+item.name+'</span><span>'+item.artist+'</span></span>',
          onclick: function(event) {
            var current = event.currentTarget;
            if(playlist.index === index && progress.el) {
              if(source.paused) {
                t.player.play();
              } else {
                t.player.seek(source.duration * progress.percent(event, current))
              }
              return;
            }
            t.player.switch(index);
            t.player.play();
          }
        })

        return item
      })

      tabFormat()
    },
    current: function() {
      return this.data[this.index]
    },
    scroll: function() {
      var item = this.current()
      var li = this.el.child('li.active')
      li && li.removeClass('active')
      var tab = this.el.child('.tab.active')
      tab && tab.removeClass('active')
      li = this.el.find('.nav li')[item.group]
      li && li.addClass('active')
      tab = this.el.find('.tab')[item.group]
      tab && tab.addClass('active')

      pageScroll(item.el, item.el.offsetTop)

      return this
    },
    title: function() {
      if(source.paused)
        return

      var current = this.current()
      document.title = 'Now Playing...' + current['name'] + ' - ' + current['artist'] + ' | ' + originTitle;
    },
    error: function() {
      var current = this.current()
      current.el.removeClass('current').addClass('error')
      current.error = true
      this.errnum++
    }
  }

  var lyrics = {
    el: null,
    data: null,
    index: 0,
    animationFrame: null,
    create: function(box) {
      var current = playlist.index
      var that = this
      var raw = playlist.current().lrc

      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
        this.animationFrame = null
      }

      var callback = function(body) {
        if(current !== playlist.index)
          return;

        that.data = that.parse(body)

        var lrc = ''
        that.data.forEach(function(line, index) {
          lrc += '<p'+(index===0?' class="current"':'')+'>'+line[1]+'</p>';
        })

        that.el = box.createChild('div', {
          className: 'inner',
          innerHTML: lrc
        }, 'replace')

        that.index = 0;
      }

      if(raw && raw.startsWith('http'))
        this.fetch(raw, callback)
      else if (raw)
        callback(raw)
      else
        box.innerHTML = '<div class="inner"></div>'
    },
    update: function(currentTime) {
      if(!this.data || !this.el || this.data.length === 0)
        return

      if (this.index > this.data.length - 1 || currentTime < this.data[this.index][0] || (!this.data[this.index + 1] || currentTime >= this.data[this.index + 1][0])) {
        var targetIndex = -1
        for (var i = 0; i < this.data.length; i++) {
          if (currentTime >= this.data[i][0] && (!this.data[i + 1] || currentTime < this.data[i + 1][0])) {
            targetIndex = i
            break
          }
        }

        if (targetIndex !== -1 && targetIndex !== this.index) {
          this.index = targetIndex
          var y = -(this.index - 1)
          this.el.style.transform = 'translateY(' + y + 'rem)'
          this.el.style.webkitTransform = 'translateY(' + y + 'rem)'

          var currentEls = this.el.getElementsByClassName('current')
          if (currentEls.length > 0) {
            currentEls[0].removeClass('current')
          }

          var pEls = this.el.getElementsByTagName('p')
          if (pEls[targetIndex]) {
            pEls[targetIndex].addClass('current')
          }
        }
      }
    },
    parse: function(lrc_s) {
      if (!lrc_s) return []

      var lrc = []
      var timeTagPattern = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?]/g
      var lines = lrc_s.split('\n')

      lines.forEach(function(line) {
        var lrcText = line.replace(timeTagPattern, '').replace(/^\s+|\s+$/g, '')
        if (!lrcText) return

        var match
        while ((match = timeTagPattern.exec(line)) !== null) {
          var min2sec = parseInt(match[1]) * 60
          var sec2sec = parseInt(match[2])
          var msec2sec = match[3] ? parseInt(match[3]) / ((match[3] + '').length === 2 ? 100 : 1000) : 0
          var lrcTime = min2sec + sec2sec + msec2sec
          lrc.push([lrcTime, lrcText])
        }
      })

      return lrc.sort(function(a, b) { return a[0] - b[0] })
    },
    fetch: function(url, callback) {
      fetch(url)
          .then(function(response) {
            if (!response.ok) throw new Error('HTTP error ' + response.status)
            return response.text()
          }).then(function(body) {
            callback(body)
          }).catch(function(ex) {
            callback('')
          })
    }
  }

  var preview = {
    el: null,
    create: function () {
      var current = playlist.current()

      if (current.type === 'bilibili') {
        this.el.innerHTML = '<div class="cover"><div class="bilibili-player-embed"><iframe src="' + current.url + '" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe></div></div>'
        + '<div class="info"><h4 class="title">'+current.name+'</h4><span>'+current.artist+'</span></div>'
      } else {
        this.el.innerHTML = '<div class="cover"><div class="disc"><img src="'+(current.cover)+'" class="blur" /></div></div>'
        + '<div class="info"><h4 class="title">'+current.name+'</h4><span>'+current.artist+'</span>'
        + '<div class="lrc"></div></div>'

        this.el.child('.cover').addEventListener('click', t.player.options.events['play-pause'])

        lyrics.create(this.el.child('.lrc'))
      }
    }
  }

  var progress = {
    el: null,
    bar: null,
    create: function() {
      var current = playlist.current().el

      if(current) {

        if(this.el) {
          this.el.parentNode.removeClass('current')
            .removeEventListener(utils.nameMap.dragStart, this.drag)
          this.el.remove()
        }

        this.el = current.createChild('div', {
          className: 'progress'
        })

        this.el.attr('data-dtime', utils.secondToTime(0))

        this.bar = this.el.createChild('div', {
          className: 'bar',
        })

        current.addClass('current')

        current.addEventListener(utils.nameMap.dragStart, this.drag);

        playlist.scroll()
      }
    },
    update: function(percent) {
      this.bar.width(Math.floor(percent * 100) + '%')
      this.el.attr('data-ptime', utils.secondToTime(percent * source.duration))
    },
    seeking: function(type) {
      if(type)
        this.el.addClass('seeking')
      else
        this.el.removeClass('seeking')
    },
    percent: function(e, el) {
      var percentage = ((e.clientX || e.changedTouches[0].clientX) - el.left()) / el.width();
      percentage = Math.max(percentage, 0);
      return Math.min(percentage, 1)
    },
    drag: function(e) {
      e.preventDefault()

      var current = playlist.current().el

      var thumbMove = function(e) {
        e.preventDefault()
        var percentage = progress.percent(e, current)
        progress.update(percentage)
        lyrics.update(percentage * source.duration);
      };

      var thumbUp = function(e) {
        e.preventDefault()
        current.removeEventListener(utils.nameMap.dragEnd, thumbUp)
        current.removeEventListener(utils.nameMap.dragMove, thumbMove)
        var percentage = progress.percent(e, current)
        progress.update(percentage)
        t.player.seek(percentage * source.duration)
        source.disableTimeupdate = false
        progress.seeking(false)
      };

      source.disableTimeupdate = true
      progress.seeking(true)
      current.addEventListener(utils.nameMap.dragMove, thumbMove)
      current.addEventListener(utils.nameMap.dragEnd, thumbUp)
    }
  }

  var controller = {
    el: null,
    btns: {},
    step: 'next',
    create: function () {
      if(!t.player.options.controls)
        return

      var that = this
      t.player.options.controls.forEach(function(item) {
        if(that.btns[item])
          return;

        var opt = {
          onclick: function(event){
            that.events[item] ? that.events[item](event) : t.player.options.events[item](event)
          }
        }

        switch(item) {
          case 'volume':
            opt.className = ' ' + (source.muted ? 'off' : 'on')
            opt.innerHTML = '<div class="bar"></div>'
            opt['on'+utils.nameMap.dragStart] = that.events['volume']
            opt.onclick = null
            break;
          case 'mode':
            opt.className = ' ' + t.player.options.mode
            break;
          default:
            opt.className = ''
            break;
        }

        opt.className = item + opt.className + ' btn'

        that.btns[item] = that.el.createChild('div', opt)
      })

      that.btns['volume'].bar = that.btns['volume'].child('.bar')
    },
    events: {
      mode: function(e) {
        switch(t.player.options.mode) {
          case 'loop':
            t.player.options.mode = 'random'
            break;
          case 'random':
            t.player.options.mode = 'order'
            break;
          default:
            t.player.options.mode = 'loop'
        }

        controller.btns['mode'].className = 'mode ' + t.player.options.mode + ' btn'
        store.set('_PlayerMode', t.player.options.mode)
      },
      volume: function(e) {
        e.preventDefault()

        var current = e.currentTarget

        var drag = false

        var thumbMove = function(e) {
          e.preventDefault()
          t.player.volume(controller.percent(e, current))
          drag = true
        };

        var thumbUp = function(e) {
          e.preventDefault()
          current.removeEventListener(utils.nameMap.dragEnd, thumbUp)
          current.removeEventListener(utils.nameMap.dragMove, thumbMove)
          if(drag) {
            t.player.muted()
            t.player.volume(controller.percent(e, current))
          } else {
            if (source.muted) {
              t.player.muted()
              t.player.volume(source.volume)
            } else {
              t.player.muted('muted')
              controller.update(0)
            }
          }
        };

        current.addEventListener(utils.nameMap.dragMove, thumbMove)
        current.addEventListener(utils.nameMap.dragEnd, thumbUp)
      },
      backward: function(e) {
        controller.step = 'prev'
        t.player.mode()
      },
      forward: function(e) {
        controller.step = 'next'
        t.player.mode()
      },
    },
    update: function(percent) {
      controller.btns['volume'].className = 'volume '+ (!source.muted && percent > 0? 'on' :'off') +' btn'
      controller.btns['volume'].bar.width(Math.floor(percent * 100) + '%')
    },
    percent: function(e, el) {
      var percentage = ((e.clientX || e.changedTouches[0].clientX) - el.left()) / el.width();
      percentage = Math.max(percentage, 0);
      return Math.min(percentage, 1);
    }
  }

  var events = {
    onerror: function() {
      playlist.error()
      t.player.mode()
    },
    ondurationchange: function() {
      if (source.duration !== 1) {
        progress.el.attr('data-dtime', utils.secondToTime(source.duration))
      }
    },
    onloadedmetadata: function() {
      t.player.seek(0)
      progress.el.attr('data-dtime', utils.secondToTime(source.duration))
      var savedState = t.player.restoreState()
      if (savedState && typeof savedState.time === 'number') {
        source.currentTime = savedState.time
      }
    },
    onplay: function() {
      t.parentNode.addClass('playing')
      showtip(this.attr('title'))
      NOWPLAYING = t
    },
    onpause: function() {
      t.parentNode.removeClass('playing')
      NOWPLAYING = null
      t.player.saveState()
    },
    ontimeupdate: function() {
      if(!this.disableTimeupdate) {
        progress.update(this.currentTime / this.duration)
        lyrics.update(this.currentTime)
      }
    },
    onended: function(argument) {
      t.player.saveState()
      t.player.mode()
      t.player.play()
    },
    onseeked: function() {
      t.player.saveState()
    }
  }

  var buttons = {
    el: {},
    create: function() {
      if(!t.player.options.btns)
        return

      var that = this
      t.player.options.btns.forEach(function(item) {
        if(that.el[item])
          return;

        that.el[item] = t.createChild('div', {
            className: item + ' btn',
            onclick: function(event){
              t.player.fetch().then(function() {
                t.player.options.events[item](event)
              })
            }
          });
      });
    }
  }

  var init = function(config) {
    if(t.player.created)
      return;


    t.player.options = Object.assign(option, config);
    t.player.options.mode = store.get('_PlayerMode') || t.player.options.mode

    // 初始化button、controls以及click事件
    buttons.create()

    // 初始化audio or video
    source = t.createChild(t.player.options.type, events);
    // 初始化播放列表、预览、控件按钮等
    info.create();

    t.parentNode.addClass(t.player.options.type)

    // 监听B站iframe播放器的播放结束事件，自动切换下一首
    window.addEventListener('message', function(e) {
      var current = playlist.current()
      if (!current || current.type !== 'bilibili') return
      try {
        var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        if (d && (d.command === 'ended' || d.type === 'ended' || d.event === 'ended')) {
          t.player.mode()
          t.player.play()
        }
      } catch(err) {}
    })

    t.player.created = true;
  }

  init(config)

  return t;
}

const bilibiliPlayer = function(t, config) {
  var option = {
    mode: 'order',
    btns: ['play-pause', 'music'],
    controls: ['mode', 'backward', 'play-pause', 'forward'],
    events: {
      "play-pause": function(event) {
        var iframe = t.querySelector('iframe')
        if (iframe) {
          var wrapper = t.querySelector('.bilibili-wrapper')
          wrapper.toggleClass('playing')
        }
      },
      "music": function(event) {
        var info = t.querySelector('.bilibili-info')
        if(info) {
          if(info.hasClass('show')) {
            info.removeClass('show')
            info.addClass('hide')
            setTimeout(function() {
              info.removeClass('show hide')
            }, 300)
          } else {
            info.addClass('show')
          }
        }
      }
    }
  }

  var data = {
    list: [],
    index: 0,
    iframe: null,
    wrapper: null,
    info: null,
    controller: null,
    playlist: null
  }

  var utils = {
    random: function(len) {
      return Math.floor((Math.random()*len))
    },
    buildUrl: function(bvid, page) {
      return 'https://player.bilibili.com/player.html?bvid=' + bvid +
             '&page=' + (page || 1) +
             '&high_quality=1&danmaku=0&autoplay=1'
    }
  }

  t.player = {
    load: function(newList) {
      if(newList && newList.length > 0) {
        data.list = newList
        this.render()
      }
    },
    render: function() {
      if(data.list.length === 0) return

      var current = data.list[data.index]
      var html = '<div class="bilibili-wrapper">' +
                 '<div class="bilibili-frame">' +
                 '<iframe src="' + utils.buildUrl(current.bvid, current.page) + '" ' +
                 'scrolling="no" border="0" frameborder="no" framespacing="0" ' +
                 'allowfullscreen="true"></iframe>' +
                 '</div>' +
                 '<div class="bilibili-cover">' +
                 '<div class="cover-img" style="background-image:url(' + (current.cover || '') + ')"></div>' +
                 '<div class="cover-play"><i class="ic i-play"></i></div>' +
                 '</div>' +
                 '</div>' +
                 '<div class="bilibili-meta">' +
                 '<h4 class="title">' + escapeHtml(current.title || current.bvid) + '</h4>' +
                 '<span class="author">' + escapeHtml(current.author || 'Bilibili') + '</span>' +
                 '</div>'

      t.innerHTML = html

      data.wrapper = t.querySelector('.bilibili-wrapper')
      data.iframe = t.querySelector('iframe')

      this.createInfo()
      this.createController()
      this.updateController()

      var that = this
      data.wrapper.addEventListener('click', function() {
        that.togglePlay()
      })
    },
    createInfo: function() {
      data.info = document.createElement('div')
      data.info.className = 'bilibili-info'

      var listHtml = '<ol>'
      data.list.forEach(function(item, index) {
        listHtml += '<li data-index="' + index + '" title="' + escapeHtml(item.title || item.bvid) + '">' +
                   '<span class="info"><span>' + escapeHtml(item.title || item.bvid) + '</span>' +
                   '<span>' + escapeHtml(item.author || 'Bilibili') + '</span></span>' +
                   '</li>'
      })
      listHtml += '</ol>'

      data.info.innerHTML = '<div class="controller"></div><div class="playlist">' + listHtml + '</div>'
      t.appendChild(data.info)

      var that = this
      data.info.querySelectorAll('li').forEach(function(li) {
        li.addEventListener('click', function(e) {
          e.stopPropagation()
          var idx = parseInt(this.getAttribute('data-index'))
          if(idx !== data.index) {
            data.index = idx
            that.render()
          }
        })
      })
    },
    createController: function() {
      var ctrl = data.info.querySelector('.controller')
      if(!ctrl) return

      var that = this
      var btns = ['mode', 'backward', 'play-pause', 'forward']
      btns.forEach(function(item) {
        var btn = document.createElement('div')
        btn.className = item + ' btn'
        btn.addEventListener('click', function(e) {
          e.stopPropagation()
          that.handleControl(item)
        })
        ctrl.appendChild(btn)
      })
    },
    updateController: function() {
      var modeBtn = data.info.querySelector('.mode')
      if(modeBtn) modeBtn.className = 'mode ' + option.mode + ' btn'

      var lis = data.info.querySelectorAll('li')
      lis.forEach(function(li) {
        li.removeClass('active')
      })
      if(lis[data.index]) {
        lis[data.index].addClass('active')
      }
    },
    handleControl: function(action) {
      switch(action) {
        case 'mode':
          switch(option.mode) {
            case 'loop': option.mode = 'random'; break
            case 'random': option.mode = 'order'; break
            default: option.mode = 'loop'
          }
          store.set('_PlayerMode', option.mode)
          this.updateController()
          break
        case 'backward':
          this.prev()
          break
        case 'forward':
          this.next()
          break
        case 'play-pause':
          this.togglePlay()
          break
      }
    },
    togglePlay: function() {
      if(data.wrapper) {
        data.wrapper.toggleClass('playing')
      }
    },
    next: function() {
      var total = data.list.length
      if(total <= 1) return

      switch(option.mode) {
        case 'random':
          var next = utils.random(total)
          if(next === data.index) next = (next + 1) % total
          data.index = next
          break
        case 'order':
          data.index = (data.index + 1) % total
          break
        case 'loop':
          data.index = (data.index + 1) % total
          break
      }
      this.render()
    },
    prev: function() {
      var total = data.list.length
      if(total <= 1) return

      switch(option.mode) {
        case 'random':
          var prev = utils.random(total)
          if(prev === data.index) prev = (prev - 1 + total) % total
          data.index = prev
          break
        case 'order':
        case 'loop':
          data.index = (data.index - 1 + total) % total
          break
      }
      this.render()
    }
  }

  var init = function(config) {
    if(t.player.created) return
    option = Object.assign(option, config)
    option.mode = store.get('_PlayerMode') || option.mode
    t.player.created = true
  }

  init(config)

  var srcData = t.attr('data-src')
  if(srcData) {
    try {
      var list = JSON.parse(srcData)
      t.player.load(list)
    } catch(e) {}
  }

  return t
}
var statics = CONFIG.statics.indexOf('//') > 0 ? CONFIG.statics : CONFIG.root
var scrollAction = { x: 'undefined', y: 'undefined' };
var diffY = 0;
var originTitle, titleTime;

var BODY = document.getElementsByTagName('body')[0];
var HTML = document.documentElement;
var Container = $('#container');
var loadCat = $('#loading');
var siteNav = $('#nav');
var siteHeader = $('#header');
var menuToggle = siteNav.child('.toggle');
var quickBtn = $('#quick');
var sideBar = $('#sidebar');
var siteBrand = $('#brand');
var toolBtn = $('#tool'), toolPlayer, backToTop, goToComment, showContents;
var siteSearch = $('#search');
var siteNavHeight, headerHightInner, headerHight;
var oWinHeight = window.innerHeight;
var oWinWidth = window.innerWidth;
var LOCAL_HASH = 0, LOCAL_URL = window.location.href;
var pjax;
var lazyload = lozad('img, [data-background-image]', {
    loaded: function(el) {
        el.addClass('lozaded');
    },
    error: function(el) {
        if (el.tagName === 'IMG' && !el.dataset.err) {
            el.dataset.err = '1';
            el.src = CONFIG.root + 'assets/404.svg';
        }
    }
})

var Loader = {
  timer: null,
  lock: false,
  show: function() {
    clearTimeout(this.timer);
    document.body.removeClass('loaded');
    loadCat.attr('style', 'display:block');
    Loader.lock = false;
  },
  hide: function(sec) {
    if(!CONFIG.loader.start)
      sec = -1
    this.timer = setTimeout(this.vanish, sec||3000);
  },
  vanish: function() {
    if(Loader.lock)
      return;
    if(CONFIG.loader.start)
      transition(loadCat, 0)
    document.body.addClass('loaded');
    Loader.lock = true;
  }
}

var changeTheme = function(type) {
  var btn = $('.theme .ic')
  if(type == 'dark') {
    HTML.attr('data-theme', type);
    btn.removeClass('i-sun')
    btn.addClass('i-moon')
  } else {
    HTML.attr('data-theme', null);
    btn.removeClass('i-moon');
    btn.addClass('i-sun');
  }
}

var changeMetaTheme = function(color) {
  if(HTML.attr('data-theme') == 'dark')
    color = '#222'

  $('meta[name="theme-color"]').attr('content', color);
}

var themeColorListener = function () {
  window.matchMedia('(prefers-color-scheme: dark)').addListener(function(mediaQueryList) {
    if(mediaQueryList.matches){
      changeTheme('dark');
    } else {
      changeTheme();
    }
  });

  var t = store.get('theme');
  if(t) {
    changeTheme(t);
  } else {
    if(CONFIG.darkmode) {
      changeTheme('dark');
    }
  }

  $('.theme').addEventListener('click', function(event) {
    var btn = event.currentTarget.child('.ic')

    var neko = BODY.createChild('div', {
      id: 'neko',
      innerHTML: '<div class="planet"><div class="sun"></div><div class="moon"></div></div><div class="body"><div class="face"><section class="eyes left"><span class="pupil"></span></section><section class="eyes right"><span class="pupil"></span></section><span class="nose"></span></div></div>'
    });

    var hideNeko = function() {
        transition(neko, {
          delay: 2500,
          opacity: 0
        }, function() {
          BODY.removeChild(neko)
        });
    }

    var c;
    if(btn.hasClass('i-sun')) {
      c = function() {
          neko.addClass('dark');
          changeTheme('dark');
          store.set('theme', 'dark');
          hideNeko();
        }
    } else {
      neko.addClass('dark');
      c = function() {
          neko.removeClass('dark');
          changeTheme();
          store.set('theme', 'light');
          hideNeko();
        }
    }
    transition(neko, 1, function() {
      setTimeout(c, 210)
    })
  });
}

var visibilityListener = function () {
  document.addEventListener('visibilitychange', function() {
    switch(document.visibilityState) {
      case 'hidden':
        $('[rel="icon"]').attr('href', statics + CONFIG.favicon.hidden);
        document.title = LOCAL.favicon.hide;
        if(CONFIG.loader.switch)
          Loader.show()
        clearTimeout(titleTime);
      break;
      case 'visible':
        $('[rel="icon"]').attr('href', statics + CONFIG.favicon.normal);
        document.title = LOCAL.favicon.show;
        if(CONFIG.loader.switch)
          Loader.hide(1000)
        titleTime = setTimeout(function () {
          document.title = originTitle;
        }, 2000);
      break;
    }
  });
}

var showtip = function(msg) {
  if(!msg)
    return

  var tipbox = BODY.createChild('div', {
    innerHTML: msg,
    className: 'tip'
  });

  setTimeout(function() {
    tipbox.addClass('hide')
    setTimeout(function() {
      BODY.removeChild(tipbox);
    }, 300);
  }, 3000);
}

var resizeHandle = function (event) {
  siteNavHeight = siteNav.height();
  headerHightInner = siteHeader.height();
  headerHight = headerHightInner + $('#waves').height();

  if(oWinWidth != window.innerWidth)
    sideBarToggleHandle(null, 1);

  oWinHeight = window.innerHeight;
  oWinWidth = window.innerWidth;
  sideBar.child('.panels').height(oWinHeight + 'px')
}

var scrollHandle = function (event) {
  var winHeight = window.innerHeight;
  var docHeight = getDocHeight();
  var contentVisibilityHeight = docHeight > winHeight ? docHeight - winHeight : document.body.scrollHeight - winHeight;
  var SHOW = window.pageYOffset > headerHightInner;
  var startScroll = window.pageYOffset > 0;

  if (SHOW) {
    changeMetaTheme('#FFF');
  } else {
    changeMetaTheme('#222');
  }

  siteNav.toggleClass('show', SHOW);
  toolBtn.toggleClass('affix', startScroll);
  siteBrand.toggleClass('affix', startScroll);
  sideBar.toggleClass('affix', window.pageYOffset > headerHight && document.body.offsetWidth > 991);

  if (typeof scrollAction.y == 'undefined') {
    scrollAction.y = window.pageYOffset;
    //scrollAction.x = Container.scrollLeft;
    //scrollAction.y = Container.scrollTop;
  }
  //var diffX = scrollAction.x - Container.scrollLeft;
  diffY = scrollAction.y - window.pageYOffset;

  //if (diffX < 0) {
  // Scroll right
  //} else if (diffX > 0) {
  // Scroll left
  //} else
  if (diffY < 0) {
    // Scroll down
    siteNav.removeClass('up')
    siteNav.toggleClass('down', SHOW);
  } else if (diffY > 0) {
    // Scroll up
    siteNav.removeClass('down')
    siteNav.toggleClass('up', SHOW);
  } else {
    // First scroll event
  }
  //scrollAction.x = Container.scrollLeft;
  scrollAction.y = window.pageYOffset;

  var scrollPercent = Math.round(Math.min(100 * window.pageYOffset / contentVisibilityHeight, 100)) + '%';
  backToTop.child('span').innerText = scrollPercent;
  $('.percent').width(scrollPercent);
}

var pagePosition = function() {
  if(CONFIG.auto_scroll)
    store.set(LOCAL_URL, scrollAction.y)
}

var positionInit = function(comment) {
  var anchor = window.location.hash
  var target = null;
  if(LOCAL_HASH) {
    store.del(LOCAL_URL);
    return
  }

  if(anchor)
    target = $(decodeURI(anchor))
  else {
    target = CONFIG.auto_scroll ? parseInt(store.get(LOCAL_URL)) : 0
  }

  if(target) {
    pageScroll(target);
    LOCAL_HASH = 1;
  }

  if(comment && anchor && !LOCAL_HASH) {
    pageScroll(target);
    LOCAL_HASH = 1;
  }

}

var clipBoard = function(str, callback) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(str).then(function() {
      callback && callback(true);
    }).catch(function() {
      clipBoardFallback(str, callback);
    });
  } else {
    clipBoardFallback(str, callback);
  }
}

var clipBoardFallback = function(str, callback) {
  var ta = BODY.createChild('textarea', {
    style: {
      top: window.scrollY + 'px',
      position: 'absolute',
      opacity: '0'
    },
    readOnly: true,
    value: str
  });

  var selection = document.getSelection();
  var selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
  ta.select();
  ta.setSelectionRange(0, str.length);
  ta.readOnly = false;
  var result = document.execCommand('copy');
  callback && callback(result);
  ta.blur();
  if (selected) {
    selection.removeAllRanges();
    selection.addRange(selected);
  }
  BODY.removeChild(ta);
}

var sideBarToggleHandle = function (event, force) {
  if(sideBar.hasClass('on')) {
    sideBar.removeClass('on');
    menuToggle.removeClass('close');
    if(force) {
      sideBar.style = '';
    } else {
      transition(sideBar, 'slideRightOut');
    }
  } else {
    if(force) {
      sideBar.style = '';
    } else {
      transition(sideBar, 'slideRightIn', function () {
          sideBar.addClass('on');
          menuToggle.addClass('close');
        });
    }
  }
}

var sideBarTab = function () {
  var sideBarInner = sideBar.child('.inner');
  var panels = sideBar.find('.panel');

  if(sideBar.child('.tab')) {
    sideBarInner.removeChild(sideBar.child('.tab'));
  }

  var list = document.createElement('ul');
  var active = 'active';
  list.className = 'tab';

  ['contents', 'related', 'overview'].forEach(function (item) {
    var element = sideBar.child('.panel.' + item)

    if(element.innerHTML.replace(/(^\s*)|(\s*$)/g, "").length < 1) {
      if(item == 'contents') {
        showContents.display("none")
      }
      return;
    }

    if(item == 'contents') {
      showContents.display("")
    }

    var tab = document.createElement('li')
    var span = document.createElement('span')
    var text = document.createTextNode(element.attr('data-title'));
    span.appendChild(text);
    tab.appendChild(span);
    tab.addClass(item + ' item');

    if(active) {
      element.addClass(active);
      tab.addClass(active);
    } else {
      element.removeClass('active');
    }

    tab.addEventListener('click', function (element) {
      var target = event.currentTarget;
      if (target.hasClass('active'))
        return;

      sideBar.find('.tab .item').forEach(function (element) {
        element.removeClass('active')
      });

      sideBar.find('.panel').forEach(function (element) {
        element.removeClass('active')
      });

      sideBar.child('.panel.' + target.className.replace(' item', '')).addClass('active');

      target.addClass('active');
    });

    list.appendChild(tab);
    active = '';
  });

  if (list.childNodes.length > 1) {
    sideBarInner.insertBefore(list, sideBarInner.childNodes[0]);
    sideBar.child('.panels').style.paddingTop = ''
  } else {
    sideBar.child('.panels').style.paddingTop = '.625rem'
  }
}

var sidebarTOC = function () {
  var navItems = $.all('.contents li');

  if (navItems.length < 1) {
    return;
  }

  var sections = Array.prototype.slice.call(navItems) || [];
  var activeLock = null;

  sections = sections.map(function (element, index) {
    var link = element.child('a.toc-link');
    var anchor = $(decodeURI(link.attr('href')));
    if(!anchor)
      return
    var alink = anchor.child('a.anchor');

    var anchorScroll = function (event) {
      event.preventDefault();
      var target = $(decodeURI(event.currentTarget.attr('href')));

      activeLock = index;
      pageScroll(target, null, function() {
          activateNavByIndex(index)
          activeLock = null
        })
    };

    link.addEventListener('click', anchorScroll);
    alink && alink.addEventListener('click', function(event) {
      anchorScroll(event)
      clipBoard(CONFIG.hostname + '/' + LOCAL.path + event.currentTarget.attr('href'))
    });
    return anchor;
  });

  var tocElement = sideBar.child('.contents.panel');

  var activateNavByIndex = function (index, lock) {
    var target = navItems[index]

    if (!target)
      return;

    if (target.hasClass('current')) {
      return;
    }

    $.each('.toc .active', function (element) {
      element && element.removeClass('active current');
    });

    sections.forEach(function (element) {
      element && element.removeClass('active');
    });

    target.addClass('active current');
    sections[index] && sections[index].addClass('active');

    var parent = target.parentNode;

    while (!parent.matches('.contents')) {
      if (parent.matches('li')) {
        parent.addClass('active');
        var t = $(parent.child('a.toc-link').attr('href'))
        if(t) {
          t.addClass('active');
        }
      }
      parent = parent.parentNode;
    }
    if(getComputedStyle(sideBar).display != 'none' && tocElement.hasClass('active')) {
      pageScroll(tocElement, target.offsetTop- (tocElement.offsetHeight / 4))
    }
  }

  var findIndex = function(entries) {
    var index = 0;
    var entry = entries[index];

    if (entry.boundingClientRect.top > 0) {
      index = sections.indexOf(entry.target);
      return index === 0 ? 0 : index - 1;
    }
    for (; index < entries.length; index++) {
      if (entries[index].boundingClientRect.top <= 0) {
        entry = entries[index];
      } else {
        return sections.indexOf(entry.target);
      }
    }
    return sections.indexOf(entry.target);
  }

  var createIntersectionObserver = function() {
    if (!window.IntersectionObserver)
      return

    var observer = new IntersectionObserver(function (entries, observe) {
      var index = findIndex(entries) + (diffY < 0? 1 : 0);
      if(activeLock === null) {
        activateNavByIndex(index);
      }
    }, {
      rootMargin: '0px 0px -100% 0px',
      threshold: 0
    });

    sections.forEach(function (element) {
      element && observer.observe(element);
    });
  }

  createIntersectionObserver();
}

var backToTopHandle = function () {
  pageScroll(0);
}

var goToBottomHandle = function () {
  pageScroll(parseInt(Container.height()));
}

var goToCommentHandle = function () {
  pageScroll($('#comments'));
}

var menuActive = function () {
  $.each('.menu .item:not(.title)', function (element) {
    var target = element.child('a[href]');
    var parentItem = element.parentNode.parentNode;
    if (!target) return;
    var isSamePath = target.pathname === location.pathname || target.pathname === location.pathname.replace('index.html', '');
    var isSubPath = !CONFIG.root.startsWith(target.pathname) && location.pathname.startsWith(target.pathname);
    var active = target.hostname === location.hostname && (isSamePath || isSubPath)
    element.toggleClass('active', active);
    if(element.parentNode.child('.active') && parentItem.hasClass('dropdown')) {
      parentItem.removeClass('active').addClass('expand');
    } else {
      parentItem.removeClass('expand');
    }
  });
}
const cardActive = function() {
   // 实现md文件首行缩进<ret/>
   var article1 = document.querySelectorAll('.article ret');
   if(article1.length){
     for(var i=0;i<article1.length;i++){
       article1[i].innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
     }
   }
  if(!$('.index.wrap'))
    return

  if (!window.IntersectionObserver) {
    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
      if( article.hasClass("show") === false){
          article.addClass("show");
      }
    })
  } else {
    var io = new IntersectionObserver(function(entries) {

        entries.forEach(function(article) {
          if (article.target.hasClass("show")) {
            io.unobserve(article.target)
          } else {
            if (article.isIntersecting || article.intersectionRatio > 0) {
              article.target.addClass("show");
              io.unobserve(article.target);
            }
          }
        })
    }, {
        root: null,
        threshold: [0.3]
    });

    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
      io.observe(article)
    })

    $('.index.wrap .item:first-child').addClass("show")
  }

  $.each('.cards .item', function(element, index) {
    ['mouseenter', 'touchstart'].forEach(function(item){
      element.addEventListener(item, function(event) {
        if($('.cards .item.active')) {
          $('.cards .item.active').removeClass('active')
        }
        element.addClass('active')
      })
    });
    ['mouseleave'].forEach(function(item){
      element.addEventListener(item, function(event) {
        element.removeClass('active')
      })
    });
  });
}

const registerExtURL = function() {
  $.each('span.exturl', function(element) {
      var link = document.createElement('a');
      // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
      link.href = decodeURIComponent(atob(element.dataset.url).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      link.rel = 'noopener external nofollow noreferrer';
      link.target = '_blank';
      link.className = element.className;
      link.title = element.title || element.innerText;
      link.innerHTML = element.innerHTML;
      if(element.dataset.backgroundImage) {
        link.dataset.backgroundImage = element.dataset.backgroundImage;
      }
      element.parentNode.replaceChild(link, element);
    });
}

const postFancybox = function(p) {
  if($(p + ' .md img')) {
    vendorCss('fancybox');
    vendorJs('fancybox', function() {
      var q = jQuery.noConflict();

      $.each(p + ' p.gallery', function(element) {
        var box = document.createElement('div');
        box.className = 'gallery';
        box.attr('data-height', element.attr('data-height')||220);

        box.innerHTML = element.innerHTML.replace(/<br>/g, "")

        element.parentNode.insertBefore(box, element);
        element.remove();
      });

      $.each(p + ' .md img:not(.emoji):not(.vemoji)', function(element) {
        var $image = q(element);
        var info, captionClass = 'image-info';
        if(!$image.is('a img')) {
          var imageLink = $image.attr('data-src') || $image.attr('src');
          $image.data('safe-src', imageLink)
          var $imageWrapLink = $image.wrap('<a class="fancybox" href="'+imageLink+'" itemscope itemtype="http://schema.org/ImageObject" itemprop="url"></a>').parent('a');
          if (!$image.is('.gallery img')) {
            $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default');
          } else {
            captionClass = 'jg-caption'
          }
        }
        if(info = element.attr('title')) {
          $imageWrapLink.attr('data-caption', info);
          var para = document.createElement('span');
          var txt = document.createTextNode(info);
          para.appendChild(txt);
          para.addClass(captionClass);
          element.insertAfter(para);
        }
      });

      $.each(p + ' div.gallery', function (el, i) {
        q(el).justifiedGallery({rowHeight: q(el).data('height')||120, rel: 'gallery-' + i}).on('jg.complete', function () {
          q(this).find('a').each(function(k, ele) {
            ele.attr('data-fancybox', 'gallery-' + i);
          });
        });
      });

      q.fancybox.defaults.hash = false;
      q(p + ' .fancybox').fancybox({
        loop   : true,
        helpers: {
          overlay: {
            locked: false
          }
        }
      });
    }, window.jQuery);
  }
}

const postBeauty = function () {
  loadComments();

  if(!$('.md'))
    return

  postFancybox('.post.block');

  $('.post.block').oncopy = function(event) {
    showtip(LOCAL.copyright)

    if(LOCAL.nocopy) {
      event.preventDefault()
      return
    }

    var copyright = $('#copyright')
    if(window.getSelection().toString().length > 30 && copyright) {
      event.preventDefault();
      var author = "# " + copyright.child('.author').innerText
      var link = "# " + copyright.child('.link').innerText
      var license = "# " + copyright.child('.license').innerText
      var htmlData = author + "<br>" + link + "<br>" + license + "<br><br>" + window.getSelection().toString().replace(/\r\n/g, "<br>");;
      var textData = author + "\n" + link + "\n" + license + "\n\n" + window.getSelection().toString().replace(/\r\n/g, "\n");
      if (event.clipboardData) {
          event.clipboardData.setData("text/html", htmlData);
          event.clipboardData.setData("text/plain", textData);
      } else if (window.clipboardData) {
          return window.clipboardData.setData("text", textData);
      }
    }
  }

  $.each('li ruby', function(element) {
    var parent = element.parentNode;
    if(element.parentNode.tagName != 'LI') {
      parent = element.parentNode.parentNode;
    }
    parent.addClass('ruby');
  })

  $.each('ol[start]', function(element) {
    element.style.counterReset = "counter " + parseInt(element.attr('start') - 1)
  })

  $.each('.md table', function (element) {
    element.wrap({
      className: 'table-container'
    });
  });

  $.each('.highlight > .table-container', function (element) {
    element.className = 'code-container'
  });

  $.each('figure.highlight', function (element) {

    var code_container = element.child('.code-container');
    var caption = element.child('figcaption');

    element.insertAdjacentHTML('beforeend', '<div class="operation"><span class="breakline-btn"><i class="ic i-align-left"></i></span><span class="copy-btn"><i class="ic i-clipboard"></i></span><span class="fullscreen-btn"><i class="ic i-expand"></i></span></div>');

    var copyBtn = element.child('.copy-btn');
    if(LOCAL.nocopy) {
      copyBtn.remove()
    } else {
      copyBtn.addEventListener('click', function (event) {
        var target = event.currentTarget;
        var comma = '', code = '';
        code_container.find('pre').forEach(function(line) {
          code += comma + line.innerText;
          comma = '\n'
        })

        clipBoard(code, function(result) {
          target.child('.ic').className = result ? 'ic i-check' : 'ic i-times';
          target.blur();
          showtip(LOCAL.copyright);
        })
      });
      copyBtn.addEventListener('mouseleave', function (event) {
        setTimeout(function () {
          event.target.child('.ic').className = 'ic i-clipboard';
        }, 1000);
      });
    }

    var breakBtn = element.child('.breakline-btn');
    breakBtn.addEventListener('click', function (event) {
      var target = event.currentTarget;
      if (element.hasClass('breakline')) {
        element.removeClass('breakline');
        target.child('.ic').className = 'ic i-align-left';
      } else {
        element.addClass('breakline');
        target.child('.ic').className = 'ic i-align-justify';
      }
    });

    var fullscreenBtn = element.child('.fullscreen-btn');
    var removeFullscreen = function() {
      element.removeClass('fullscreen');
      element.scrollTop = 0;
      BODY.removeClass('fullscreen');
      fullscreenBtn.child('.ic').className = 'ic i-expand';
    }
    var fullscreenHandle = function(event) {
      var target = event.currentTarget;
      if (element.hasClass('fullscreen')) {
        removeFullscreen();
        hideCode && hideCode();
        pageScroll(element)
      } else {
        element.addClass('fullscreen');
        BODY.addClass('fullscreen');
        fullscreenBtn.child('.ic').className = 'ic i-compress';
        showCode && showCode();
      }
    }
    fullscreenBtn.addEventListener('click', fullscreenHandle);
    caption && caption.addEventListener('click', fullscreenHandle);

    if(code_container && code_container.find("tr").length > 15) {
      
      code_container.style.maxHeight = "300px";
      code_container.insertAdjacentHTML('beforeend', '<div class="show-btn"><i class="ic i-angle-down"></i></div>');
      var showBtn = code_container.child('.show-btn');

      var showCode = function() {
        code_container.style.maxHeight = ""
        showBtn.addClass('open')
      }

      var hideCode = function() {
        code_container.style.maxHeight = "300px"
        showBtn.removeClass('open')
      }

      showBtn.addEventListener('click', function(event) {
        if (showBtn.hasClass('open')) {
          removeFullscreen()
          hideCode()
          pageScroll(code_container)
        } else {
          showCode()
        }
      });
    }
  });

  $.each('pre.mermaid > svg', function (element) {
    element.style.maxWidth = ''
  });

  $.each('.reward button', function (element) {
    element.addEventListener('click', function (event) {
      event.preventDefault();
      var qr = $('#qr')
      if(qr.display() === 'inline-flex') {
        transition(qr, 0)
      } else {
        transition(qr, 1, function() {
          qr.display('inline-flex')
        }) // slideUpBigIn
      }
    });
  });

  //quiz
  $.each('.quiz > ul.options li', function (element) {
    element.addEventListener('click', function (event) {
      if (element.hasClass('correct')) {
        element.toggleClass('right')
        element.parentNode.parentNode.addClass('show')
      } else {
        element.toggleClass('wrong')
      }
    });
  });

  $.each('.quiz > p', function (element) {
    element.addEventListener('click', function (event) {
      element.parentNode.toggleClass('show')
    });
  });

  $.each('.quiz > p:first-child', function (element) {
    var quiz = element.parentNode;
    var type = 'choice'
    if(quiz.hasClass('true') || quiz.hasClass('false'))
      type = 'true_false'
    if(quiz.hasClass('multi'))
      type = 'multiple'
    if(quiz.hasClass('fill'))
      type = 'gap_fill'
    if(quiz.hasClass('essay'))
      type = 'essay'
    element.attr('data-type', LOCAL.quiz[type])
  });

  $.each('.quiz .mistake', function (element) {
    element.attr('data-type', LOCAL.quiz.mistake)
  });

  $.each('div.tags a', function(element) {
    element.className = ['primary', 'success', 'info', 'warning', 'danger'][Math.floor(Math.random() * 5)]
  })

  $.each('.md div.player', function(element) {
    var type = element.attr('data-type')
    if (type === 'bilibili') {
      bilibiliPlayer(element, {
        mode: 'order',
        btns: []
      })
    } else {
      mediaPlayer(element, {
        type: type,
        mode: 'order',
        btns: []
      }).player.load(JSON.parse(element.attr('data-src'))).fetch()
    }
  })
}

const tabFormat = function() {
  // tab
  var first_tab
  $.each('div.tab', function(element, index) {
    if(element.attr('data-ready'))
      return

    var id = element.attr('data-id');
    var title = element.attr('data-title');
    var box = $('#' + id);
    if(!box) {
      box = document.createElement('div');
      box.className = 'tabs';
      box.id = id;
      box.innerHTML = '<div class="show-btn"></div>'

      var showBtn = box.child('.show-btn');
      showBtn.addEventListener('click', function(event) {
        pageScroll(box)
      });

      element.parentNode.insertBefore(box, element);
      first_tab = true;
    } else {
      first_tab = false;
    }

    var ul = box.child('.nav ul');
    if(!ul) {
      ul = box.createChild('div', {
        className: 'nav',
        innerHTML: '<ul></ul>'
      }).child('ul');
    }

    var li = ul.createChild('li', {
      innerHTML: title
    });

    if(first_tab) {
      li.addClass('active');
      element.addClass('active');
    }

    li.addEventListener('click', function(event) {
      var target = event.currentTarget;
      box.find('.active').forEach(function(el) {
        el.removeClass('active');
      })
      element.addClass('active');
      target.addClass('active');
    });

    box.appendChild(element);
    element.attr('data-ready', true)
  });
}

const loadComments = function () {
  var element = $('#comments');
  if (!element) {
    goToComment.display("none")
    return;
  } else {
    goToComment.display("")
  }

  if (!window.IntersectionObserver) {
    vendorCss('valine');
  } else {
    var io = new IntersectionObserver(function(entries, observer) {
      var entry = entries[0];
      vendorCss('valine');
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        transition($('#comments'), 'bounceUpIn');
        observer.disconnect();
      }
    });

    io.observe(element);
  }
}

const algoliaSearch = function(pjax) {
  if(CONFIG.search === null)
    return

  if(!siteSearch) {
    siteSearch = BODY.createChild('div', {
      id: 'search',
      innerHTML: '<div class="inner"><div class="header"><span class="icon"><i class="ic i-search"></i></span><div class="search-input-container"></div><span class="close-btn"><i class="ic i-times-circle"></i></span></div><div class="results"><div class="inner"><div id="search-stats"></div><div id="search-hits"></div><div id="search-pagination"></div></div></div></div>'
    });
  }

  var search = instantsearch({
    indexName: CONFIG.search.indexName,
    searchClient  : algoliasearch(CONFIG.search.appID, CONFIG.search.apiKey),
    searchFunction: function(helper) {
      var searchInput = $('.search-input');
      if (searchInput.value) {
        helper.search();
      }
    }
  });

  search.on('render', function() {
    pjax.refresh($('#search-hits'));
  });

  // Registering Widgets
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: CONFIG.search.hits.per_page || 10
    }),

    instantsearch.widgets.searchBox({
      container           : '.search-input-container',
      placeholder         : LOCAL.search.placeholder,
      // Hide default icons of algolia search
      showReset           : false,
      showSubmit          : false,
      showLoadingIndicator: false,
      cssClasses          : {
        input: 'search-input'
      }
    }),

    instantsearch.widgets.stats({
      container: '#search-stats',
      templates: {
        text: function(data) {
          var stats = LOCAL.search.stats
            .replace(/\$\{hits}/, data.nbHits)
            .replace(/\$\{time}/, data.processingTimeMS);
          return stats + '<span class="algolia-powered"></span><hr>';
        }
      }
    }),

    instantsearch.widgets.hits({
      container: '#search-hits',
      templates: {
        item: function(data) {
          var cats = data.categories ? '<span>'+data.categories.map(function(cat){return escapeHtml(cat)}).join('<i class="ic i-angle-right"></i>')+'</span>' : '';
          return '<a href="' + CONFIG.root + data.path +'">'+cats+data._highlightResult.title.value+'</a>';
        },
        empty: function(data) {
          return '<div id="hits-empty">'+
              LOCAL.search.empty.replace(/\$\{query}/, escapeHtml(data.query)) +
            '</div>';
        }
      },
      cssClasses: {
        item: 'item'
      }
    }),

    instantsearch.widgets.pagination({
      container: '#search-pagination',
      scrollTo : false,
      showFirst: false,
      showLast : false,
      templates: {
        first   : '<i class="ic i-angle-double-left"></i>',
        last    : '<i class="ic i-angle-double-right"></i>',
        previous: '<i class="ic i-angle-left"></i>',
        next    : '<i class="ic i-angle-right"></i>'
      },
      cssClasses: {
        root        : 'pagination',
        item        : 'pagination-item',
        link        : 'page-number',
        selectedItem: 'current',
        disabledItem: 'disabled-item'
      }
    })
  ]);

  search.start();

  // Handle and trigger popup window
  $.each('.search', function(element) {
    element.addEventListener('click', function() {
      document.body.style.overflow = 'hidden';
      transition(siteSearch, 'shrinkIn', function() {
          $('.search-input').focus();
        }) // transition.shrinkIn
    });
  });

  // Monitor main search box
  const onPopupClose = function() {
    document.body.style.overflow = '';
    transition(siteSearch, 0); // "transition.shrinkOut"
  };

  siteSearch.addEventListener('click', function(event) {
    if (event.target === siteSearch) {
      onPopupClose();
    }
  });
  $('.close-btn').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });
}
var domInit = function() {
  $.each('.overview .menu > .item', function(el) {
    siteNav.child('.menu').appendChild(el.cloneNode(true));
  })

  loadCat.addEventListener('click', Loader.vanish);
  menuToggle.addEventListener('click', sideBarToggleHandle);
  $('.dimmer').addEventListener('click', sideBarToggleHandle);

  quickBtn.child('.down').addEventListener('click', goToBottomHandle);
  quickBtn.child('.up').addEventListener('click', backToTopHandle);

  if(!toolBtn) {
    toolBtn = siteHeader.createChild('div', {
      id: 'tool',
      innerHTML: '<div class="item player"></div><div class="item contents"><i class="ic i-list-ol"></i></div><div class="item chat"><i class="ic i-comments"></i></div><div class="item back-to-top"><i class="ic i-arrow-up"></i><span>0%</span></div>'
    });
  }

  toolPlayer = toolBtn.child('.player');
  backToTop = toolBtn.child('.back-to-top');
  goToComment = toolBtn.child('.chat');
  showContents = toolBtn.child('.contents');

  backToTop.addEventListener('click', backToTopHandle);
  goToComment.addEventListener('click', goToCommentHandle);
  showContents.addEventListener('click', sideBarToggleHandle);

  mediaPlayer(toolPlayer)
  $('main').addEventListener('click', function() {
    toolPlayer.player.mini()
  })
}

var pjaxReload = function () {
  pagePosition()

  if(sideBar.hasClass('on')) {
    transition(sideBar, function () {
        sideBar.removeClass('on');
        menuToggle.removeClass('close');
      }); // 'transition.slideRightOut'
  }

  $('#main').innerHTML = ''
  $('#main').appendChild(loadCat.lastChild.cloneNode(true));
  pageScroll(0);
}

var siteRefresh = function (reload) {
  LOCAL_HASH = 0
  LOCAL_URL = window.location.href

  vendorCss('katex');
  vendorJs('copy_tex');
  vendorCss('mermaid');
  vendorJs('chart');
  vendorJs('valine', function() {
    var options = Object.assign({}, CONFIG.valine);
    options = Object.assign(options, LOCAL.valine||{});
    options.el = '#comments';
    options.pathname = LOCAL.path;
    options.pjax = pjax;
    options.lazyload = lazyload;

    new MiniValine(options);

    setTimeout(function(){
      positionInit(1);
      postFancybox('.v');
    }, 1000);
  }, window.MiniValine);

  if(!reload) {
    $.each('script[data-pjax]', pjaxScript);
  }

  originTitle = document.title

  resizeHandle()

  menuActive()

  sideBarTab()
  sidebarTOC()

  registerExtURL()
  postBeauty()
  tabFormat()

  toolPlayer.player.load(LOCAL.audio || CONFIG.audio || {})

  Loader.hide()

  setTimeout(function(){
    positionInit()
  }, 500);

  cardActive()

  lazyload.observe()
}

var siteInit = function () {

  domInit()

  pjax = new Pjax({
            selectors: [
              'head title',
              '.languages',
              '.pjax',
              'script[data-config]'
            ],
            analytics: false,
            cacheBust: false
          })

  CONFIG.quicklink.ignores = LOCAL.ignores
  quicklink.listen(CONFIG.quicklink)

  visibilityListener()
  themeColorListener()

  algoliaSearch(pjax)

  window.addEventListener('scroll', scrollHandle)

  window.addEventListener('resize', resizeHandle)

  window.addEventListener('pjax:send', pjaxReload)

  window.addEventListener('pjax:success', siteRefresh)

  window.addEventListener('beforeunload', function() {
    pagePosition()
  })

  siteRefresh(1)
}

window.addEventListener('DOMContentLoaded', siteInit);

console.log('%c Theme.Shoka v' + CONFIG.version + ' %c https://shoka.lostyu.me/ ', 'color: white; background: #e9546b; padding:5px 0;', 'padding:4px;border:1px solid #e9546b;')
var canvasEl = document.createElement('canvas');
canvasEl.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999999';
document.body.appendChild(canvasEl);

var ctx = canvasEl.getContext('2d');
var numberOfParticules = 30;
var pointerX = 0;
var pointerY = 0;
var tap = 'click'; // ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown'
var colors = CONFIG.fireworks;

function setCanvasSize() {
  canvasEl.width = window.innerWidth * 2;
  canvasEl.height = window.innerHeight * 2;
  canvasEl.style.width = window.innerWidth + 'px';
  canvasEl.style.height = window.innerHeight + 'px';
  canvasEl.getContext('2d').scale(2, 2);
}

function updateCoords(e) {
  pointerX = e.clientX || e.touches && e.touches[0].clientX;
  pointerY = e.clientY || e.touches && e.touches[0].clientY;
}

function setParticuleDirection(p) {
  var angle = anime.random(0, 360) * Math.PI / 180;
  var value = anime.random(50, 180);
  var radius = [-1, 1][anime.random(0, 1)] * value;
  return {
    x: p.x + radius * Math.cos(angle),
    y: p.y + radius * Math.sin(angle)
  }
}

function createParticule(x,y) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = colors[anime.random(0, colors.length - 1)];
  p.radius = anime.random(16, 32);
  p.endPos = setParticuleDirection(p);
  p.draw = function() {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  return p;
}

function createCircle(x,y) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = '#FFF';
  p.radius = 0.1;
  p.alpha = .5;
  p.lineWidth = 6;
  p.draw = function() {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.lineWidth = p.lineWidth;
    ctx.strokeStyle = p.color;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  return p;
}

function renderParticule(anim) {
  for (var i = 0; i < anim.animatables.length; i++) {
    anim.animatables[i].target.draw();
  }
}

function animateParticules(x, y) {
  var circle = createCircle(x, y);
  var particules = [];
  for (var i = 0; i < numberOfParticules; i++) {
    particules.push(createParticule(x, y));
  }
  anime.timeline().add({
    targets: particules,
    x: function(p) { return p.endPos.x; },
    y: function(p) { return p.endPos.y; },
    radius: 0.1,
    duration: anime.random(1200, 1800),
    easing: 'easeOutExpo',
    update: renderParticule
  }).add({
    targets: circle,
    radius: anime.random(80, 160),
    lineWidth: 0,
    alpha: {
      value: 0,
      easing: 'linear',
      duration: anime.random(600, 800),
    },
    duration: anime.random(1200, 1800),
    easing: 'easeOutExpo',
    update: renderParticule
  }, 0);
}

var render = anime({
  duration: Infinity,
  update: function() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
});

document.addEventListener(tap, function(e) {
  render.play();
  updateCoords(e);
  animateParticules(pointerX, pointerY);
}, false);

setCanvasSize();
window.addEventListener('resize', setCanvasSize, false);
