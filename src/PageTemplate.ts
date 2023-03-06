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
 * Prepares the blocks to be rendered in storybook 
 * @param Franklin The franklin-web-library used by the story, either an instance or the class
 * @param args The storybook args
 * @param context The storybook context
 * @param decorate The decorate method of the component
 * @returns A fully decorated element for rendering in storybook
 */
export function PageTemplate(loadPage: any, args: any, context: any, decorate: any) {
  const parser = new DOMParser();
  const body = document.createElement('body');
  const { parameters } = context;
  const { path, host } = parameters;
  const url = `${host}${path}`;
  fetch(url).then(res => {
    res.text().then(async (htmlText) => {
      const regex = new RegExp('./media', 'g');
      htmlText = htmlText.replace(regex, `${host}/media`);
      const element = parser.parseFromString(htmlText, 'text/html');
      body.innerHTML = element.body.innerHTML;
      if(!(window as any).hlx) (window as any).hlx = {};
      (window as any).hlx.suppressLoadPage = true;
      return loadPage(false);
    });
  });

  return body;
};