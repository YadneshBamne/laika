(() => {
  const root = document.getElementById('nav');
  const bar = root && root.querySelector('.nav__bar');
  if (!bar) return;
  const num = bar.querySelector('.nav__num');
  const label = bar.querySelector('.nav__label');
  const index = root.querySelector('.index');
  const openButton = bar.querySelector('.nav__index');
  const closeButton = index && index.querySelector('.index__close');
  const sections = [...document.querySelectorAll('main > section[data-8b-section]')];
  let current = 0;
  const show = i => {
    current = i;
    const chapter = sections[i] && sections[i].querySelector('.chapter');
    if (!chapter) return;
    const n = chapter.querySelector('.chapter__num');
    const l = chapter.querySelector('.chapter__label');
    if (n && num) num.textContent = n.textContent;
    if (l && label) label.textContent = l.textContent;
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) show(sections.indexOf(entry.target));
    }), { rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(section => observer.observe(section));
  }
  const go = target => {
    if (!target) return;
    if (window.lenis) window.lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView();
  };
  bar.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    const next = Math.min(sections.length - 1, Math.max(0, current + Number(button.dataset.step)));
    go(sections[next]);
  }));
  let lastY = window.scrollY, travel = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY, delta = y - lastY;
    lastY = y;
    if (!delta || (index && !index.hidden)) return;
    if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
    travel += delta;
    if (y < 120 || travel < -32) bar.classList.remove('is-hidden');
    else if (travel > 32) bar.classList.add('is-hidden');
  }, { passive: true });
  if (!index || !openButton || !closeButton) return;
  const open = () => {
    index.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    bar.classList.remove('is-hidden');
    if (window.lenis) window.lenis.stop();
    closeButton.focus();
  };
  const close = (returnFocus = true) => {
    index.hidden = true;
    openButton.setAttribute('aria-expanded', 'false');
    if (window.lenis) window.lenis.start();
    if (returnFocus) openButton.focus();
  };
  openButton.addEventListener('click', open);
  closeButton.addEventListener('click', () => close());
  index.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  index.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    close(false);
    go(target);
  }));
})();
(() => {
  'use strict';
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const parsed = document.readyState === 'loading' ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true })) : Promise.resolve();
  const ready = () => Promise.all([fonts, parsed]).then(() => firsts);
  const nextTask = () => window.scheduler?.yield?.() ?? new Promise(resolve => setTimeout(resolve));
  const refresh = () => {
    if (typeof window.refreshScroll === 'function') return window.refreshScroll();
    window.ScrollTrigger?.sort(); window.ScrollTrigger?.refresh();
  };
  const run = (setup, name) => {
    for (const trigger of window.ScrollTrigger?.getAll() || []) if (!trigger.end && window.ScrollTrigger.getAll().includes(trigger)) trigger.refresh(0, 1);
    const context = window.gsap.context(() => {});
    const log = new MutationObserver(() => {});
    log.observe(document.documentElement, { attributes: true, attributeOldValue: true, subtree: true });
    let failure = null, records;
    try { context.add(() => { try { setup(); } catch (error) { failure = error; } }); }
    finally { records = log.takeRecords(); log.disconnect(); }
    if (!failure) return true;
    try { context.revert(); } catch (error) { console.error(name, 'revert failed', error); }
    for (const { target, attributeName, oldValue } of records.reverse()) {
      const now = target.getAttribute(attributeName);
      if (oldValue == null) { if (now != null) target.removeAttribute(attributeName); }
      else if (now !== oldValue) target.setAttribute(attributeName, oldValue);
    }
    console.error(name, failure);
    return false;
  };
  let firsts = Promise.resolve(), tail = null, pending = 0, lazy = null, building = 0, firstCount = 0;
  window.motionReady = ready();
  parsed.then(() => { if (firstCount && !tail) firsts.then(refresh); });
  window.queueMotion = (setup, { first = false, near, id } = {}) => {
    if (!window.gsap || typeof setup !== 'function') return;
    const name = id || document.currentScript?.getAttribute('data-8b-part') || 'motion';
    if (near instanceof Element && window.IntersectionObserver) {
      const watch = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        watch.disconnect();
        building++;
        lazy = (lazy || ready()).then(nextTask).then(() => run(setup, name)).finally(() => { if (!--building) refresh(); });
      }, { rootMargin: '100% 0px' });
      watch.observe(near);
      return;
    }
    if (first) { firstCount++; firsts = firsts.then(() => fonts).then(() => { if (!run(setup, name)) refresh(); }); }
    else {
      pending++;
      tail = (tail || ready()).then(nextTask).then(() => run(setup, name))
        .finally(() => { if (!--pending) refresh(); });
    }
    window.motionReady = Promise.all([firsts, tail]);
  };
})();
gsap.registerPlugin(ScrollTrigger);
function refreshScroll() { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  const bar = document.querySelector('#nav .nav__bar');
  const lenis = window.lenis = new Lenis({ lerp: 0.09, anchors: { offset: -(bar ? bar.offsetHeight : 0) } });
  const tick = time => lenis.raf(time * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => { gsap.ticker.remove(tick); gsap.ticker.lagSmoothing(500, 33); lenis.destroy(); window.lenis = null; };
});
const effects = {
  frame(element, vars = {}) {
    const image = element.querySelector('img');
    const timeline = gsap.timeline(vars);
    timeline.fromTo(element, { clipPath: 'inset(14% 18% 14% 18% round 44px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.2, ease: 'expo.out' }, 0);
    if (image) timeline.fromTo(image, { scale: 1.22 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0);
    return timeline;
  },
  measure(element, vars = {}) {
    const vertical = element.classList.contains('m-dim-2');
    const line = element.querySelector(vertical ? '.m-dim-2__line' : '.m-dim__line');
    const label = element.querySelector(vertical ? '.m-dim-2__label' : '.m-dim__label');
    const timeline = gsap.timeline(vars);
    if (line) timeline.fromTo(line, vertical ? { scaleY: 0 } : { scaleX: 0 }, vertical ? { scaleY: 1, duration: 1, ease: 'power3.inOut' } : { scaleX: 1, duration: 1, ease: 'power3.inOut' }, 0);
    if (label) timeline.fromTo(label, { opacity: 0 }, { opacity: 1, duration: .4, ease: 'none' }, .55);
    return timeline;
  },
  rise(element, vars = {}) {
    return gsap.timeline(vars).fromTo(element, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out' });
  }
};
const effectStarts = { frame: 'top 88%', measure: 'top 86%', rise: 'top 92%' };
Object.keys(effects).forEach(name => {
  document.querySelectorAll('[data-8b-section]').forEach(section => {
    const elements = section.querySelectorAll(`[data-8b-motion~="${name}"]`);
    if (!elements.length) return;
    const id = `effect:${name}:${section.id}`;
    queueMotion(() => gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      elements.forEach((element, i) => ScrollTrigger.create({
        id: `${id}:${i}`, trigger: element, start: effectStarts[name], once: true,
        animation: effects[name](element, { paused: true })
      }));
    }), { first: section.getBoundingClientRect().top < innerHeight, id });
  });
});

(() => {
  const strip = document.getElementById('festival');
  if (!strip) return;
  const root = document.documentElement;
  fetch('/api/festival').then(r => r.json()).then(f => {
    if (!f || !f.message) return;
    strip.textContent = f.message;
    strip.style.setProperty('--fest-bg', f.bg);
    strip.style.setProperty('--fest-fg', f.fg);
    strip.hidden = false;
    const place = () => root.style.setProperty('--fest-off', Math.max(0, strip.offsetHeight - window.scrollY) + 'px');
    place();
    window.addEventListener('scroll', place, { passive: true });
  }).catch(() => {});
})();
