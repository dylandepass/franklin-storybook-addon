import { addons, types } from "@storybook/addons";
import { ADDON_ID, TAB_ID } from "../constants";
import { EditorTab } from "../EditorTab";

// Register the addon
addons.register(ADDON_ID, () => {
  addons.add(TAB_ID, {
    type: types.PANEL,
    title: 'Content',
    render: EditorTab,
  });
});
