// WeEverything Shared Types

export type Role = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type ConversationType = 'DIRECT' | 'GROUP';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE';
export type TransactionType = 'CREDIT' | 'DEBIT';
export type PaymentRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
export type QrType = 'USER_PROFILE' | 'PAYMENT_REQUEST';
export type NotificationType =
  | 'CONNECTION_REQUEST'
  | 'CONNECTION_ACCEPTED'
  | 'NEW_MESSAGE'
  | 'MESSAGE_REACTION'
  | 'MOMENT_LIKE'
  | 'MOMENT_COMMENT'
  | 'WALLET_TRANSFER'
  | 'PAYMENT_REQUEST'
  | 'SYSTEM';

// API Response shapes
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    nextCursor?: string | null;
    hasMore?: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// User public profile
export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  statusMessage?: string | null;
  role: Role;
  createdAt: string;
}

// Wallet
export interface WalletBalance {
  walletId: string;
  balance: number; // in minor units
  currency: string;
  formattedBalance: string;
}

// Socket events
export interface SocketEvents {
  // Client emits
  'message:send': {
    conversationId: string;
    content: string;
    replyToId?: string;
  };
  'typing:start': { conversationId: string };
  'typing:stop': { conversationId: string };
  'conversation:join': { conversationId: string };
  'conversation:leave': { conversationId: string };
  'message:read': { conversationId: string; messageId: string };
  'poll:vote': { pollId: string; optionIds: string[] };

  // Server emits
  'message:new': {
    conversationId: string;
    message: unknown;
  };
  'message:updated': {
    conversationId: string;
    message: unknown;
  };
  'message:deleted': {
    conversationId: string;
    messageId: string;
  };
  'typing:update': {
    conversationId: string;
    userId: string;
    displayName: string;
    isTyping: boolean;
  };
  'presence:update': {
    userId: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  'notification:new': unknown;
  'poll:results': {
    pollId: string;
    options: Array<{ id: string; voteCount: number }>;
  };
}

// QR payload
export interface QrPayload {
  version: 'v1';
  type: QrType;
  id: string;
  ts: number; // timestamp
}
