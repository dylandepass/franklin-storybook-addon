function prepare(HelixApp: any, args: any, parameters: any, main: any, content: any, decorate: any) {
  const { selector, index } = parameters;
  const { sectionStyles, blockClasses } = args;
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

export function Template(HelixApp: any, args: any, context: any, decorate: any) {
  const main = document.createElement('main');
  const { parameters } = context;
  const { path, host } = parameters;
  if (args.content) {
    return prepare(HelixApp, args, parameters, main, args.content, decorate);
  } else {
    const url = `${host}${path}`;
    fetch(url).then(res => {
      res.text().then(htmlText => {
        const regex = new RegExp('./media', 'g');
        const element = htmlText.replace(regex, `${host}/media`);
        return prepare(HelixApp, args, parameters, main, element, decorate);
      });
    });
  }

  return main;
};