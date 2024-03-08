import {HttpMethod, RequestEvent} from "@sveltejs/kit";

type ApiFunction = (params: RequestEvent<Partial<Record<string, string>>, string | null>) => BodyInit | null | undefined

interface APIHandler {
    [key: sting]: {
        [key: HttpMethod]: ApiFunction
    }
}