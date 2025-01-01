import mongoose from 'mongoose';

async function connectToMongoDB() {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB🙌');
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/wood-music`);
    } catch (err) {
        console.error(err);
    }
}
export default connectToMongoDB;
