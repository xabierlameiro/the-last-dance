"use client"

import React, { useState, ReactNode } from 'react';
import Dialog from '../Dialog';
import { DialogProvider } from '../../context/DialogContext';

interface DialogWithControlsProps {
    className?: string;
    modalMode?: boolean;
    withPadding?: boolean;
    large?: boolean;
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
}

export function DialogWithControls({ children, ...props }: DialogWithControlsProps & { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Escuchar eventos de control del dialog
    React.useEffect(() => {
        const handleMinimize = () => {
            setIsMinimized(true);
        };

        const handleFullscreen = (event: CustomEvent) => {
            setIsFullscreen(event.detail.enable);
        };

        window.addEventListener('dialog-minimize', handleMinimize);
        window.addEventListener('dialog-fullscreen', handleFullscreen as EventListener);

        return () => {
            window.removeEventListener('dialog-minimize', handleMinimize);
            window.removeEventListener('dialog-fullscreen', handleFullscreen as EventListener);
        };
    }, []);

    return (
        <DialogProvider>
            <Dialog
                {...props}
                open={isOpen && !isMinimized}
                isMinimized={isMinimized}
                isFullscreen={isFullscreen}
                body={children}
            />
            {isMinimized && (
                <div 
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        zIndex: 1000
                    }}
                >
                    <button 
                        onClick={() => setIsMinimized(false)}
                        style={{
                            background: '#2d2d30',
                            border: '1px solid #3e3e42',
                            borderRadius: '8px',
                            color: '#cccccc',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
                        }}
                    >
                        📱 Xabier Lameiro - Portfolio
                    </button>
                </div>
            )}
        </DialogProvider>
    );
}

// Hook para controlar el dialog desde los componentes hijos
export function useDialogControls() {
    return {
        close: () => window.location.href = '/',
        minimize: () => {
            // Enviar evento personalizado
            window.dispatchEvent(new CustomEvent('dialog-minimize'));
        },
        fullscreen: (enable: boolean) => {
            // Enviar evento personalizado
            window.dispatchEvent(new CustomEvent('dialog-fullscreen', { detail: { enable } }));
        }
    };
}
