export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    expires: Date;
    dismissable: boolean;
}

export enum ToastType {
    Error = 10,
    Warning = 20,
    Info = 30,
    Success = 40
}

export interface ToastOptions {
    expireTime?: Date;
    expireMillis?: number;
    dismissable?: boolean;
}
