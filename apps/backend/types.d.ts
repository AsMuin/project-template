import type { Request, Response, NextFunction } from 'express';
import { InferModel } from 'drizzle-orm';
import users from '@/models/users';
import blackList from '@/models/blackList';

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload; // 可选的用户信息
        }
    }

    interface UserPayload {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string | null;
        roles: string[];
    }

    type IUser = InferModel<typeof users>;
    type IBlackList = InferModel<typeof blackList>;

    type RefreshPayload = Pick<UserPayload, 'id'>;

    interface ControllerAction {
        (req: Request, res: Response, next: NextFunction): void;
    }

    interface QueryParams<P = unknown> extends P {
        page: number;
        limit: number;
        signal?: AbortSignal;
    }

    interface SearchResult {
        title: string;
        content: string;
        url: string;
        source: 'twitter' | 'bing' | 'google' | 'duckduckgo' | 'hackernews' | 'sogou' | 'bilibili' | 'weibo';
        sourceId?: string;
        publishedAt?: Date;
        viewCount?: number;
        likeCount?: number;
        retweetCount?: number;
        replyCount?: number; // Twitter 回复数
        quoteCount?: number; // Twitter 引用数
        score?: number; // Hacker News score
        commentCount?: number; // Hacker News / Bilibili comments
        danmakuCount?: number; // Bilibili 弹幕数
        author?: {
            name: string;
            username?: string;
            avatar?: string;
            followers?: number;
            verified?: boolean;
        };
    }
}

interface Search {
    (query: string): Promise<SearchResult[]>;
}

export { Search };
