import { addons } from '@storybook/addons';

export function sourceDecorator(storyFn: any, context: any) {
  const story = context.originalStoryFn(context.args, context);
  setTimeout(() =>{
    addons
      .getChannel()
      .emit('franklin/block-rendered', { code: story instanceof HTMLElement ? story.outerHTML : story });
  }, 800);
  return story;
}