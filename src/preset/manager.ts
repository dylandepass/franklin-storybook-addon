/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { addons, types } from "@storybook/addons";
import { ADDON_ID, FRANKLIN_ID, CODE_ID } from "../constants";
import { EditorTab } from "../EditorTab";
import { CodeTab } from "../CodeTab";
import theme from './theme';

addons.register(ADDON_ID, () => {
  addons.add(CODE_ID, {
    type: types.PANEL,
    title: 'Code',
    render: CodeTab,
  });
  addons.add(FRANKLIN_ID, {
    type: types.PANEL,
    title: 'Franklin',
    render: EditorTab,
  });
});

addons.setConfig({
  theme,
});