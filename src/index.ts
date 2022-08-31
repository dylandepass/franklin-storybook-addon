import { Template } from './template';

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}

// make it work with --isolatedModules
export default {};
export { Template as HelixTemplate };
