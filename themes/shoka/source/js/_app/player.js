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
