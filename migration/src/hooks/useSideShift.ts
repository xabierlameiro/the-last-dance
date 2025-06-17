import React from 'react';

const useSideShift = (): {
    left: boolean;
    right: boolean;
    onSideShiftLeft: (e: React.TouchEvent<HTMLDivElement>) => void;
    onSideShiftRight: (e: React.TouchEvent<HTMLDivElement>) => void;
} => {
    const [left, setLeft] = React.useState(false);
    const [right, setRight] = React.useState(false);

    const onSideShiftLeft = (e: React.TouchEvent<HTMLDivElement>) => {
        const { clientX } = e.touches[0];
        const { clientWidth } = e.currentTarget;
        if (clientX < clientWidth / 2) {
            setLeft(true);
        } else {
            setLeft(false);
        }
    };

    const onSideShiftRight = (e: React.TouchEvent<HTMLDivElement>) => {
        const { clientX } = e.touches[0];
        const { clientWidth } = e.currentTarget;
        if (clientX > clientWidth / 2) {
            setRight(false);
        } else {
            setRight(true);
        }
    };

    return { left, onSideShiftLeft, right, onSideShiftRight };
};

export default useSideShift;
