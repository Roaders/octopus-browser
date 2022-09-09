export interface IProductsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: IProduct[];
}

export interface IProduct {
    code: string;
    full_name: string;
    display_name: string;
    description: string;
    is_variable: boolean;
    is_green: boolean;
    is_tracker: boolean;
    is_prepay: boolean;
    is_business: boolean;
    is_restricted: boolean;
    /**
     * term in months
     */
    term: number;
    brand: string;
    available_from: string | null;
    available_to: string | null;
    // undocumented (might disappear)
    direction?: 'IMPORT' | 'EXPORT' | null;
    links: ILink[];
}

export interface ILink {
    href: string;
    method: string;
    rel: string;
}
