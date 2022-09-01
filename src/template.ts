function prepare(HelixApp: any, args: any, parameters: any, main: any, content: HTMLElement | Element, decorate: any) {
  const { selector, index } = parameters;
  const { sectionStyles, blockClasses } = args;
  const section = document.createElement('div');

  const node = content.querySelectorAll(selector).item(index);

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

export function Template(HelixApp: any, args: any, context: any, decorate: any) {
  const parser = new DOMParser();
  const main = document.createElement('main');
  const { parameters } = context;
  const { path, host } = parameters;
  if (args.content) {
    const element = parser.parseFromString(args.content, 'text/html');
    return prepare(HelixApp, args, parameters, main, element.body, decorate);
  } else {
    const url = `${host}${path}`;
    fetch(url).then(res => {
      res.text().then(htmlText => {
        const regex = new RegExp('./media', 'g');
        htmlText = htmlText.replace(regex, `${host}/media`);
        const element = parser.parseFromString(htmlText, 'text/html');
        return prepare(HelixApp, args, parameters, main, element.body, decorate);
      });
    });
  }

  return main;
};