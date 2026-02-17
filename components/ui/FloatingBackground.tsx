export const FloatingBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vh] h-[40vh] bg-pink-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[40vh] h-[40vh] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50vh] h-[50vh] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-4000" />
        <div className="absolute bottom-[20%] right-[10%] w-[30vh] h-[30vh] bg-red-200 rounded-full mix-blend-multiply filter blur-[60px] opacity-30 animate-blob" />
    </div>
)
