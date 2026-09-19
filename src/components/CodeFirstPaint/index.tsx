import React from 'react';
import { Code } from '@code-hike/mdx/dist/components.cjs.js';
import styles from './codeFirstPaint.module.css';

type Props = React.ComponentProps<typeof Code>;

// Code Hike always pads the line-number column to at least two digits.
const MIN_LINE_NUMBER = 10;

/**
 * @description `CH.Code` with the active file painted in the server HTML.
 *
 * Code Hike lays code out from measurements it can only take in the browser, so until the page
 * hydrates it renders the lines at `opacity: 0` and the window is an empty dark box. On a cold load
 * that is the whole JS download. This paints the same highlighted tokens, which the MDX compiler
 * already passes in `files`, over that box until Code Hike has measured. Both happen in layout
 * effects of the same commit, so the swap never reaches the screen as an empty frame.
 *
 * `aria-hidden`: the text is also in Code Hike's own hidden layer, and a reader must not hear it twice.
 * @param {Props} props - The props `CH.Code` receives from the compiled MDX.
 * @returns {JSX.Element}
 */
const CodeFirstPaint = (props: Props) => {
    const [measured, setMeasured] = React.useState(false);
    React.useLayoutEffect(() => setMeasured(true), []);

    const { files, northPanel, lineNumbers, codeConfig, style } = props;
    const file = files.find(({ name }) => name === northPanel.active) ?? files[0];
    // `IRawTheme` leaves `colors` untyped; the MDX pipeline passes a VS Code theme (mdx.plugins.ts).
    const colors = (codeConfig.theme as { colors?: Record<string, string> }).colors ?? {};
    const lines = file?.code.lines ?? [];
    const numberWidth = `${String(Math.max(lines.length, MIN_LINE_NUMBER)).length + 2.5}ch`;

    return (
        <div className={styles.root} style={{ height: style?.height }}>
            <Code {...props} />
            {!measured && file && (
                <div
                    className={styles.firstPaint}
                    aria-hidden="true"
                    data-testid="code-first-paint"
                    style={{ background: colors['editor.background'], color: colors['editor.foreground'] }}
                >
                    <code className="ch-code-scroll-parent">
                        {lines.map(({ tokens }, index) => (
                            // Lines have no identity beyond their position, and the list never reorders.
                            <div key={index}>
                                {lineNumbers && (
                                    <span className="ch-code-line-number" style={{ width: numberWidth }}>
                                        {index + 1}
                                    </span>
                                )}
                                <span>
                                    {tokens.map(({ content, props: tokenProps }, tokenIndex) => (
                                        <span key={tokenIndex} style={tokenProps?.style}>
                                            {content}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        ))}
                    </code>
                </div>
            )}
        </div>
    );
};

export default CodeFirstPaint;
