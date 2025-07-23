export interface XRPData {
    price: number;
    todaySummary: string;
    todayPorcentage: string;
}

export interface XRPError {
    error: string;
}

export type XRPResponse = XRPData | XRPError;

export const isXRPError = (data: XRPResponse): data is XRPError => {
    return 'error' in data;
};

// Deployment types
export type DeploymentStatus = 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
export type DeploymentEnvironment = 'production' | 'preview';

export interface DeploymentData {
    status: DeploymentStatus;
    environment: DeploymentEnvironment;
    createdAt: string;
    buildingAt: string;
    ready: string;
    username: string;
}

// Analytics types
export interface AnalyticsData {
    pageViews: number;
    newUsers: number;
}

// Heating types
export interface HeatingData {
    outsideTemp: number;
    zoneMeasuredTemp: number;
}

// Counter types
export interface CounterData {
    num: number;
}

// News types
export interface NewsItem {
    link: string;
    title: string;
    published: string;
    description: string;
}

export interface NewsData {
    news: NewsItem[];
}
