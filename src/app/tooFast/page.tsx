export default function TooFastPage() {
    return (
        <main className="root-container flex flex-col items-center justify-center">
            <h1 className="font-bebas-neue text-light-100 text-5xl font-bold">请求过于频繁</h1>
            <p className="text-light-400 mt-3 max-w-xl text-center">看起来你的请求过于频繁，我们将你置于速率限制中，请您稍后再试</p>
        </main>
    );
}
