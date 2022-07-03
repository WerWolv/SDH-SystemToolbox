import {
    definePlugin,
    PanelSection,
    PanelSectionRow,
    ServerAPI,
    staticClasses,
    ToggleField,
} from "decky-frontend-lib";
import { VFC, useState } from "react";
import { FaToolbox } from "react-icons/fa";

import * as backend from "./backend"
 
const Content: VFC<{ server: ServerAPI }> = ({server}) => {
    backend.setServer(server);

    const [sshServerToggleValue, setSshServerToggleState]   = useState<boolean>(false);
    const [cefServerToggleValue, setCefServerToggleState]   = useState<boolean>(false);
    const [largePagesToggleValue, setLargePagesToggleState] = useState<boolean>(false);

    backend.resolvePromise(backend.getSSHServerState(), setSshServerToggleState);
    backend.resolvePromise(backend.getCEFServerState(), setCefServerToggleState);
    backend.resolvePromise(backend.getHugePagesState(), setLargePagesToggleState);

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
