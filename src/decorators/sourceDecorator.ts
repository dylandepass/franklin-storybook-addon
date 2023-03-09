import { addons } from '@storybook/addons';

export function sourceDecorator(storyFn: any, context: any) {
  const story = context.originalStoryFn(context.args, context);
  console.log('source decorator run');
  console.log('story', story);
  setTimeout(() =>{
    console.log('timeout run', story);
    addons
      .getChannel()
      .emit('franklin/block-rendered', { code: story instanceof HTMLElement ? story.outerHTML : story });
  }, 800);
  return story;
}