import subprocess
import os
import sys
import socket
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def run_build(command):
    print(f"\n➡️ Running: {command}")
    result = subprocess.run(
        command,
        shell=True,
        cwd=BASE_DIR
    )
    if result.returncode != 0:
        print(f"❌ Command failed: {command}")
        sys.exit(1)

def run_server_and_print_url():
    print("\n➡️ Starting server...")

    process = subprocess.Popen(
        "cd server && npm start",
        shell=True,
        cwd=BASE_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    ip = get_local_ip()
    port_found = False

    for line in process.stdout:
        print(line, end="")

        # 🔍 extract port from:
        # ✅ Sync-Watch server running on http://localhost:3000
        match = re.search(r"localhost:(\d+)", line)
        if match and not port_found:
            port = match.group(1)
            port_found = True

            print("\n✅ Server accessible on:")
            print(f"🌐 http://{ip}:{port}/")

    process.wait()

if __name__ == "__main__":
    run_build("cd client && npm run build")
    run_server_and_print_url()