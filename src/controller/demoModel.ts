import mongoose from 'mongoose';

export interface IDemo {
    name: string;
}
const demoSchema = new mongoose.Schema<IDemo>({
    name: { type: String, required: true }
});

const Demo = mongoose.models.Demo || mongoose.model<IDemo>('Demo', demoSchema);

export default Demo;
