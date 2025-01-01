import mongoose from 'mongoose';

export interface IDemo {
    name: string;
}
const demoSchema = new mongoose.Schema<IDemo>({
    name: { type: String, required: true }
});

export default mongoose.model<IDemo>('Demo', demoSchema);
