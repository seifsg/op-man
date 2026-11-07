#!/usr/bin/env bash
# Boots an iPhone simulator, installs the built .app, launches it and saves a screenshot.
set -euo pipefail
products=$1 out=$2
mkdir -p "$out"
app=$(ls -d "$products"/*.app | head -1)
udid=$(xcrun simctl list devices available -j | python3 -c 'import json,sys; d=json.load(sys.stdin)["devices"]; print(next(x["udid"] for r in d.values() for x in r if x["name"].startswith("iPhone")))')
xcrun simctl boot "$udid"
xcrun simctl bootstatus "$udid" -b
xcrun simctl ui "$udid" appearance dark
xcrun simctl install "$udid" "$app"
xcrun simctl launch "$udid" dev.seif.opman
sleep 12
xcrun simctl io "$udid" screenshot "$out/home.png"
