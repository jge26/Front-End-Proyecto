export interface ResponseAcceso {
    status: string;
    message: string;
    data: {
        user: {
            id: number;
            name: string;
            lastname: string;
            role_id: number;
            rut: string;
            phone: string;
            email: string;
            email_verified_at: string | null;
            created_at: string;
            update_at: string;
        };
        token: string;
    }
}