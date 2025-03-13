import { RequestConstructor } from '.';

const BASEURL = '/demo';

interface GetAlbumParams {
    pageIndex: number;
    pageSize: number;
}

const getAlbumList = RequestConstructor<GetAlbumParams, { test: 'hello' }>({
    method: 'get',
    url: `${BASEURL}/list`
});

export { getAlbumList };
