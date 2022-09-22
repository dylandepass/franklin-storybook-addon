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

import React, { useState, useRef, useEffect } from 'react';
import JoditEditor from "jodit-react";
import { useStorybookState, useParameter, useArgs } from '@storybook/api';
import { convertBlocksToTables, createSectionMetadata, convertTablesToBlocks } from "./DomUtils";

/**
 * Rich text editor for rendering and updated content for helix. 
 */
export const FranklinEditor: React.FC = () => {
    const editor = useRef(null)
    const [content, setContent] = useState('');
    const [config, setConfig] = useState({});
    const [updated, setUpdated] = useState(false);
    const [_, updateArgs] = useArgs();
    const host = useParameter('host', undefined);
    const path = useParameter('path', undefined);
    const selector = useParameter('selector', undefined);
    const index = useParameter('index', 0);
    const state = useStorybookState();

    useEffect(() => {
        if (host && path) {
            fetch(`${host}${path}`)
                .then(res => res.text())
                .then(res => {
                    const config = {
                        readonly: false,
                        buttons: ['bold', 'italic', 'underline', 'paragraph', 'image', '|', 'ul', 'li', 'table', '|', 'selectall', 'copy', 'source'],
                        toolbarAdaptive: false,
                        zIndex: -1
                    }

                    // Fix relative images to absolute
                    const regex = new RegExp('./media', 'g');
                    const contentHTML = res.replace(regex, `${host}/media`);

                    // Prepare content for rendering in jodit
                    const div = document.createElement('div');
                    div.innerHTML = contentHTML;

                    // Query for target block and index
                    if (selector) {
                        const node = div.querySelectorAll(selector).item(index ?? 0);
                        div.innerHTML = node.outerHTML;
                    }

                    // Fetch active story
                    const story = state.storiesHash[state.storyId] as any;
                    convertBlocksToTables(div, story.args.blockClasses);
                    createSectionMetadata(div, story);
                    setContent(div.outerHTML);
                    setConfig(config);
                })
                .catch(err => console.log(err));
        }
    }, [path, selector, index]);

    function onChange(newContent: string) {
        if(updated) {
            const div = document.createElement('div');
            div.innerHTML = newContent;
            const res = convertTablesToBlocks(div);
            updateArgs({ 'content': res, 'updated': updated });
        }
        setUpdated(true);
    }

    return (
        <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onChange={onChange}
        />
    );
}