import { Template } from '/.storybook/template.js';
import decorate from './cards.js';
import style from './cards.css';

export const Three = (args, context) => Template(args, context, decorate);

Three.parameters = {
  path: '/storybook/cards.plain.html',
  selector: '.cards',
  index: 0
}

Three.storyName = 'Three Cards';

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
    sectionStyles: {
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
