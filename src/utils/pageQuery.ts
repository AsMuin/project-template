import mongoose from 'mongoose';

interface IPageQueryResult<T> {
    itemList: T[];
    total: number;
    isEnd: boolean;
}
const pageQuery =
    <T = any>(Model: mongoose.Model<T>) =>
    async (pageIndex: number | string, pageSize: number | string) => {
        try {
            pageIndex = typeof pageIndex === 'string' ? parseInt(pageIndex) : pageIndex;
            pageSize = typeof pageSize === 'string' ? parseInt(pageSize) : pageSize;
            const itemListPromise = Model.find()
                .skip(pageIndex * pageSize)
                .limit(pageSize)
                .exec();
            const totalPromise = Model.countDocuments().exec();
            const [itemList, total] = await Promise.all([itemListPromise, totalPromise]);
            const isEnd = (pageIndex + 1) * pageSize >= total;
            const result: IPageQueryResult<T> = {
                itemList,
                total,
                isEnd
            };
            return result;
        } catch (err: any) {
            console.error(err);
            return Promise.reject(err);
        }
    };

export default pageQuery;
