import React from 'react';
import Folder from '.';
import { tools } from '@/constants/navMenu';

export default {
    title: 'Dock / Tools folder',
    component: Folder,
};

/*
 * The panel opens upwards, against the Dock's own bottom edge, so the story leaves room below it.
 */
export const Primary = () => (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 200 }}>
        <Folder label="Tools" img="/menu/tools.png" tools={tools} onNavigate={() => {}} />
    </div>
);
