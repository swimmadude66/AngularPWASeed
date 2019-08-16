export interface User {
    Email: string;
    UserId: string;
    Role: UserRole;
    CreatedAt: Date;
    Active?: boolean;
};

export type UserRole = 'user' | 'admin';
