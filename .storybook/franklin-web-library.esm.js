/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Retrieves the content of metadata tags.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value(s)
 * @preserve Exclude from terser
 */
function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = [...document.head.querySelectorAll(`meta[${attr}="${name}"]`)].map((m) => m.content).join(', ');
  return meta || null;
}

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable no-param-reassign */

/**
 * Decorates a block.
 * @param {Element} block The block element
 * @preserve Exclude from terser
 */
function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName) {
    block.classList.add('block');
    block.setAttribute('data-block-name', shortBlockName);
    block.setAttribute('data-block-status', 'initialized');
    const blockWrapper = block.parentElement;
    blockWrapper.classList.add(`${shortBlockName}-wrapper`);
    const section = block.closest('.section');
    if (section) section.classList.add(`${shortBlockName}-container`);
  }
}

/**
 * Decorates all blocks in a container element.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */
function decorateBlocks(main) {
  main
    .querySelectorAll('div.section > div > div')
    .forEach((block) => decorateBlock(block));
}

/**
 * Sanitizes a name for use as class name.
 * @param {string} name The unsanitized name
 * @returns {string} The class name
 * @preserve Exclude from terser
 */
function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

/**
 * Sanitizes a name for use as a js property name.
 * @param {string} name The unsanitized name
 * @returns {string} The camelCased name
 */
function toCamelCase(name) {
  return toClassName(name).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 * @preserve Exclude from terser
 */
function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope>div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('a')) {
          const as = [...col.querySelectorAll('a')];
          if (as.length === 1) {
            value = as[0].href;
          } else {
            value = as.map((a) => a.href);
          }
        } else if (col.querySelector('img')) {
          const imgs = [...col.querySelectorAll('img')];
          if (imgs.length === 1) {
            value = imgs[0].src;
          } else {
            value = imgs.map((img) => img.src);
          }
        } else if (col.querySelector('p')) {
          const ps = [...col.querySelectorAll('p')];
          if (ps.length === 1) {
            value = ps[0].textContent;
          } else {
            value = ps.map((p) => p.textContent);
          }
        } else value = row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Decorates all sections in a container element.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */
function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.setAttribute('data-section-status', 'initialized');

    /* process section metadata */
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      const keys = Object.keys(meta);
      keys.forEach((key) => {
        if (key === 'style') section.classList.add(toClassName(meta.style));
        else section.dataset[toCamelCase(key)] = meta[key];
      });
      sectionMeta.remove();
    }
  });
}

/**
 * Normalizes all headings within a container element.
 * @param {Element} elem The container element
 * @param {string[]} allowedHeadings The list of allowed headings (h1 ... h6)
 * @preserve Exclude from terser
 */
function normalizeHeadings(elem, allowedHeadings) {
  const allowed = allowedHeadings.map((h) => h.toLowerCase());
  elem.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((tag) => {
    const h = tag.tagName.toLowerCase();
    if (allowed.indexOf(h) === -1) {
      // current heading is not in the allowed list -> try first to "promote" the heading
      let level = parseInt(h.charAt(1), 10) - 1;
      while (allowed.indexOf(`h${level}`) === -1 && level > 0) {
        level -= 1;
      }
      if (level === 0) {
        // did not find a match -> try to "downgrade" the heading
        while (allowed.indexOf(`h${level}`) === -1 && level < 7) {
          level += 1;
        }
      }
      if (level !== 7) {
        tag.outerHTML = `<h${level}>${tag.textContent}</h${level}>`;
      }
    }
  });
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 * @preserve Exclude from terser
 */
function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = href.indexOf('.ico') ? 'image/x-icon' : 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * Set template (page structure) and theme (page styles).
 */
function decorateTemplateAndTheme() {
  const template = getMetadata('template');
  if (template) document.body.classList.add(toClassName(template));
  const theme = getMetadata('theme');
  if (theme) document.body.classList.add(toClassName(theme));
}

/**
 * Replace icons with inline SVG and prefix with codeBasePath.
 * @param {Element} element
 */
function decorateIcons(element, path = '/icons') {
  element.querySelectorAll('span.icon').forEach(async (span) => {
    if (span.classList.length < 2 || !span.classList[1].startsWith('icon-')) {
      return;
    }
    const icon = span.classList[1].substring(5);
    // eslint-disable-next-line no-use-before-define
    const resp = await fetch(`${window.hlx.codeBasePath}${path}/${icon}.svg`);
    if (resp.ok) {
      const iconHTML = await resp.text();
      if (iconHTML.match(/<style/i)) {
        const img = document.createElement('img');
        img.src = `data:image/svg+xml,${encodeURIComponent(iconHTML)}`;
        span.appendChild(img);
      } else {
        span.innerHTML = iconHTML;
      }
    }
  });
}

/**
 * Decorates paragraphs containing a single link as buttons.
 * @param {Element} element container element
 */
function decorateButtons(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
          a.className = 'button primary'; // default
          up.classList.add('button-container');
        }
        if (up.childNodes.length === 1 && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1 && twoup.tagName === 'P') {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (up.childNodes.length === 1 && up.tagName === 'EM'
          && twoup.childNodes.length === 1 && twoup.tagName === 'P') {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
      }
    }
  });
}

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {boolean} eager load image eager
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 * @preserve Exclude from terser
 */
function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 400px)', width: '2000' }, { width: '750' }], classes = []) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement('picture');
  if (classes.length > 0) {
    picture.classList.add(classes);
  }

  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
    }
  });

  return picture;
}

/**
 * Given a set of breakpoints, returns the appropriate image URL for the most optimized version.
 * @param {string} src The image URL
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 * @preserve Exclude from terser
 */
function getOptimizedImagePath(src, breakpoints = [{ media: '(min-width: 400px)', width: '2000' }, { width: '750' }]) {
  const url = new URL(src, window.location.href);
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);
  const br = breakpoints[breakpoints.length - 1];
  return `${pathname}?width=${br.width}&format=${ext}&optimize=medium`;
}

/**
 * Removes formatting from images.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */
function removeStylingFromImages(main) {
  // remove styling from images, if any
  const imgs = [...main.querySelectorAll('strong picture'), ...main.querySelectorAll('em picture')];
  imgs.forEach((img) => {
    const parentEl = img.closest('p');
    parentEl.prepend(img);
    parentEl.lastChild.remove();
  });
}

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * loads a script by adding a script tag to the head.
 * @param {string} url URL of the js file
 * @param {Function} callback callback on load
 * @param {string} type type attribute of script tag
 * @returns {Element} script element
 * @preserve Exclude from terser
 */

function loadScript(url, callback, type) {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.setAttribute('src', url);
  if (type) {
    script.setAttribute('type', type);
  }
  head.append(script);
  script.onload = callback;
  return script;
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 * @preserve Exclude from terser
 */
function loadCSS(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
  }
}

/**
 * Updates all section status in a container element.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */
function updateSectionsStatus(main) {
  const sections = [...main.querySelectorAll(':scope > div.section')];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const status = section.getAttribute('data-section-status');
    if (status !== 'loaded') {
      const loadingBlock = section.querySelector('.block[data-block-status="initialized"], .block[data-block-status="loading"]');
      if (loadingBlock) {
        section.setAttribute('data-section-status', 'loading');
        break;
      } else {
        section.setAttribute('data-section-status', 'loaded');
      }
    }
  }
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} block The block element
 * @preserve Exclude from terser
 */
async function loadBlock(block, eager = false) {
  if (!(block.getAttribute('data-block-status') === 'loading' || block.getAttribute('data-block-status') === 'loaded')) {
    block.setAttribute('data-block-status', 'loading');
    const blockName = block.getAttribute('data-block-name');

    let cssPath = `${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`;
    let jsPath = `${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.js`;

    if (window.hlx.experiment && window.hlx.experiment.run) {
      const { experiment } = window.hlx;
      if (experiment.selectedVariant !== 'control') {
        const { control } = experiment.variants;
        if (control && control.blocks && control.blocks.includes(blockName)) {
          const blockIndex = control.blocks.indexOf(blockName);
          const variant = experiment.variants[experiment.selectedVariant];
          const blockPath = variant.blocks[blockIndex];
          cssPath = `${window.hlx.codeBasePath}/experiments/${experiment.id}/${blockPath}/${blockName}.css`;
          jsPath = `${window.hlx.codeBasePath}/experiments/${experiment.id}/${blockPath}/${blockName}.js`;
        }
      }
    }

    if (blockName) {
      try {
        const cssLoaded = new Promise((resolve) => {
          loadCSS(cssPath, resolve);
        });
        const decorationComplete = new Promise((resolve) => {
          (async () => {
            try {
              const mod = await import(jsPath);
              if (mod.default) {
                await mod.default(block, blockName, document, eager);
              }
            } catch (err) {
            // eslint-disable-next-line no-console
              console.log(`failed to load module for ${blockName}`, err);
            }
            resolve();
          })();
        });
        await Promise.all([cssLoaded, decorationComplete]);
      } catch (err) {
      // eslint-disable-next-line no-console
        console.log(`failed to load block ${blockName}`, err);
      }
    }
    block.setAttribute('data-block-status', 'loaded');
  }
}

/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */
async function loadBlocks(main) {
  updateSectionsStatus(main);
  const blocks = [...main.querySelectorAll('div.block')];
  for (let i = 0; i < blocks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(blocks[i]);
    updateSectionsStatus(main);
  }
}

/**
 * Builds a block DOM Element from a two dimensional array
 * @param {string} blockName name of the block
 * @param {any} content two dimensional array or string or object of content
 * @preserve Exclude from terser
 */
function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  // build image block nested div structure
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => {
        if (val) {
          if (typeof val === 'string') {
            colEl.innerHTML += val;
          } else {
            colEl.appendChild(val);
          }
        }
      });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return (blockEl);
}

/**
 * Loads the header block.
 * @param {Element} header The header element
 * @preserve Exclude from terser
 */
async function loadHeader(header) {
  const headerBlock = buildBlock('header', '');
  header.append(headerBlock);
  decorateBlock(headerBlock);
  await loadBlock(headerBlock);
}

/**
 * Loads the footer block.
 * @param {Element} footer The footer element
 * @preserve Exclude from terser
 */
async function loadFooter(footer) {
  const footerBlock = buildBlock('footer', '');
  footer.append(footerBlock);
  decorateBlock(footerBlock);
  await loadBlock(footerBlock);
}

/**
 * load LCP block and/or wait for LCP in default content.
 * @preserve Exclude from terser
 */
async function waitForLCP(LCP_BLOCKS, autoAppear) {
  // eslint-disable-next-line no-use-before-define
  const lcpBlocks = LCP_BLOCKS;
  const block = document.querySelector('.block');
  const hasLCPBlock = (block && lcpBlocks.includes(block.getAttribute('data-block-name')));
  if (hasLCPBlock) await loadBlock(block, true);

  if (autoAppear) {
    document.querySelector('body').classList.add('appear');
  }

  const lcpCandidate = document.querySelector('main img');
  await new Promise((resolve) => {
    if (lcpCandidate && !lcpCandidate.complete) {
      lcpCandidate.setAttribute('loading', 'eager');
      lcpCandidate.addEventListener('load', () => resolve());
      lcpCandidate.addEventListener('error', () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Gets placeholders object
 * @param {string} prefix
 */
async function fetchPlaceholders(prefix = 'default') {
  window.placeholders = window.placeholders || {};
  const loaded = window.placeholders[`${prefix}-loaded`];
  if (!loaded) {
    window.placeholders[`${prefix}-loaded`] = new Promise((resolve, reject) => {
      try {
        fetch(`${prefix === 'default' ? '' : prefix}/placeholders.json`)
          .then((resp) => resp.json())
          .then((json) => {
            const placeholders = {};
            json.data.forEach((placeholder) => {
              placeholders[toCamelCase(placeholder.Key)] = placeholder.Text;
            });
            window.placeholders[prefix] = placeholders;
            resolve();
          });
      } catch (e) {
        // error loading placeholders
        window.placeholders[prefix] = {};
        reject();
      }
    });
  }
  await window.placeholders[`${prefix}-loaded`];
  return (window.placeholders[prefix]);
}

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable no-param-reassign */

/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 * @param {string} generation additional data for RUM sample
 * @preserve Exclude from terser
 */
function sampleRUM(checkpoint, data = {}, generation = '') {
  sampleRUM.defer = sampleRUM.defer || [];
  const defer = (fnname) => {
    sampleRUM[fnname] = sampleRUM[fnname]
      || ((...args) => sampleRUM.defer.push({ fnname, args }));
  };
  sampleRUM.drain = sampleRUM.drain
    || ((dfnname, fn) => {
      sampleRUM[dfnname] = fn;
      sampleRUM.defer
        .filter(({ fnname }) => dfnname === fnname)
        .forEach(({ fnname, args }) => sampleRUM[fnname](...args));
    });
  sampleRUM.on = (chkpnt, fn) => {
    sampleRUM.cases[chkpnt] = fn;
  };
  defer('observe');
  defer('cwv');
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
      // eslint-disable-next-line no-bitwise
      const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
      const id = `${hashCode(window.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
      const random = Math.random();
      const isSelected = (random * weight < 1);
      // eslint-disable-next-line object-curly-newline
      window.hlx.rum = { weight, id, random, isSelected, sampleRUM };
    }
    const { weight, id } = window.hlx.rum;
    if (window.hlx && window.hlx.rum && window.hlx.rum.isSelected) {
      const sendPing = (pdata = data) => {
        // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
        const body = JSON.stringify({ weight, id, referer: window.location.href, generation, checkpoint, ...data });
        const url = `https://rum.hlx.page/.rum/${weight}`;
        // eslint-disable-next-line no-unused-expressions
        navigator.sendBeacon(url, body);
        // eslint-disable-next-line no-console
        console.debug(`ping:${checkpoint}`, pdata);
      };
      sampleRUM.cases = sampleRUM.cases || {
        cwv: () => sampleRUM.cwv(data) || true,
        lazy: () => {
          // use classic script to avoid CORS issues
          const script = document.createElement('script');
          script.src = 'https://rum.hlx.page/.rum/@adobe/-rum-enhancer@^1/src/index.js';
          document.head.appendChild(script);
          sendPing(data);
          return true;
        },
      };
      sendPing(data);
      if (sampleRUM.cases[checkpoint]) {
        sampleRUM.cases[checkpoint]();
      }
    }
  } catch (error) {
    // something went wrong
  }
}

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

function stamp(message) {
  if (window.name.includes('performance')) {
    // eslint-disable-next-line no-console
    console.log(`${new Date() - performance.timing.navigationStart}:${message}`);
  }
}

function registerPerformanceLogger() {
  try {
    const polcp = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      stamp(JSON.stringify(entries));
      // eslint-disable-next-line no-console
      console.log(entries[0].element);
    });
    polcp.observe({ type: 'largest-contentful-paint', buffered: true });

    const pols = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      stamp(JSON.stringify(entries));
      // eslint-disable-next-line no-console
      console.log(entries[0].sources[0].node);
    });
    pols.observe({ type: 'layout-shift', buffered: true });

    const polt = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log the entry and all associated details.
        stamp(JSON.stringify(entry));
      }
    });

    // Start listening for `longtask` entries to be dispatched.
    polt.observe({ type: 'longtask', buffered: true });

    const pores = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        stamp(`resource loaded: ${entry.name} - [${Math.round(entry.startTime + entry.duration)}]`);
      });
    });

    pores.observe({ type: 'resource', buffered: true });
  } catch (e) {
    // no output
  }
}

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

function checkTesting() {
  const tesing = getMetadata('testing');
  return (tesing && tesing.toLowerCase() === 'on');
}

/**
 * this is an extensible stub to take on audience mappings
 * @param {string} audience
 * @return {boolean} is member of this audience
 */

function checkExperimentAudience(audience) {
  if (audience === 'mobile') {
    return window.innerWidth < 600;
  }
  if (audience === 'desktop') {
    return window.innerWidth > 600;
  }
  return true;
}

/**
 * Replaces element with content from path
 * @param {string} path
 * @param {HTMLElement} element
 */
async function replaceInner(path, element) {
  const plainPath = `${path}.plain.html`;
  try {
    const resp = await fetch(plainPath);
    const html = await resp.text();
    element.innerHTML = html;
  } catch (e) {
    console.log(`error loading content: ${plainPath}`, e);
  }
  return null;
}

/**
 * gets the variant id that this visitor has been assigned to if any
 * @param {string} experimentId
 * @return {string} assigned variant or empty string if none set
 */

function getLastExperimentVariant(experimentId) {
  console.log('get last experiment', experimentId);
  const experimentsStr = localStorage.getItem('hlx-experiments');
  if (experimentsStr) {
    const experiments = JSON.parse(experimentsStr);
    if (experiments[experimentId]) {
      return experiments[experimentId].variant;
    }
  }
  return '';
}

/**
 * sets/updates the variant id that is assigned to this visitor,
 * also cleans up old variant ids
 * @param {string} experimentId
 * @param {variant} variant
 */

function setLastExperimentVariant(experimentId, variant) {
  const experimentsStr = localStorage.getItem('hlx-experiments');
  const experiments = experimentsStr ? JSON.parse(experimentsStr) : {};

  const now = new Date();
  const expKeys = Object.keys(experiments);
  expKeys.forEach((key) => {
    const date = new Date(experiments[key].date);
    if (now - date > (1000 * 86400 * 30)) {
      delete experiments[key];
    }
  });
  const [date] = now.toISOString().split('T');

  experiments[experimentId] = { variant, date };
  localStorage.setItem('hlx-experiments', JSON.stringify(experiments));
}

/**
 * Gets the experiment name, if any for the page based on env, useragent, query params
 * @returns {string} experimentid
 */
function getExperiment() {
  let experiment = toClassName(getMetadata('experiment'));

  // if (!window.location.host.includes('adobe.com')
  // && !window.location.host.includes('.hlx.live')) {
  //  experiment = '';
  //  // reason = 'not prod host';
  // }
  if (window.location.hash) {
    experiment = '';
    // reason = 'suppressed by #';
  }

  if (navigator.userAgent.match(/bot|crawl|spider/i)) {
    experiment = '';
    // reason = 'bot detected';
  }

  const usp = new URLSearchParams(window.location.search);
  if (usp.has('experiment')) {
    [experiment] = usp.get('experiment').split('/');
  }

  return experiment;
}

/**
 * Gets experiment config from the manifest or the instant experiement
 * metdata and transforms it to more easily consumable structure.
 *
 * the manifest consists of two sheets "settings" and "experiences"
 *
 * "settings" is applicable to the entire test and contains information
 * like "Audience", "Status" or "Blocks".
 *
 * "experience" hosts the experiences in columns, consisting of:
 * a "Percentage Split", "Label" and a set of "Pages".
 *
 *
 * @param {string} experimentId
 * @returns {object} containing the experiment manifest
 */
async function getExperimentConfig(experimentId) {
  const instantExperiment = getMetadata('instant-experiment');
  if (instantExperiment) {
    const config = {
      experimentName: `Instant Experiment: ${experimentId}`,
      audience: '',
      status: 'Active',
      id: experimentId,
      variants: {},
      variantNames: [],
    };

    const pages = instantExperiment.split(',').map((p) => new URL(p.trim()).pathname);
    const evenSplit = 1 / (pages.length + 1);

    config.variantNames.push('control');
    config.variants.control = {
      percentageSplit: '',
      pages: [window.location.pathname],
      blocks: [],
      label: 'Control',
    };

    pages.forEach((page, i) => {
      const vname = `challenger-${i + 1}`;
      config.variantNames.push(vname);
      config.variants[vname] = {
        percentageSplit: `${evenSplit}`,
        pages: [page],
        label: `Challenger ${i + 1}`,
      };
    });

    return (config);
  } else {
    const path = `/express/experiments/${experimentId}/manifest.json`;
    try {
      const config = {};
      const resp = await fetch(path);
      const json = await resp.json();
      json.settings.data.forEach((line) => {
        const key = toCamelCase(line.Name);
        config[key] = line.Value;
      });
      config.id = experimentId;
      config.manifest = path;
      const variants = {};
      let variantNames = Object.keys(json.experiences.data[0]);
      variantNames.shift();
      variantNames = variantNames.map((vn) => toCamelCase(vn));
      variantNames.forEach((variantName) => {
        variants[variantName] = {};
      });
      let lastKey = 'default';
      json.experiences.data.forEach((line) => {
        let key = toCamelCase(line.Name);
        if (!key) key = lastKey;
        lastKey = key;
        const vns = Object.keys(line);
        vns.shift();
        vns.forEach((vn) => {
          const camelVN = toCamelCase(vn);
          if (key === 'pages' || key === 'blocks') {
            variants[camelVN][key] = variants[camelVN][key] || [];
            if (key === 'pages') variants[camelVN][key].push(new URL(line[vn]).pathname);
            else variants[camelVN][key].push(line[vn]);
          } else {
            variants[camelVN][key] = line[vn];
          }
        });
      });
      config.variants = variants;
      config.variantNames = variantNames;
      console.log(config);
      return config;
    } catch (e) {
      console.log(`error loading experiment manifest: ${path}`, e);
    }
    return null;
  }
}

/**
 * checks if a test is active on this page and if so executes the test
 */
async function decorateTesting() {
  try {
    // let reason = '';
    const usp = new URLSearchParams(window.location.search);
    const experiment = getExperiment();
    const [forcedExperiment, forcedVariant] = usp.get('experiment') ? usp.get('experiment').split('/') : [];

    if (experiment) {
      console.log('experiment', experiment);
      const config = await getExperimentConfig(experiment);
      console.log(config);
      if (toCamelCase(config.status) === 'active' || forcedExperiment) {
        config.run = forcedExperiment || checkExperimentAudience(toClassName(config.audience));
        console.log('run', config.run, config.audience);

        window.hlx = window.hlx || {};
        window.hlx.experiment = config;
        if (config.run) {
          const forced = forcedVariant || getLastExperimentVariant(config.id);
          if (forced && config.variantNames.includes(forced)) {
            config.selectedVariant = forced;
          } else {
            let random = Math.random();
            let i = config.variantNames.length;
            while (random > 0 && i > 0) {
              i -= 1;
              console.log(random, i);
              random -= +config.variants[config.variantNames[i]].percentageSplit;
            }
            config.selectedVariant = config.variantNames[i];
          }
          setLastExperimentVariant(config.id, config.selectedVariant);
          sampleRUM('experiment', { source: config.id, target: config.selectedVariant });
          console.log(`running experiment (${window.hlx.experiment.id}) -> ${window.hlx.experiment.selectedVariant}`);
          if (config.selectedVariant !== 'control') {
            const currentPath = window.location.pathname;
            const pageIndex = config.variants.control.pages.indexOf(currentPath);
            console.log(pageIndex, config.variants.control.pages, currentPath);
            if (pageIndex >= 0) {
              const page = config.variants[config.selectedVariant].pages[pageIndex];
              if (page) {
                const experimentPath = new URL(page, window.location.href).pathname.split('.')[0];
                if (experimentPath && experimentPath !== currentPath) {
                  await replaceInner(experimentPath, document.querySelector('main'));
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.log('error testing', e);
  }
}

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Initializes franklin
 * @preserve Exclude from terser
 */
function initHlx() {
  window.hlx = window.hlx || {};
  window.hlx.lighthouse = new URLSearchParams(window.location.search).get('lighthouse') === 'on';
  window.hlx.codeBasePath = '';

  const scriptEl = document.querySelector('script[src$="/scripts/scripts.js"]');
  if (scriptEl) {
    try {
      // relative path does not work when the script is loaded from a different origin
      window.hlx.codeBasePath = new URL(scriptEl.src).href.replace('/scripts/scripts.js', '');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}

/**
 * Adds one or more URLs to the dependencies for publishing.
 * @param {string|string[]} url The URL(s) to add as dependencies
 * @preserve Exclude from terser
 */
function addPublishDependencies(url) {
  const urls = Array.isArray(url) ? url : [url];
  window.hlx = window.hlx || {};
  if (window.hlx.dependencies && Array.isArray(window.hlx.dependencies)) {
    window.hlx.dependencies.concat(urls);
  } else {
    window.hlx.dependencies = urls;
  }
}

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const defaultConfig = {
  lazyStyles: false,
  autoAppear: true,
  favIcon: '/styles/icon.svg',
  enableBlockLoader: true,
  loadHeader: true,
  loadFooter: true,
  experimentsEnabled: false,
};

/**
 * @typedef {object} AppConfig
 * @property {boolean} rumEnabled
 * @property {string} rumGeneration
 * @property {string} blocksSelector
 * @property {string[]} productionDomains
 * @property {string[]} lcpBlocks
 * @property {boolean} lazyStyles
 * @property {boolean} autoAppear
 * @property {string} favIcon
 * @property {string} iconsPath
 * @property {boolean} enableBlockLoader
 * @property {boolean} loadHeader
 * @property {boolean} loadFooter
 * @property {boolean} experimentsEnabled
 */

class Franklin {
  /** @param {AppConfig} config */
  constructor(config = defaultConfig) {
    this.config = config;
    initHlx();

    if (this.config.rumEnabled) {
      this.sampleRUM('top');
      window.addEventListener('load', () => sampleRUM('load'));
      window.addEventListener('unhandledrejection', (event) => {
        sampleRUM('error', { source: event.reason.sourceURL, target: event.reason.line });
      });
      window.addEventListener('error', (event) => {
        sampleRUM('error', { source: event.filename, target: event.lineno });
      });
    }

    if (window.name.includes('performance')) {
      registerPerformanceLogger();
    }
  }

  static init(config) {
    return new Franklin(config);
  }

  /**
   * Hook into the end of loadEager function.
   */
  withLoadEager(override) {
    this.loadEagerHook = override;
    return this;
  }

  /**
   * Hook into the end of loadLazy function.
   */
  withLoadLazy(override) {
    this.loadLazyHook = override;
    return this;
  }

  /**
   * Hook direct after block decoration and before waitForLCP.
   */
  withDecorateMain(hook) {
    this.decorateMainHook = hook;
    return this;
  }

  /**
   * Overrides the loadDelayed function.
   */
  withLoadDelayed(override) {
    this.loadDelayed = override;
    return this;
  }

  /**
   * Overrides the buildAutoBlocks function.
   */
  withBuildAutoBlocks(override) {
    this.buildAutoBlocks = override;
    return this;
  }

  /**
   * Overrides the loadHeader function.
   */
  withLoadHeader(override) {
    this.loadHeader = override;
    return this;
  }

  /**
   * Overrides the loadFooter function.
   */
  withLoadFooter(override) {
    this.loadFooter = override;
    return this;
  }

  /**
   * Overrides the decorateSections function.
   */
  withDecorateSections(override) {
    this.decorateSections = override;
    return this;
  }

  /**
   * Overrides the decorateSections function.
   */
  withDecorateBlock(override) {
    this.decorateBlock = override;
    return this;
  }

  /**
   * Overrides the decorateIcons function.
   */
  withDecorateIcons(override) {
    this.decorateIcons = override;
    return this;
  }

  /**
   * Overrides the decorateIcons function.
   */
  withDecorateButtons(override) {
    this.decorateButtons = override;
    return this;
  }

  /**
   * Decorate the page
   */
  async decorate() {
    await this.loadEager(document);
    await this.loadLazy(document);
    this.loadDelayed(document);
  }

  /**
   * Decorates all blocks in a container element.
   * @param {Element} main The container element
   * @preserve Exclude from terser
   */
  decorateBlocks(main) {
    main
      .querySelectorAll(this.config.blocksSelector ?? 'div.section > div > div')
      .forEach((block) => this.decorateBlock(block));
  }

  /**
   * Decorates the main element.
   * @param {Element} main The main element
   */
  decorateMain(main) {
    removeStylingFromImages(main);
    this.decorateButtons(main);
    this.decorateIcons(main);
    this.buildAutoBlocks(main);
    this.decorateSections(main);
    this.decorateBlocks(main);

    if (this.decorateMainHook) {
      this.decorateMainHook(main);
    }
  }

  /**
   * log RUM if part of the sample.
   * @param {string} checkpoint identifies the checkpoint in funnel
   * @param {Object} data additional data for RUM sample
   * @preserve Exclude from terser
   */
  sampleRUM(event, data = {}) {
    sampleRUM(event, data, this.config.rumGeneration);
  }

  /**
   * loads everything needed to get to LCP.
   * Should be overridden by subclasses.
   */
  async loadEager(doc) {
    decorateTemplateAndTheme();
    const main = doc.querySelector('main');
    if (main) {
      this.decorateMain(main);
      await this.waitForLCP(this.config.lcpBlocks ?? []);
    }
    if (this.loadEagerHook) {
      await this.loadEagerHook(doc);
    }
  }

  /**
   * loads everything that doesn't need to be delayed.
   */
  async loadLazy(doc) {
    const main = doc.querySelector('main');
    // In some cases we don't want the block loader to run (storybook)
    if (this.config.enableBlockLoader ?? defaultConfig.enableBlockLoader) {
      await loadBlocks(main);
    }

    const { hash } = window.location;
    if (hash) {
      try {
        const element = main.querySelector(hash);
        if (hash && element) element.scrollIntoView();
      } catch {
        /* do nothing */
      }
    }

    if (this.config.loadHeader ?? defaultConfig.loadHeader) {
      this.loadHeader(doc.querySelector('header'));
    }

    if (this.config.loadFooter ?? defaultConfig.loadFooter) {
      this.loadFooter(doc.querySelector('footer'));
    }

    if (this.config.lazyStyles ?? defaultConfig.lazyStyles) {
      loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
    }

    if (this.config.experimentsEnabled ?? defaultConfig.experimentsEnabled) {
      if (!window.hlx.lighthouse) decorateTesting();
    }

    addFavIcon(`${window.hlx.codeBasePath}${this.config.favIcon ?? defaultConfig.favIcon}`);
    if (this.loadLazyHook) {
      this.loadLazyHook(doc);
    }
    sampleRUM('lazy');
    sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
    sampleRUM.observe(main.querySelectorAll('picture > img'));
  }

  /**
   * loads everything that happens a lot later, without impacting
   * the user experience.
   */
  loadDelayed() { }

  /**
   * Builds all synthetic blocks in a container element.
   * @param {Element} main The container element
   */
  buildAutoBlocks() { }

  /**
   * Loads the header block.
   * @param {Element} header The header element
   */
  async loadHeader(header) {
    loadHeader(header);
  }

  /**
   * Loads the footer block.
   * @param {Element} footer The footer element
   */
  async loadFooter(footer) {
    loadFooter(footer);
  }

  /**
   * Decorates all sections in a container element.
   * @param {Element} main The container element
   * @preserve Exclude from terser
   */
  decorateSections(main) {
    decorateSections(main);
  }

  /**
   * Decorates a block.
   * @param {Element} block The block element
   * @preserve Exclude from terser
   */
  decorateBlock(block) {
    decorateBlock(block);
  }

  /**
   * Decorates all Icons.
   * @param {Element} block The block element
   * @preserve Exclude from terser
   */
  decorateIcons(main) {
    decorateIcons(main, this.config.iconsPath);
  }

  /**
   * Decorates paragraphs containing a single link as buttons.
   * @param {Element} block The block element
   * @preserve Exclude from terser
   */
  decorateButtons(main) {
    decorateButtons(main);
  }

  /**
   * load LCP block and/or wait for LCP in default content.
   * @preserve Exclude from terser
   */
  waitForLCP(lcpBlocks) {
    return waitForLCP(lcpBlocks, this.config.autoAppear ?? defaultConfig.autoAppear);
  }
}

export { Franklin, addFavIcon, addPublishDependencies, buildBlock, checkTesting, createOptimizedPicture, decorateBlock, decorateBlocks, decorateButtons, decorateIcons, decorateSections, decorateTemplateAndTheme, decorateTesting, fetchPlaceholders, getExperiment, getExperimentConfig, getMetadata, getOptimizedImagePath, initHlx, loadBlock, loadBlocks, loadCSS, loadFooter, loadHeader, loadScript, normalizeHeadings, readBlockConfig, registerPerformanceLogger, removeStylingFromImages, replaceInner, sampleRUM, stamp, toCamelCase, toClassName, updateSectionsStatus, waitForLCP };
