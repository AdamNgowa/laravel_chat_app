export type ChatPreview = {
    body: string;
    sender_name: string;
    is_mine: boolean;
    is_system: boolean;
};

export type ChatSummary = {
    id: number;
    type: "direct" | "group";
    title: string;
    preview: ChatPreview | null;
    last_activity_at: string; // an ISO date string, not a Date object
    has_left: boolean;
};
