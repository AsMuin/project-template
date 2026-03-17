interface IResponse<T = unknown, IsQueryData extends boolean = false> {
    success: boolean;
    message: string;
    data: T;
    total?: IsQueryData extends true ? number : never;
    page?: IsQueryData extends true ? number : never;
    limit?: IsQueryData extends true ? number : never;
}

export {IResponse};
