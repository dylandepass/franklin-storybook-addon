
import { HelixApp } from './helix-web-library.esm.js';

function prepare(main, content, decorate, parameters) {
  const { selector, index, sectionStyles, blockClasses } = parameters;
  const section = document.createElement('div');
  const parser = new DOMParser();
  const mydoc = parser.parseFromString(content, 'text/html');
  const node = mydoc.querySelectorAll(selector).item(index);

  main.appendChild(section);
  section.innerHTML = node.outerHTML;

  if (sectionStyles) {
    section.classList.add(sectionStyles);
  }
  if (blockClasses) {
    section.firstElementChild.classList.add(blockClasses);
  }

  decorate(section.firstElementChild);

  HelixApp.init({
    rumEnabled: true,
    enableBlockLoader: false,
    loadHeader: false,
    loadFooter: false
  })
    .decorate();

  return main;
}

export function Template(args, context, decorate) {
  const main = document.createElement('main');
  const { parameters } = context;
  const { path, host } = parameters;
  console.log('con', context);
  console.log('p', parameters);

  if (args.content) {
    return prepare(main, args.content, decorate, parameters);
  } else {
    const url = `${host}${path}`;
    fetch(url).then(res => {
      res.text().then(htmlText => {
        const regex = new RegExp('./media', 'g');
        const element = htmlText.replace(regex, `${host}/media`);
        return prepare(main, element, decorate, parameters);
      });
    });
  }

  return main;
};