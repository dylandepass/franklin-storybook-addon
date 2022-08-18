import React from "react";
import { Button } from "./Button";

export default {
  title: "Example/Button",
  component: Button,
  parameters: {
    myAddonParameter: 'https://docs.google.com/document/d/e/2PACX-1vTzp7tFJDaIk1E8Amh6xxMhSrWox2PTMqPHLHrRbxpkamXVtnrnVHjpIGqcaIn1EhN92_8Zb2KAHCCR/pub',
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: "Button",
  my: 'https://docs.google.com/document/d/e/2PACX-1vTzp7tFJDaIk1E8Amh6xxMhSrWox2PTMqPHLHrRbxpkamXVtnrnVHjpIGqcaIn1EhN92_8Zb2KAHCCR/pub',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: "Button",
};

export const Large = Template.bind({});
Large.args = {
  size: "large",
  label: "Button",
};

export const Small = Template.bind({});
Small.args = {
  size: "small",
  label: "Button",
};
