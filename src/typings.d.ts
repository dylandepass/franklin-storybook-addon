declare module "global";

/**
 * @public
 */
export interface ISiteConfig {
    owner: string;
    repo: string;
    ref: string;
}

/**
 * @public
 */
export interface IFranklinStatus<T extends IFranklinEnvironment = IFranklinEnvironment> {
    webPath: string;
    resourcePath: string;
    preview: T;
    live: T;
    edit: T;
    links: {
        status: string;
        preview: string;
        live: string;
        code: string;
    };
}

/**
 * @public
 */
export interface IFranklinEnvironment {
    url: string;
    status: number;
    contentBusId: string;
    sourceLocation?: string;
    sourceLastModified?: string;
}

/**
 * @public
 * Additional properties returned when using the qp editUrl="auto"
 */
export interface IFranklinEnvironmentWithSource extends IFranklinEnvironment {
    contentType: string;
    lastModified: string;
    sourceLocation: string;
    sourceLastModified: string;
}
