import type {APIHandler} from "../../ambient";

export const Apis:APIHandler = {
    test:{
        GET(){
               return 'hello world'
        }
    }
}