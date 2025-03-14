import DefaultPending from '@/components/DefaultPending';
import useOnMounted from '@/hooks/lifecycle/useOnMounted';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { registry, login, validateAuth } from '@/service/api/auth';
import { logout } from '@/service/api';

export const Route = createFileRoute('/')({
    component: Demo
});

function Demo() {
    useOnMounted(() => {
        setTimeout(() => {
            toast('Hello AsMuin');
        }, 2000);
    });

    function handleRegistry() {
        registry({
            email: 'test@163.com',
            password: 'test',
            name: 'test'
        }).then(() => {
            toast.success('注册成功');
        });
    }

    function handleLogin() {
        login({
            email: 'test@163.com',
            password: 'test'
        }).then(() => {
            toast.success('登录成功');
        });
    }

    return (
        <div className="grid min-h-screen place-content-center bg-slate-200 text-center text-3xl text-sky-400">
            <div className="flex flex-col gap-8">
                <p className="drop-shadow-md duration-300 hover:scale-125 hover:text-purple-400">🎉🎉Hello AsMuin🎉🎉</p>
                <p className="drop-shadow-md duration-300 hover:scale-125 hover:text-purple-400">There is React Project Template</p>
                <DefaultPending />
                <button onClick={handleRegistry}>注册</button>
                <button onClick={handleLogin}>登录</button>
                <button onClick={logout}>注销</button>
                <button
                    onClick={() => {
                        validateAuth();
                    }}>
                    验证
                </button>
            </div>
        </div>
    );
}
