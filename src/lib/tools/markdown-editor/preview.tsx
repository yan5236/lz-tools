'use client';

import React from 'react';
import MDEditor from '@uiw/react-md-editor';

interface PreviewProps {
  markdown: string;
}

// 使用@uiw/react-md-editor的预览功能
export default function Preview({ markdown }: PreviewProps) {
  return (
    <div data-color-mode="light" style={{ padding: '10px' }}>
      <div className="wmde-markdown-var"></div>
      <article className="wmde-markdown wmde-markdown-color">
        <MDEditor.Markdown source={markdown || ''} />
      </article>
    </div>
  );
} 