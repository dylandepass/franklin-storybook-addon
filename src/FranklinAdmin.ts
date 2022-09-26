/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any.The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 **************************************************************************/

import {
    ISiteConfig,
    IFranklinStatus,
    IFranklinEnvironment,
    IFranklinEnvironmentWithSource
} from './typings';

const API_BASE_URL = 'https://admin.hlx.page';

/**
 * Returns true if the href provided in a CDN URL
 *
 * @public
 */
export function isCDNUrl(href: string): boolean {
    return href.includes('hlx.page') || href.includes('hlx.live');
}

/**
 * A utility wrapper for working with the Franklin Admin Service
 *
 * @public
 */
export class FranklinAdmin {
    constructor() {}

    /**
     * Assert if a URL is a valid Franklin CDN URL
     *
     * @param href - The URL to assert
     * @returns True if url is a valid CDN URL
     */
    private _assertCDN(href: string): boolean {
        if (isCDNUrl(href)) {
            return true;
        }
        throw new Error('Domain must end in hlx.page or hlx.live');
    }

    /**
     * Resolve the site configuration from a URL
     *
     * @param url - The URL to resolve
     * @returns The site configuration
     */
    resolveConfig(url: URL): ISiteConfig {
        const [ref, repo, owner] = url.hostname.split('.')[0].split('--');
        return {
            owner: owner,
            repo: repo,
            ref: ref
        };
    }

    /**
     * Return the preview URL for any CDN Url
     *
     * @param href - The CDN URL
     * @returns The preview URL
     */
    getPreviewUrl(href: string): string {
        this._assertCDN(href);

        return href.replace('hlx.live', 'hlx.page');
    }

    /**
     * Return a admin endpoint for any CDN Url and api
     *
     * @param href - The CDN URL
     * @param api - The API to use
     * @returns An admin URL
     */
    getAdminUrl(href: string, api: string, qps?: URLSearchParams | Record<string, string>): URL {
        this._assertCDN(href);

        const url = new URL(href);
        if (qps) {
            const sp = new URLSearchParams(qps);
            url.search = sp.toString();
        }
        const config = this.resolveConfig(url);
        return new URL(`${API_BASE_URL}/${api}/${config.owner}/${config.repo}/${config.ref}${url.pathname}${url.search}`);
    }

    /**
     * Fetch a pages Edit URL from a CDN URL
     *
     * @param href - The CDN URL
     * @returns The Edit URL, without the hostname/protocol
     */
    async fetchEditUrl(href: string): Promise<string> {
        const qps = { editUrl: 'auto' };
        const status = await this.fetchStatus<IFranklinEnvironmentWithSource>(href, qps);
        return status.edit.url;
    }

    /**
     * Fetch the status of a page from a CDN URL
     *
     * @param href - The CDN URL
     * @returns A Franklin page status
     */
    async fetchStatus<T extends IFranklinEnvironment>(
        href: string,
        qps?: URLSearchParams | Record<string, string>
    ): Promise<IFranklinStatus<T>> {
        this._assertCDN(href);

        const adminUrl = this.getAdminUrl(href, 'status', qps);

        const response = await fetch(adminUrl.href);

        if (response.status === 200) {
            return response.json();
        }
        /* c8 ignore next 2 */
        throw new Error(`Error ${response.status}: Unable to fetch status`);
    }
}