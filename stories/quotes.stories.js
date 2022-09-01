import { HelixApp } from '../.storybook/helix-web-library.esm.js';
import { Template } from '../src/template';
import decorate from './quotes.js';
import style from './quotes.css';

export const Quotes = (args, context) => Template(HelixApp, args, context, decorate);

Quotes.storyName = 'Quotes';

Quotes.parameters = {
  path: '/storybook/quotes.plain.html',
  selector: '.quotes',
  index: 0
}

/**
 * Default Config
 */
export default {
  title: 'Quotes',
  parameters: {
    docs: {
      description: {
        component: 'A block to display quotes',
      },
    },
  },
  argTypes: {
    blockClasses: {
      options: ['dark', 'inverted', 'highlight'],
      control: { type: 'radio' },
      table: {
        category: 'Block',
      },
    },
  }
};
