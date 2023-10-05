import { ServerAPI } from "decky-frontend-lib"

var server: ServerAPI | undefined = undefined;

export function resolvePromise(promise: Promise<any>, callback: any) {
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


export function setSSHServerState(state: boolean) : Promise<any> {
    return server!.callPluginMethod("set_ssh_server_state", { "state": state });
}

export function getSSHServerState(): Promise<any> {
    return server!.callPluginMethod("get_ssh_server_state", {});
}

export function setAvahiServerState(state: boolean) : Promise<any> {
    return server!.callPluginMethod("set_avahi_server_state", { "state": state });
}

export function getAvahiServerState(): Promise<any> {
    return server!.callPluginMethod("get_avahi_server_state", {});
}


export function setCEFServerState(state: boolean) : Promise<any> {
    return server!.callPluginMethod("set_cef_debugger_forwarder_state", { "state": state });
}

export function getCEFServerState(): Promise<any> {
    return server!.callPluginMethod("get_cef_debugger_forwarder_state", {});
}


export function setHugePagesState(state: boolean) : Promise<any> {
    return server!.callPluginMethod("set_huge_pages_state", { "state": state });
}

export function getHugePagesState(): Promise<any> {
    return server!.callPluginMethod("get_huge_pages_state", {});
}