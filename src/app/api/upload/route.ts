import { generatePresignedUrl } from '@/lib/utils/upload';
import responseBody from '@/lib/utils/response';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { fileName, fileType } = await request.json();

        const { presignedUrl, publicUrl } = await generatePresignedUrl(fileName, fileType);

        return NextResponse.json(
            responseBody(true, '图片上传成功', {
                data: {
                    uploadUrl: presignedUrl,
                    publicUrl
                }
            })
        );
    } catch (e) {
        return NextResponse.json(responseBody(false, e instanceof Error ? e.message : '图片上传失败'));
    }
}
