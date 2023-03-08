module.exports = {
  stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["../preset.js", "@storybook/addon-essentials", "@storybook/addon-mdx-gfm"],
  framework: {
    name: "@storybook/html-webpack5",
    options: {}
  },
  docs: {
    autodocs: true
  }
};