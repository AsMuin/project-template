import { createLazyFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Rocket, Zap, Shield, Cpu, Github, ArrowRight } from 'lucide-react';
import { Button, Spotlight } from '@repo/ui-sdk';

function RouteComponent() {
    const features = [
        {
            icon: <Zap className="text-yellow-400" />,
            title: '极速运行 (Bun)',
            description: '使用 Bun 替代 Node.js，享受近乎零延迟的开发体验和更快的构建速度。'
        },
        {
            icon: <Rocket className="text-blue-400" />,
            title: '类型安全 (TanStack)',
            description: '全链路类型检查，从路由到数据请求，消灭运行时错误。'
        },
        {
            icon: <Cpu className="text-purple-400" />,
            title: '现代架构',
            description: '基于 Turborepo 的 Monorepo 方案，轻松共享代码与配置。'
        },
        {
            icon: <Shield className="text-green-400" />,
            title: '极简开发',
            description: '内置最佳实践，无需操心 ESLint、Prettier 等琐碎配置。'
        }
    ];

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-20 text-white selection:bg-blue-500/30">
            {/* Background Effects */}
            <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="rgba(56, 189, 248, 0.2)" />
            <div className="bg-grid-white/[0.02] pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            {/* Hero Section */}
            <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 inline-flex items-center rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-sm text-blue-400 backdrop-blur-sm">
                    <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                    Project Template v1.0 现已就绪
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-linear-to-b from-white to-slate-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
                    极简 · 极速 · 极稳
                    <br />
                    <span className="text-blue-500">你的下一代全栈模版</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 max-w-2xl text-lg text-slate-400">
                    专为追求效率的开发者打造。集成 Bun, TanStack, Tailwind V4 和 Turborepo， 让你从零到壹的跨度，只需一个 git clone。
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" className="h-12 gap-2 rounded-xl bg-blue-600 px-8 hover:bg-blue-500">
                        立即开始 <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                        size="lg"
                        type="outline"
                        className="h-12 gap-2 rounded-xl border-slate-700 bg-slate-900/50 px-8 backdrop-blur-sm hover:bg-slate-800">
                        <Github className="h-4 w-4" /> 访问仓库
                    </Button>
                </motion.div>
            </div>
            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative z-10 mt-24 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition-all hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-blue-500/10">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 transition-colors group-hover:bg-slate-700/50">
                            {feature.icon}
                        </div>
                        <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
                    </div>
                ))}
            </motion.div>
            {/* Footer decoration */}
            <div className="absolute right-0 bottom-0 left-0 h-64 bg-slate-950 mask-[linear-gradient(to_top,black,transparent)]" />
        </div>
    );
}

export const Route = createLazyFileRoute('/')({
    component: RouteComponent
});
