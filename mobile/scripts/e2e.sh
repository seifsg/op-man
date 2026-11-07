#!/usr/bin/env bash
# Drives the release APK on an Android emulator: opens screens, injects sensor values, saves screenshots.
set -euo pipefail
apk=$1 out=$2 pkg=dev.seif.opman
mkdir -p "$out"

shot() { sleep "${2:-1}"; adb exec-out screencap -p > "$out/$1.png"; }

adb install -r "$apk"
adb emu sensor status > "$out/sensors.txt" || true
adb shell am start -W -n "$pkg/.MainActivity"
shot home 8

# Push-up sensor: three far → near → far cycles must reach JS.
for _ in 1 2 3; do
  adb emu sensor set proximity 0; sleep 0.7
  adb emu sensor set proximity 10; sleep 0.7
done
shot proximity 1
adb logcat -d -s ReactNativeJS:V > "$out/logcat.txt" || true
