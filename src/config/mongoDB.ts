import mongoose from 'mongoose';

async function connectToMongoDB() {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB🙌');
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}`);
    } catch (err) {
        console.error(err);
    }
}
export default connectToMongoDB;
