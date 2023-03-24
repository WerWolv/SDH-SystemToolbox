import {
    definePlugin,
    PanelSection,
    PanelSectionRow,
    ServerAPI,
    staticClasses,
    ToggleField,
} from "decky-frontend-lib";
import { VFC, useState, useEffect } from "react";
import { FaToolbox } from "react-icons/fa";

import * as backend from "./backend"

function RefreshRateOverrideDescription({querying, supported}: {querying: boolean, supported: boolean}) {
    return (
        <div>
            <span>
                Extends the ranges of supported refresh rates.{" "}
            </span>
            {(!querying && !supported) && <span style={{color: "red"}}>
                This is not supported on your OS.
            </span>}
            {(!querying && supported) && <span>
                Requires restart to take effect.
            </span>}
        </div>
    )
}

const Content: VFC<{ server: ServerAPI }> = ({server}) => {
    backend.setServer(server);

    const [sshServerToggleValue, setSshServerToggleState]   = useState<boolean>(false);
    const [cefServerToggleValue, setCefServerToggleState]   = useState<boolean>(false);
    const [largePagesToggleValue, setLargePagesToggleState] = useState<boolean>(false);
    const [refreshRateQuerying, setRefreshRateQuerying]     = useState<boolean>(true);
    const [refreshRateSupported, setRefreshRateSupported]   = useState<boolean>(true);
    const [refreshRateRange, setRefreshRateRange]           = useState<[number,number]|null>(null);

    const refreshRateRangeIsStock = refreshRateRange != null
        && refreshRateRange[0] === 40 && refreshRateRange[1] === 60;

    const handleRefreshRateOverrideResponse = (range: string|[number, number]) => {
        setRefreshRateQuerying(false);
        if (range instanceof Array) {
            setRefreshRateSupported(true);
            setRefreshRateRange(range);
        } else {
            setRefreshRateSupported(false);
        }

    }

    useEffect(() => {
        backend.resolvePromise(backend.getSSHServerState(), setSshServerToggleState);
        backend.resolvePromise(backend.getCEFServerState(), setCefServerToggleState);
        backend.resolvePromise(backend.getHugePagesState(), setLargePagesToggleState);
        backend.resolvePromise(backend.getRefreshRateOverride(), handleRefreshRateOverrideResponse);
    }, []);

    return (
        <PanelSection>
            <PanelSection title="Services">
                <PanelSectionRow>
                    <ToggleField
                        label="Remote Terminal Access"
                        description="Gives access to the Deck over SSH"
                        checked={sshServerToggleValue}
                        onChange={(value: boolean) => {
                            backend.setSSHServerState(value);
                            setSshServerToggleState(value);
                        }}
                    />
                </PanelSectionRow>

                <PanelSectionRow>
                    <ToggleField
                        label="Remote Debugging Access"
                        description="Forwards the Steam CEF debugger"
                        checked={cefServerToggleValue}
                        onChange={(value: boolean) => {
                            backend.setCEFServerState(value);
                            setCefServerToggleState(value);
                        }}
                    />
                </PanelSectionRow>
            </PanelSection>
            <PanelSection title="Settings">
                <PanelSectionRow>
                    <ToggleField
                        label="Linux Huge Pages"
                        description="Enables Kernel Huge Pages support"
                        checked={largePagesToggleValue}
                        onChange={(value: boolean) => {
                            backend.setHugePagesState(value);
                            setLargePagesToggleState(value);
                        }}
                    />
                </PanelSectionRow>

                <PanelSectionRow>
                    <ToggleField
                        label="Steam Deck Refresh Rate Override"
                        description={<RefreshRateOverrideDescription querying={refreshRateQuerying} supported={refreshRateSupported}/>}
                        disabled={!refreshRateSupported || refreshRateQuerying}
                        checked={!refreshRateRangeIsStock}
                        onChange={(value: boolean) => {
                            const valueRange: [number, number] = value ? [30,70] : [40,60];

                            // Pretend we toggled it while we wait for a response.
                            setRefreshRateRange(valueRange);
                            setRefreshRateQuerying(true);

                            // Tell the Python script to update the gamemode-session script.
                            // After that returns, refresh the toggle field.
                            backend.setRefreshRateOverride(...valueRange).then(() => {
                                backend.resolvePromise(backend.getRefreshRateOverride(), handleRefreshRateOverrideResponse);
                            });
                        }}
                    />
                </PanelSectionRow>
            </PanelSection>
        </PanelSection>
    );
};

export default definePlugin((serverApi: ServerAPI) => {
    return {
        title: <div className={staticClasses.Title}>Example Plugin</div>,
        content: <Content server={serverApi} />,
        icon: <FaToolbox />,
        onDismount() {

        },
    };
});
