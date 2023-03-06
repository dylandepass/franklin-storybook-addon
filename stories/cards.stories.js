import { loadPage } from '../.storybook/scripts.js';
import { BlockTemplate } from '../src/BlockTemplate';
import decorate from './cards.js';
import style from './cards.css';

export const Three = {
  parameters: {
    path: '/storybook/cards.plain.html',
    selector: '.cards',
    decorate,
    loadPage,
    index: 0
  },
  render: (args, context) => BlockTemplate(loadPage, args, context, decorate),
};

/**
 * Default Config
 */
export default {
  title: 'Cards',
  parameters: {
    docs: {
      description: {
        component: 'Cards are lists of (optional) images or icons, and descriptive text. They are used to display information about a product, service, or event.',
      },
    },
  },
  argTypes: {
    sectionClasses: {
      options: ['wide', 'zoom'],
      control: { type: 'radio' },
      table: {
        category: 'Section',
        defaultValue: { summary: false },
      },
    },
    theme: {
      options: ['option1', 'option2'],
      control: { type: 'select' },
      table: {
        category: 'Section',
      },
    },
    blockClasses: {
      options: ['two', 'three'],
      control: { type: 'radio' },
      table: {
        category: 'Block',
      },
    },
  }
};
