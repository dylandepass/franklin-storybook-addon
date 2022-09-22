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
 * Prepares and decorates the blocks to be rendered in storybook
 * @param Franklin The franklin-web-library used by the story, this is used to create sections
 * @param args The storybook args
 * @param parameters The story parameters
 * @param main The main container for the decorated content
 * @param content The content element to be decorated
 * @param decorate The decorate method for the block used in the storybook
 * @returns A fully decorated element for rendering in storybook
 */
function prepare(Franklin: any, args: any, parameters: any, main: any, content: HTMLElement | Element, decorate: any) {
  const { selector, index } = parameters;
  const { sectionStyles, blockClasses } = args;
  const section = document.createElement('div');

  const node = content.querySelectorAll(selector).item(index) || content.querySelector(selector);

  main.appendChild(section);

  section.innerHTML = parameters.root ? node.parentNode.innerHTML : node.outerHTML;

  if (sectionStyles) {
    section.classList.add(sectionStyles);
  }
  if (blockClasses) {
    section.firstElementChild.classList.add(blockClasses);
  }

  if(typeof Franklin.init === 'function') {
    Franklin.init({
      rumEnabled: false,
      enableBlockLoader: false,
      loadHeader: false,
      loadFooter: false
    })
      .decorate();
  }else {
    Franklin.config.rumEnabled = false;
    Franklin.config.enableBlockLoader = false;
    Franklin.config.loadHeader = false;
    Franklin.config.loadFooter = false;
    Franklin.decorate();
  }
  
  if(decorate) {
    decorate(section.querySelector(selector));
  }

  // Block loader is disabled, set loaded incase site sets in override
  main.querySelectorAll('.section[data-section-status="initialized"]').forEach((section:HTMLDivElement) => {
    section.setAttribute('data-section-status', 'loaded');
  });

  main.querySelectorAll('.block[data-block-status="initialized"]').forEach((block:HTMLDivElement) => {
    block.setAttribute('data-block-status', 'loaded');
  });

  return main;
}

/**
 * Prepares the blocks to be rendered in storybook 
 * @param Franklin The franklin-web-library used by the story, this is used to create sections
 * @param args The storybook args
 * @param context The storybook context
 * @param decorate The decorate method of the component
 * @returns A fully decorated element for rendering in storybook
 */
export function Template(Franklin: any, args: any, context: any, decorate: any) {
  const parser = new DOMParser();
  const main = document.createElement('main');
  const { parameters } = context;
  const { path, host } = parameters;
  if (args.content && args.updated) {
    // Wrap in promise so main in returned and overrides old version when decorator runs
    Promise.resolve().then(() => {
      const element = parser.parseFromString(args.content, 'text/html');
      return prepare(Franklin, args, parameters, main, element.body, decorate);
    });
  } else {
    const url = `${host}${path}`;
    fetch(url).then(res => {
      res.text().then(htmlText => {
        const regex = new RegExp('./media', 'g');
        htmlText = htmlText.replace(regex, `${host}/media`);
        const element = parser.parseFromString(htmlText, 'text/html');
        return prepare(Franklin, args, parameters, main, element.body, decorate);
      });
    });
  }

  return main;
};