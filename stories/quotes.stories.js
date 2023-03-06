import { loadPage } from '../.storybook/scripts.js';
import { BlockTemplate } from '../src/BlockTemplate';
import decorate from './quotes.js';
import style from './quotes.css';

export const Quotes = {
  parameters: {
    path: '/storybook/quotes.plain.html',
    selector: '.quotes',
    index: 0
  },
  render: (args, context) => BlockTemplate(loadPage, args, context, decorate),
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
