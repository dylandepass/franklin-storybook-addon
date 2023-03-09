import { addons } from '@storybook/addons';
import { STORY_RENDERED } from '@storybook/core-events'

export function sourceDecorator(storyFn: any, context: any) {
  const story = context.originalStoryFn(context.args, context);
  console.log('source decorator run');
  console.log('story', story);
    console.log('timeout run', story);
    console.log('chan', addons.getChannel());
    addons
      .getChannel()
      .emit('franklin/block-rendered', { code: story instanceof HTMLElement ? story.outerHTML : story });
    addons
      .getChannel()
      .emit(STORY_RENDERED, { code: story instanceof HTMLElement ? story.outerHTML : story });    
  return story;
}