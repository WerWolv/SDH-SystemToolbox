import subprocess
from contextlib import contextmanager

_refresh_limits_prefix = "export STEAM_DISPLAY_REFRESH_LIMITS="

@contextmanager
def _writable_root():
    """
    Creates a context where the SteamOS system files are writable.

    If the system partition was previously read-only, it will be returned to
    being read-only after this context is exited.

    Note: Requires root to work.
    """
    needs_disable = False
    status = subprocess.Popen(["steamos-readonly", "status"], stdout=subprocess.PIPE).communicate()[0].strip()
    if status != "enabled":
        needs_disable = True
        subprocess.Popen(["steamos-readonly", "disable"]).wait()
    try:
        yield
    finally:
        if needs_disable:
            subprocess.Popen(["steamos-readonly", "enable"]).wait()

class Plugin:

    ### Helperswith context

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

    ### SteamOS GameScope Refresh Rate Override

    async def get_gamescope_refresh_rate_range(self):
        try:
            with open("/usr/bin/gamescope-session", "r") as f:
                for line in f:
                    if line.startswith(_refresh_limits_prefix):
                        refresh_limits = line[len(_refresh_limits_prefix):].strip().split(",")
                        return [int(s) for s in refresh_limits]
        except Exception:
            pass

        return ""

    async def set_gamescope_refresh_rate_range(self, lower, upper):
        gamescope_session_script_lines = None

        # Read the script.
        with open("/usr/bin/gamescope-session", "r") as f:
            gamescope_session_script_lines = f.readlines()

        # Write it back with the modified line.
        with _writable_root():
            with open("/usr/bin/gamescope-session", "w") as f:
                for line in gamescope_session_script_lines:
                    if line.startswith(_refresh_limits_prefix):
                        line = f"{_refresh_limits_prefix}{lower},{upper}\n"
                    f.write(line)

        return await self.get_gamescope_refresh_rate_range()


    ### Main

    async def _main(self):
        pass
