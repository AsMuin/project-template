export default function ErrorInfo({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="bg-blue-100 text-center">
            <h1 className="text-3xl text-red-500">出错啦</h1>
            <p className="text-red-400">{error.message}</p>
            <button className="bg-red-300 px-4 py-2" onClick={resetErrorBoundary}>
                重试
            </button>
        </div>
    );
}
