import type {StorageConnector} from '../../../../ambient';
import {dev} from '$app/environment';
import {useLocal} from '$lib/server/adapter/cloudflare/dev';
import {all, first, run, setD1} from "$lib/server/adapter/cloudflare/d1";
import {delObj, getObj, setR2, listObj, putObj} from '$lib/server/adapter/cloudflare/r2';

export default (connector: StorageConnector) => {
    console.log('use cloudflare.');
    connector.bucket = {
        init: setR2,
        get: getObj,
        del: delObj,
        put: putObj,
        list: listObj
    };
    connector.db = {
        run: run,
        first: first,
        all: all
    }
    connector.init = async (env) => {
        if (dev) await useLocal();
        else {
            setR2(env?.MY_BUCKET);
            setD1(env?.D1)
        }
    };
};
