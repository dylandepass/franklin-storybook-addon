import { loadPage } from '../.storybook/scripts.js';
import { Template } from '../src/template';
import decorate from './cards.js';
import style from './cards.css';

export const Three = (args, context) => Template(loadPage, args, context, decorate);

Three.storyName = 'Text';

Three.parameters = {
  path: '/storybook/text.plain.html',
  selector: 'div',
  index: 0
}

/**
 * Default Config
 */
export default {
  title: 'Text',
  parameters: {
    docs: {
      description: {
        component: 'Various Headings',
      },
    },
  }
};
