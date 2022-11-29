# Franklin Storybook Addon
A storybook addon for working with Franklin projects.

## Configuring your franklin project with Storybook

1. Install storybook html

```bash
npx storybook init --type html
```

2. Install the Franklin storybook addon

```bash
npm install -D @dylandepass/franklin-storybook-addon
```

3. Update `./storybook/main.js`

Here we are telling storybook to expose the content in `./scripts`, `./styles` and `./icons` as static directies in storybook. 
This will allow us to use `styles.css` and other dependacies in our stories. We are also registering the `franklin-storybook-addon`
with storybook.

```json
module.exports = {
  "stories": [
    "../blocks/**/*.stories.js",
    "../blocks/**/*.stories.jsx",
    "../blocks/**/*.stories.mdx",
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@dylandepass/franklin-storybook-addon"
  ],
  "framework": "@storybook/html",
  "staticDirs": [
    { from: "../scripts", to: "/scripts" }, 
    { from: "../styles", to: "/styles" }, 
    { from: "../icons", to: "/icons" }
  ],
};
```

4. Delete the sample storybook content
```bash
rm -rf ./stories
```

5. Tell storybook to load `styles.css`

Create the file `preview-head.html` inside of `./.storybook`.

Add a link to `styles.css`

```html
<link rel="stylesheet" href="./styles/styles.css">
```

## Create stories content to load in storybook

1. In the root of the site content store (gdrive or sharepoint). Create a folder called `storybook`.

2. Inside the `storybook` folder create a document for a block you want to use within storybook. I.E cards

3. Paste an example cards content block inside the document and preview it.

4. In order for storybook to be able to load the example block we need to set a wildcard CORS policy on it.

    * Create a sheet at in the content store at `/.helix/headers` if one doesn't exist.

5. Add the following rows

    |url|key|value|
    |-|-|-|
    |/storybook/**|access-control-allow-origin|*|

## Create the story

1. Create a stories file for each block you want to use with storybook. I recommend putting the stories file in the same folder as the block code. (I.E blocks/cards/cards.stories.js)

    Here is an stories file for a cards block.

     ```js
        import { FranklinTemplate } from '@dylandepass/franklin-storybook-addon';
        import { loadPage } from '../../scripts/scripts.js';
        import decorate from './cards.js';
        import style from './cards.css';

        export const Cards = (args, context) => FranklinTemplate(loadPage, args, context, decorate);

        Cards.parameters = {
            path: '/storybook/cards.plain.html',
            selector: '.cards',
            index: 0,
        };

        Cards.storyName = 'Cards';

        /**
        * Default Config
        */
        export default {
            title: 'Cards',
            parameters: {
                docs: {
                    description: {
                        component: 'A block to display cards',
                    },
                },
            },
            argTypes: {
                blockClasses: {
                    options: ['light', 'dark'],
                    control: { type: 'radio' },
                    table: {
                        category: 'Block',
                    },
                },
            },
        };
     ```

2. Setup `argTypes`

    The addon supports two types of optional argTypes, `sectionClasses` and `blockClasses`. The option can either be mutually exclusive or not. If you want to support multiple classes at the same time you can change the control type from `radio` to `check`.

    #### Section Classes
    
    Any classes added to `sectionClasses` will be added to the section element as well as added get added to `section-metadata` in the content tab. 

    #### Block Classes

    Any classes added to `blockClasses` will be added to the block element and block heading in the content tab.

## Development scripts

- `yarn start` runs babel in watch mode and starts Storybook

- `yarn build` build and package your addon code