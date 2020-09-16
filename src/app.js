import 'bootstrap';
import jQuery from 'jquery';

import './app.scss';

global.$ = jQuery;

$(document).ready(function () {
  $.createEventCapturing = (function () {
    const special = $.event.special;

    return function (names) {
      if (!document.addEventListener) {
        return;
      }

      if (typeof names == 'string') {
        names = [names];
      }

      $.each(names, function (i, name) {
        const handler = function (e) {
          e = $.event.fix(e);

          return $.event.dispatch.call(this, e);
        };

        special[name] = special[name] || {};

        if (special[name].setup || special[name].teardown) {
          return;
        }

        $.extend(special[name], {
          setup: function () {
            this.addEventListener(name, handler, true);
          },
          teardown: function () {
            this.removeEventListener(name, handler, true);
          }
        });
      });
    };
  })();

  $.createEventCapturing(['play', 'pause', 'playing']);

  $(document).on('play', 'audio.recentEpisodesPlayer', function () {
    $('#recentEpisodesCarousel').carousel('pause');
  });

  $(document).on('pause', 'audio.recentEpisodesPlayer', function () {
    $('#recentEpisodesCarousel').carousel('cycle');
  });

  $(document).on('click', 'a.ccwedge', function () {
    $('audio.recentEpisodesPlayer').pause;
  });

  document.addEventListener('play', function (e) {
    const audios = document.getElementsByTagName('audio');

    for (let i = 0, len = audios.length; i < len; i++) {
      if (audios[i] !== e.target) {
        audios[i].pause();
      }
    }
  }, true);
});
