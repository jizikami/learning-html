/* =========================================================
   nav.js — the DRY navigation
   The markup lives in nav.html and this script drops it into
   the <div id="site-nav"></div> on every page, then marks the
   page you are on. The footer works the same way, into
   <div id="site-foot"></div>.

   The same HTML is also kept here as NAV_HTML. Why twice?
   Because when index.html is opened by double-clicking it
   (file://), the browser refuses to fetch a local file, so
   nav.html cannot be read. fetch first; if that fails, the
   copy in this script is used. Either way the nav looks the
   same on all four pages.
   ========================================================= */

(function () {
  'use strict';

  var NAV_HTML = [
    '<nav class="nav" aria-label="Main navigation">',
    '  <a class="brand" href="index.html">',
    '    <span class="brand-mark" aria-hidden="true">K</span>',
    '    <span class="brand-text">Keeper <em>of the light</em></span>',
    '  </a>',
    '  <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navMenu" aria-label="Open menu">',
    '    <span></span><span></span><span></span>',
    '  </button>',
    '  <ul class="nav-menu" id="navMenu">',
    '    <li><a href="index.html">Home</a></li>',
    '    <li><a href="quotes.html">Quotes</a></li>',
    '    <li><a href="project.html">Projects</a></li>',
    '    <li><a href="machine.html">The Machine</a></li>',
    '  </ul>',
    '</nav>'
  ].join('\n');

  var FOOT_HTML = [
    '<div class="foot-inner">',
    '  <p class="foot-brand">Keeper <span>·</span> a lighthouse, fifteen lines, five ideas and one stubborn machine</p>',
    '  <p class="foot-note">Project 1 · Web Technologies, Autumn 2026 — LIN Jiacan · 2025010041</p>',
    '  <p class="foot-note">Written by hand: HTML, CSS and JavaScript, no framework. The drawing and the icons were drawn by hand too.</p>',
    '</div>'
  ].join('\n');

  function mount(host, html) {
    if (!host) return;
    host.innerHTML = html;
  }

  function currentPage() {
    var name = location.pathname.split('/').pop();
    return name === '' ? 'index.html' : name;
  }

  function wireNav(host) {
    var toggle = host.querySelector('.nav-toggle');
    var menu = host.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    // mark the page you are on
    var here = currentPage();
    var links = menu.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href === here) {
        links[i].classList.add('is-active');
        links[i].setAttribute('aria-current', 'page');
      }
    }

    // the folded menu on a phone
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // once the page moves, the bar gets a bottom line
    var onScroll = function () {
      host.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function boot() {
    var navHost = document.getElementById('site-nav');
    var footHost = document.getElementById('site-foot');

    mount(footHost, FOOT_HTML);

    if (!navHost) return;

    if (location.protocol === 'file:') {
      // opened straight from disk: fetch is blocked, use the copy
      mount(navHost, NAV_HTML);
      wireNav(navHost);
      return;
    }

    fetch('nav.html')
      .then(function (r) {
        if (!r.ok) throw new Error('nav.html ' + r.status);
        return r.text();
      })
      .then(function (html) {
        mount(navHost, html);
        wireNav(navHost);
      })
      .catch(function () {
        mount(navHost, NAV_HTML);
        wireNav(navHost);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
