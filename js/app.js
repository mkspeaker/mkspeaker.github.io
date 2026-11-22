(function () {
  'use strict';

  function initMenu() {
    var button = document.getElementById('menu-btn');
    var menu = document.getElementById('mobile-menu');
    if (!button || !menu) return;

    var header = button.closest('.topbar') || button.parentElement;
    var defaultLabel = button.textContent;

    function setOpen(open) {
      menu.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? 'Закрыть' : defaultLabel;
      if (open) {
        var first = menu.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      }
    }

    button.addEventListener('click', function () {
      setOpen(menu.hidden);
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) {
        setOpen(false);
        button.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (menu.hidden) return;
      if (header.contains(event.target)) return;
      setOpen(false);
    });

    var wide = window.matchMedia('(min-width: 1121px)');
    var onChange = function (event) {
      if (event.matches && !menu.hidden) setOpen(false);
    };
    if (wide.addEventListener) wide.addEventListener('change', onChange);
    else if (wide.addListener) wide.addListener(onChange);
  }

  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.pipe__tab'));
    if (!tabs.length) return;

    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    });

    function activate(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        var panel = panels[i];
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (panel) panel.hidden = !active;
      });
      if (moveFocus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        activate(i, false);
      });

      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(next, true);
      });
    });
  }

  function initFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter[data-filter]'));
    var plugins = Array.prototype.slice.call(document.querySelectorAll('.plugin[data-status]'));
    var status = document.getElementById('plugin-status');
    if (!buttons.length || !plugins.length) return;

    var total = plugins.length;

    function apply(filter) {
      var shown = 0;
      plugins.forEach(function (plugin) {
        var visible = filter === 'all' || plugin.getAttribute('data-status') === filter;
        plugin.hidden = !visible;
        if (visible) shown += 1;
      });
      buttons.forEach(function (button) {
        var active = button.getAttribute('data-filter') === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (status) status.textContent = 'Показано ' + shown + ' из ' + total;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        apply(button.getAttribute('data-filter'));
      });
    });
  }

  function initPoster() {
    var dialog = document.getElementById('poster-dialog');
    if (!dialog) return;

    var openers = Array.prototype.slice.call(document.querySelectorAll('[data-poster-open]'));
    var opener = null;

    function open(event) {
      if (event) event.preventDefault();
      opener = event ? event.currentTarget : null;
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      document.documentElement.style.overflow = 'hidden';
    }

    openers.forEach(function (el) {
      el.addEventListener('click', open);
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', function () {
      document.documentElement.style.overflow = '';
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    });
  }

  function initScrollSpy() {
    var header = document.querySelector('.topbar');
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav a[href^="#"], .mobile-menu a[href^="#"]')
    );
    if (!links.length) return;

    var ids = [];
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      if (id && ids.indexOf(id) === -1) ids.push(id);
    });

    var sections = ids.map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);
    if (!sections.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var offset = (header ? header.offsetHeight : 64) + 28;
      var y = window.scrollY + offset;
      var current = null;

      sections.forEach(function (section) {
        var top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= y) current = section.id;
      });

      if (window.scrollY < 8) current = null;

      links.forEach(function (link) {
        var match = current && link.getAttribute('href') === '#' + current;
        if (match) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  function init() {
    initMenu();
    initTabs();
    initFilters();
    initPoster();
    initScrollSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
