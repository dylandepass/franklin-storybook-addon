import { loadPage } from '../.storybook/scripts.js';
import { Template } from '../src/template';
import decorate from './cards.js';
import style from './cards.css';

export const Three = (args, context) => Template(loadPage, args, context, decorate);

Three.storyName = 'Three Cards';

Three.parameters = {
  path: '/storybook/cards.plain.html',
  selector: '.cards',
  index: 0
}

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
