import VisibilityManager from '@/components/VisibilityManager';
import Image from 'next/image';
import { MDXComponents } from 'mdx/types';

const GoogleAdsense = () => {
    return (
        <VisibilityManager hideOnDesktop hideOnTablet>
            <div
                style={{
                    display: 'grid',
                    margin: '0 auto',
                    minHeight: 'auto',
                    overflow: 'hidden',
                }}
            >
                {/* Adsense component placeholder */}
                <div>Advertisement placeholder</div>
            </div>
        </VisibilityManager>
    );
};

// Simple Date component for MDX
const DateComponent = ({ date }: { date: string }) => {
    return (
        <time dateTime={date} style={{ 
            fontSize: '0.875rem', 
            color: '#666', 
            fontStyle: 'italic' 
        }}>
            {new Date(date).toLocaleDateString()}
        </time>
    );
};

// Create a simple version without hooks for MDX
const ControlButtons = () => {
    return null; // Or a simple static version without hooks
};

// Simple pre component for rendering code without highlighting
const SimpleCodeBlock = ({ children, style, className, ...props }: any) => {
    return (
        <div 
            style={style}
            className={className}
        >
            <pre 
                className="bg-gray-900 text-white p-4 rounded overflow-x-auto border" 
                {...props}
            >
                <code>{children}</code>
            </pre>
        </div>
    );
};

// Create CH component to maintain compatibility with legacy MDX files
const CHCode = ({ children, style, lineNumbers, ...props }: any) => {
    return <SimpleCodeBlock style={style} {...props}>{children}</SimpleCodeBlock>;
};

const CH = {
    Code: CHCode,
};

// Make CH available globally for legacy MDX files
if (typeof globalThis !== 'undefined') {
    (globalThis as any).CH = CH;
}

export const components: MDXComponents = { 
    ControlButtons, 
    Date: DateComponent, 
    GoogleAdsense, 
    Image,
    CH, // Add CH to components
    pre: SimpleCodeBlock,
    code: ({ children }: { children: React.ReactNode }) => (
        <code className="bg-gray-800 text-gray-100 px-1 py-0.5 rounded text-sm">
            {children}
        </code>
    ),
} as any;
