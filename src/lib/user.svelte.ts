export interface AuthFormValues {
    username: string;
    password: string;
    name?: string;
}

export interface User {
    id: string;
    name: string;
}

export function usernameValid(username: string): boolean {
    // Alphanumeric and between 3 and 20 characters
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;

    return usernameRegex.test(username);
}

export function passwordValid(password: string): boolean {
    // Between 8 and 64 characters
    return password.length >= 8 && password.length <= 64;
}

export function nameValid(name: string): boolean {
    // Between 1 and 50 characters
    return name.length >= 1 && name.length <= 50;
}

export const userState: { user: User | null } = $state({ user: null });
