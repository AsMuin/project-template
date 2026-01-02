import DefaultPending from '@/features/demo/components/DefaultPending';
import useOnMounted from '@/hooks/lifecycle/useOnMounted';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { login, registry, validateAuth } from '@/features/auth/api';
import { logout } from '@/lib/request';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';

export const Route = createFileRoute('/')({
    component: Demo
});

function Demo() {
    useOnMounted(() => {
        setTimeout(() => {
            toast('Hello AsMuin');
        }, 2000);
    });

    const { data, error, isLoading } = useQuery({
        queryKey: ['validateAuth'],
        queryFn: validateAuth.getQueryFn
    });

    console.log(data, error, isLoading);

    function handleRegistry() {
        registry
            .request({
                email: 'test@163.com',
                password: 'test',
                name: 'test'
            })
            .then(() => {
                toast.success('注册成功');
            });
    }

    function handleLogin() {
        login
            .request({
                email: 'test@163.com',
                password: 'test'
            })
            .then(() => {
                toast.success('登录成功');
            });
    }

    // function handleValidateAuth() {
    //     validateAuth().then(() => {
    //         toast.success('验证成功');
    //     });
    // }

    return (
        <div className="grid min-h-screen place-content-center bg-slate-200 text-center text-3xl text-sky-400">
            <div className="flex flex-col gap-8">
                <p className="drop-shadow-md duration-300 hover:scale-125 hover:text-purple-400">🎉🎉Hello AsMuin🎉🎉</p>
                <p className="drop-shadow-md duration-300 hover:scale-125 hover:text-purple-400">There is React Project Template</p>
                <DefaultPending />
                <Button onClick={handleRegistry}>注册</Button>
                <Button type="outline" onClick={handleLogin}>
                    登录
                </Button>
                <Button type="secondary" onClick={logout}>
                    注销
                </Button>
                <p>{error?.message}</p>
            </div>
        </div>
    );
}
