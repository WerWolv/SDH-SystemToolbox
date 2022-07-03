import subprocess

class Plugin:

    ### Helpers

    def _get_service_state(self, service):
        return subprocess.Popen(f"systemctl is-active {service}", stdout=subprocess.PIPE, shell=True).communicate()[0] == b'active\n'

    def _set_service_state(self, service, state):
        if state:
            subprocess.Popen(f"systemctl enable --now {service}", stdout=subprocess.PIPE, shell=True).wait()
        else:
            subprocess.Popen(f"systemctl disable --now {service}", stdout=subprocess.PIPE, shell=True).wait()

        return self._get_service_state(self, service)


    ### SSH Server

    async def get_ssh_server_state(self):
        return self._get_service_state(self, "sshd")

    async def set_ssh_server_state(self, state):
        return self._set_service_state(self, "sshd", state)


    ### CEF Debugging Forwarding

    async def get_cef_debugger_forwarder_state(self):
        return self._get_service_state(self, "steam-web-debug-portforward")

    async def set_cef_debugger_forwarder_state(self, state):
        return self._set_service_state(self, "steam-web-debug-portforward", state)


    ### Linux Huge Pages

    async def get_huge_pages_state(self):
        with open("/sys/kernel/mm/transparent_hugepage/enabled", "r") as f:
            return f.read().strip().startswith("[always]")

    async def set_huge_pages_state(self, state):
        if state:
            with open("/sys/kernel/mm/transparent_hugepage/enabled", "w") as f:
                f.write("always")
        else:
            with open("/sys/kernel/mm/transparent_hugepage/enabled", "w") as f:
                f.write("madvise")

        return await self.get_huge_pages_state(self)


    ### Main

    async def _main(self):
        pass
