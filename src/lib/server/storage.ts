import type {StorageConnector} from "../../ambient";
import cloudflareConnector from './adapter/cloudflare'
export const storage:StorageConnector = {
    connect:cb=>{
        cb(storage)
    },
    init(){}
}
storage.connect(cloudflareConnector)
