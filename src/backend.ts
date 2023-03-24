import { ServerAPI, ServerResponse } from "decky-frontend-lib"

var server: ServerAPI | undefined = undefined;
type ServerResponsePromise<T> = Promise<ServerResponse<T>>;

export function resolvePromise<T>(promise: ServerResponsePromise<T>, callback: (value: T) => any) {
    (async function () {
        let data = await promise;
        if (data.success)
            callback(data.result);
    })();
}

export function callBackendFunction(promise: Promise<any>) {
    (async function () {
        await promise;
    })();
}

export function setServer(s: ServerAPI) {
    server = s;
}


export function setSSHServerState(state: boolean) : ServerResponsePromise<boolean> {
    return server!.callPluginMethod("set_ssh_server_state", { "state": state });
}

export function getSSHServerState(): ServerResponsePromise<boolean> {
    return server!.callPluginMethod("get_ssh_server_state", {});
}


export function setCEFServerState(state: boolean) : ServerResponsePromise<boolean> {
    return server!.callPluginMethod("set_cef_debugger_forwarder_state", { "state": state });
}

export function getCEFServerState(): ServerResponsePromise<boolean> {
    return server!.callPluginMethod("get_cef_debugger_forwarder_state", {});
}


export function setHugePagesState(state: boolean) : ServerResponsePromise<boolean> {
    return server!.callPluginMethod("set_huge_pages_state", { "state": state });
}

export function getHugePagesState(): ServerResponsePromise<boolean> {
    return server!.callPluginMethod("get_huge_pages_state", {});
}