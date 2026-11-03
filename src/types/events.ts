export type EventMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    mode: EventMode;
    speaker: string;
    attendees: number;
    seats?: number; // New field for upcoming events
    duration: string;
    registrationUrl: string;
    detailsUrl?: string;
    requiresPayment?: boolean;
    registrationFeePaise?: number;
    isPast: boolean;
    isLive?: boolean;
    winners?: string[];
    image?: string;
    galleryImages?: string[];
    // Optional legacy fields for backward compatibility
    tags?: string[];
    longDescription?: string;
    agenda?: {
        time: string;
        title: string;
        description: string;
    }[];
    whatYouWillLearn?: string[];
    whoShouldAttend?: string[];
}
