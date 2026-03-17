interface PermissionRules {
    [role: string]: {
        [resource in Resource]?: {
            [action in Action]?: boolean;
        };
    };
}

type Resource = 'article' | 'comment' | 'user'; // 示例资源
type Action = 'create' | 'view' | 'update' | 'delete';
type Role = 'admin' | 'editor' | 'reader';

const permissions: { rules: PermissionRules } = {
    rules: {
        admin: {
            article: { create: true, view: true, update: true, delete: true },
            comment: { create: true, view: true, update: true, delete: true }
        },
        editor: {
            article: { create: true, view: true, update: true, delete: false },
            comment: { create: true, view: true, update: true, delete: false }
        },
        reader: {
            article: { view: true },
            comment: { view: true }
        }
    }
};

export interface User {
    id: string;
    roles: Role[];
}

// 权限检查函数
export default function checkPermission(userRoles: Role[], resource: Resource, action: Action, isOwner?: boolean): boolean {
    if (isOwner && action !== 'delete') {
        return true;
    }

    return userRoles.some(role => permissions.rules[role]?.[resource]?.[action] === true);
}
