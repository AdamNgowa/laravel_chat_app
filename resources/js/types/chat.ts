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

export type ChatMessage = {
    id: number;
    type: "text" | "system";
    body: string | null;
    sender_id: number;
    sender_name: string;
    is_mine: boolean;
    created_at: string;
    edited_at: string | null;
};

export type ActiveChat = {
    id: number;
    type: "direct" | "group";
    title: string;
    can_send: boolean;
    has_more: boolean;
    messages: ChatMessage[]; // oldest first
};
