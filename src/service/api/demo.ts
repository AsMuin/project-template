import { BaseRequest } from '.';

const BASEURL = '/demo';

interface GetAlbumParams {
    pageIndex: number;
    pageSize: number;
}

const getAlbumList = new BaseRequest<GetAlbumParams, { test: 'hello' }>({
    method: 'get',
    url: `${BASEURL}/list`
});

export { getAlbumList };
