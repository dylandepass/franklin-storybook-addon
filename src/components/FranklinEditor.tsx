/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import { useParameter } from '@storybook/manager-api';
import { FranklinAdmin } from '../FranklinAdmin';

/**
 * Rich text editor for rendering and updated content for helix. 
 */
export const FranklinEditor: React.FC = () => {
    const host = useParameter('host', undefined);
    const path = useParameter('path', undefined);

    async function viewPreview() {
        const admin = new FranklinAdmin();
        const previewUrl = await admin.getPreviewUrl(`${host}${path.replace('.plain.html', '')}`);
        window.open(previewUrl, "_blank");
    }

    async function viewSource() {
        const admin = new FranklinAdmin();
        const editUrl = await admin.fetchEditUrl(`${host}${path}`);
        window.open(editUrl, "_blank");
    }

    if(path) {
        return (
            <div style={{display: "flex", flexDirection: "column", gap: "20px", padding: "20px", width:"140px"}}>
                <button onClick={viewPreview}>View Preview</button>
                <button onClick={viewSource}>View Source</button>
            </div>
        );
    }

    return (
        <div style={{padding: "20px"}}><h3>Not a franklin based story</h3></div>
    )
}