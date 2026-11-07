#!/usr/bin/env bash
# Drives the release APK on an Android emulator through every journey: deep links open screens, buttons are
# tapped by their text, sensor values are injected with `adb emu sensor set`, counts are asserted, screens saved.
set -euo pipefail
apk=$1 out=$2 pkg=dev.seif.opman
mkdir -p "$out"

shot() { sleep "${2:-1}"; adb exec-out screencap -p > "$out/$1.png"; }
open() { adb shell am start -W -a android.intent.action.VIEW -d "opman://$1" "$pkg" > /dev/null; }
ui() { adb shell uiautomator dump /sdcard/ui.xml > /dev/null && adb exec-out cat /sdcard/ui.xml; }

# Taps the element showing text $1, found in a UI dump: no hard-coded coordinates.
tap() {
  local b
  b=$(ui | grep -o "text=\"$1\"[^>]*bounds=\"\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]\"" | head -1 \
    | sed 's/.*bounds="\[\([0-9]*\),\([0-9]*\)\]\[\([0-9]*\),\([0-9]*\)\]"/\1 \2 \3 \4/')
  [ -n "$b" ] || { echo "FAIL: no element with text '$1'" >&2; exit 1; }
  set -- $b
  adb shell input tap $(( ($1 + $3) / 2 )) $(( ($2 + $4) / 2 ))
}

# Fails the run unless the screen shows text $1.
expect() { ui | grep -q "text=\"$1\"" || { echo "FAIL: expected '$1' on screen" >&2; shot "fail-$(date +%s)" 0; exit 1; }; echo "ok: $1"; }

accel() { adb emu sensor set acceleration "$1:$2:$3" > /dev/null; }
near() { adb emu sensor set proximity "$1" > /dev/null; }

# Squat profile: phone upright in hand, body goes down then up (0.45 m, 2.5 s), as vertical acceleration on y.
squat() {
  for i in $(seq 0 24); do
    accel 0 "$(awk -v i="$i" 'BEGIN { w = 6.2832 / 2.5; printf "%.3f", 9.81 - 0.225 * w * w * cos(w * i / 10) }')" 0
    sleep 0.1
  done
  accel 0 9.81 0
}

# Sit-up profile: phone flat on the chest tilts from lying (z up) to 80 degrees and back.
situp() {
  for deg in 0 15 30 45 60 75 80 80 75 60 45 30 15 0 0; do
    accel 0 "$(awk -v d="$deg" 'BEGIN { printf "%.3f", 9.81 * sin(d * 3.14159 / 180) }')" \
      "$(awk -v d="$deg" 'BEGIN { printf "%.3f", 9.81 * cos(d * 3.14159 / 180) }')"
    sleep 0.12
  done
}

adb install -r "$apk"
near 10
accel 0 9.81 0
adb shell am start -W -n "$pkg/.MainActivity" > /dev/null
shot home-new 8
expect "DAY 1 / 100"

# Push-ups: phone on the floor, five face-close reps.
open session/pushup
shot pushup-tip 3
tap Start
sleep 6.5
for _ in 1 2 3 4 5; do near 0; sleep 0.6; near 10; sleep 0.8; done
shot pushup-live 1
expect 5

# Sit-ups: lie still for the countdown, then four reps.
accel 0 0 9.81
open session/situp
sleep 3
tap Start
sleep 3.5
for _ in 1 2 3 4; do situp; sleep 0.5; done
shot situp-live 1
expect 4

# Squats: stand still for the countdown, then four reps.
accel 0 9.81 0
open session/squat
sleep 3
tap Start
sleep 3.5
for _ in 1 2 3 4; do squat; sleep 0.4; done
shot squat-live 1
expect 4

# Restart: counts survive a force-stop.
adb shell am force-stop "$pkg"
adb shell am start -W -n "$pkg/.MainActivity" > /dev/null
shot home-restart 6
expect "5 / 10"
expect "4 / 10"

open history
shot history 3
expect "Day 1"
adb logcat -d -s ReactNativeJS:V > "$out/logcat.txt" || true
echo "e2e: all journeys passed"
