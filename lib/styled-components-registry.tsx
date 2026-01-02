'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';

if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = (...args) => {
        // React passes arguments like ("Error: %s", "message", ...) so we need to check all args
        const fullMessage = args.map(arg => typeof arg === 'string' ? arg : '').join(' ');

        if (
            fullMessage.includes('disableTransition') ||
            fullMessage.includes('unknown prop "items"') ||
            fullMessage.includes('unknown prop "disableTransition"')
        ) {
            return;
        }
        originalError(...args);
    };
}

export default function StyledComponentsRegistry({
    children,
}: {
    children: React.ReactNode;
}) {
    // Only create stylesheet once with lazy initial state
    // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

    useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();
        return <>{styles}</>;
    });

    if (typeof window !== 'undefined') return <>{children}</>;

    return (
        <StyleSheetManager
            sheet={styledComponentsStyleSheet.instance}
            shouldForwardProp={(propName, elementToBeRendered) => {
                return typeof propName === 'string' ? isPropValid(propName) && !['disableTransition', 'items'].includes(propName) : true;
            }}
        >
            {children}
        </StyleSheetManager>
    );
}
