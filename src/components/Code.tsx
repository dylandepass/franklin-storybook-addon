import React, { useState } from 'react';
import { useAddonState } from '@storybook/manager-api';
import SyntaxHighlighter from 'react-syntax-highlighter';
import darkTheme from 'react-syntax-highlighter/dist/esm/styles/hljs/monokai';
import prettier from 'prettier/standalone';
import prettierHtml from 'prettier/parser-html';
import { ADDON_ID } from '../constants';
import { useChannel } from '@storybook/manager-api';
import { STORY_RENDERED } from '@storybook/core-events'

export const Code: React.FC = () => {
  const [content, setContent] = useState('No code found');
  const [state, setState] = useAddonState(ADDON_ID, {
    code: '',
  });

  useChannel({
    ['franklin/block-rendered']: ({ code }) => setState((state) => ({ ...state, code })),
  });

  useChannel({
    [STORY_RENDERED]: ({ code }) => setState((state) => ({ ...state, code: '' })),
  });

  const formatted = prettier.format(`${state.code}`, {
    parser: 'html',
    plugins: [prettierHtml],
    htmlWhitespaceSensitivity: 'ignore',
  });

  return (
    <SyntaxHighlighter language="htmlbars" style={darkTheme} showLineNumbers={true}>
        {formatted}      
    </SyntaxHighlighter>
  );
}