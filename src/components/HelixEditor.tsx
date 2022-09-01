
import React, { useState, useRef, useEffect } from 'react';
import JoditEditor from "jodit-react";
import { convertBlocksToTables, createSectionMetadata, convertTablesToBlocks } from "./DomUtils";
import { useStorybookState, useParameter, useArgs } from '@storybook/api';

interface HelixEditorProps { }

export const HelixEditor: React.FC<HelixEditorProps> = () => {
    const editor = useRef(null)
    const [content, setContent] = useState('');
    const [config, setConfig] = useState({});
    const state = useStorybookState();
    const [_, updateArgs] = useArgs();
    const host = useParameter('host', undefined);
    const path = useParameter('path', undefined);
    const selector = useParameter('selector', undefined);
    const index = useParameter('index', 0);

    useEffect(() => {
        if (host && path) {
            fetch(`${host}${path}`)
                .then(res => res.text())
                .then(res => {
                    const config = {
                        readonly: false,
                        buttons: ['bold', 'italic', 'underline', 'paragraph', '|', 'ul', 'li', 'table', '|', 'selectall', 'copy', 'source'],
                        toolbarAdaptive: false,
                        zIndex: -1
                    }
                    setConfig(config);
                    const regex = new RegExp('./media', 'g');
                    const contentHTML = res.replace(regex, `${host}/media`);
                    const div = document.createElement('div');
                    div.innerHTML = contentHTML;

                    const node = div.querySelectorAll(selector).item(index);

                    div.innerHTML = `<div>${node.outerHTML}</div>`;
                    const story = state.storiesHash[state.storyId] as any;
                    convertBlocksToTables(div.firstElementChild as HTMLDivElement, document, story.args.blockClasses);
                    createSectionMetadata(div.firstElementChild as HTMLDivElement, document, story);

                    div.style.width = "585px";
                    div.style.margin = "0 auto";
                    setContent(div.outerHTML);
                })
                .catch(err => console.log(err));
        }
    }, [path]);

    const onchange = (newContent: string) => {
        const div = document.createElement('div');
        div.innerHTML = newContent;
        const res = convertTablesToBlocks(div, document);
        updateArgs({ 'content': res });
    }

    return (
        <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onChange={onchange}
        />
    );
}