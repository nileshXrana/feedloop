export interface loginFormData {
    emailOrUsername: string;
    password: string;
}

export interface signupFormData {
    email: string;
    username: string;
    password: string;
}

export interface user {
    uuid: string;
    email: string;
    username: string;
    password: string;
    role: string;
    isActive: boolean;
}

export interface userState {
    user: user | null;
    loading: boolean;
    error: any | null;
}