import Image from 'next/image';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { cn, uploadFileByUrl } from '@/lib/utils';
import { toast } from '@/hooks/useToast';

interface UploadVideoProps {
    type: 'image' | 'file';
    variant?: 'dark' | 'light';
    placeholder?: string;
    onFileChange: (fileUrl: string | null) => void;
    value: string | null;
}

export default function UploadFile({ onFileChange, placeholder, type, variant, value }: UploadVideoProps) {
    const [fileController, setFileController] = useState({
        uploaded: value ? true : false,
        disabled: false,
        url: value || '',
        name: value ? '已上传文件' : ''
    });
    const styles = {
        button: variant === 'dark' ? 'bg-dark-300' : 'bg-light-600 border-gray-100 border',
        placeholder: variant === 'dark' ? 'text-light-100' : 'text-slate-500',
        text: variant === 'dark' ? 'text-light-200' : 'text-dark-500'
    };

    async function selectFile(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            if (!e.target.files) {
                return;
            }

            const file = e.target.files[0];

            setFileController(prev => ({ ...prev, disabled: true }));
            const publicUrl = await uploadFileByUrl(file);

            if (!publicUrl) {
                throw new Error('文件上传失败');
            }

            setFileController({
                uploaded: true,
                disabled: false,
                name: file.name,
                url: publicUrl
            });

            onFileChange(publicUrl);
        } catch (error) {
            console.error(error);
            toast({
                title: '失败',
                description: error instanceof Error ? error.message : '文件上传失败',
                variant: 'destructive'
            });
            setFileController(prev => ({ ...prev, disabled: false }));
        }
    }

    async function onReset() {
        setFileController({
            uploaded: false,
            disabled: false,
            url: '',
            name: ''
        });
        onFileChange(null);
    }

    useEffect(() => {
        return () => {
            if (fileController.uploaded) {
                URL.revokeObjectURL(fileController.url);
            }
        };
    }, [fileController]);

    return (
        <div>
            <div className={cn('rounded-md p-1.5', fileController.uploaded ? 'border-2 border-green-500 bg-green-100' : styles.button)}>
                <div className="flex items-center justify-center"></div>
                <label className="upload-btn cursor-pointer">
                    <Input
                        type="file"
                        hidden
                        onChange={selectFile}
                        disabled={fileController.disabled}
                        accept={type === 'image' ? 'image/*' : 'video/*'}
                    />
                    {fileController.uploaded ? (
                        <>
                            <svg
                                className="mr-2 h-6 w-6 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium text-green-700">文件上传成功</span>
                        </>
                    ) : (
                        <>
                            {fileController.disabled ? (
                                <>
                                    <div
                                        className={cn(
                                            'h-3 w-3 animate-spin rounded-full border-b-2',
                                            variant === 'dark' ? 'border-white' : 'border-slate-500'
                                        )}
                                        role="status"
                                        aria-label="loading"></div>
                                    <span>上传中...</span>
                                </>
                            ) : (
                                <>
                                    <Image src="/icons/upload.svg" alt="upload" width={20} height={20} className="object-contain" />
                                    <p className={cn('text-base', styles.placeholder)}>{placeholder || '上传文件'}</p>
                                </>
                            )}
                        </>
                    )}
                </label>
            </div>
            {fileController.uploaded && (
                <div className="mx-auto mt-3 flex w-fit flex-wrap items-center gap-2">
                    {type === 'image' && <Image src={fileController.url} alt="upload" width={150} height={100} className="mx-auto grow rounded" />}
                    <div className="mx-auto flex grow-0 justify-center lg:w-full">
                        <p className={cn('text-base', styles.text)}>{fileController.name}</p>
                        <button
                            onClick={onReset}
                            className="ml-2 rounded-full bg-slate-600 p-1 text-white transition-colors hover:bg-red-600"
                            aria-label="Reset">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
