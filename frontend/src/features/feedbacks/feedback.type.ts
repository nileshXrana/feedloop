export interface feedbackFormData {
    title: string;
    description: string;
    status: 'public' | 'private';
    tags: string[];
}