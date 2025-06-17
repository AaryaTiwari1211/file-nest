export { }

export type Roles = 'admin' | 'member' | 'super-admin';

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        }
    }
}