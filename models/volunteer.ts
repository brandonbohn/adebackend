export interface Volunteer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    basedIn: 'nairobi' | 'kenya' | 'remote';
    availability?: string;
    interests: string[];
    otherInterest?: string;
    experience?: string;
    languagesSpoken?: string[];
    createdAt: string;
    status: 'pending' | 'approved' | 'rejected' | 'inactive';
}
