import { HelixApp } from '../.storybook/helix-web-library.esm.js';
import { Template } from '../src/template';
import decorate from './cards.js';
import style from './cards.css';

export const Three = (args, context) => Template(HelixApp, args, context, decorate);

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
