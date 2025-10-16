export interface Medication{
    name: string;
    time: string; // Format "HH:MM"
    taken: boolean;
    reminderSent: boolean;
}

export interface UserMedications {
    [userId: string]: Medication[];
}