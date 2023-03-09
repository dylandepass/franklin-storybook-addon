import React, { useState, useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import darkTheme from 'react-syntax-highlighter/dist/esm/styles/hljs/monokai';
import prettier from 'prettier/standalone';
import prettierHtml from 'prettier/parser-html';
import { useChannel, useStorybookApi } from '@storybook/manager-api';
import { STORY_RENDERED } from '@storybook/core-events'

export const Code: React.FC = () => {
  const [code, setCode] = useState('');
  const api = useStorybookApi();
  const channel = api?.getChannel() || {};
  console.log('c');
  console.log(channel);

  useEffect(() => {
    const rendered = (channel as any)?.data?.['franklin/block-rendered']?.[0] || { code: 'No code found' };
    console.log('channel', channel);
    console.log('rendereed', rendered);
    if(rendered.code) {
      setCode(rendered.code);
    }
  });

  useChannel({
    ['franklin/block-rendered']: ({ code }) => setCode(code ?? ''),
  });

  useChannel({
    [STORY_RENDERED]: ({ code }) => setCode(code ?? ''),
  });

  const formatted = prettier.format(`${code}`, {
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