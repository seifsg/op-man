# OP Man

100-day push-up, sit-up and squat challenge that counts your reps with the phone's sensors.

## Install

- **Android:** download `op-man.apk` from the [latest release](https://github.com/seifsg/op-man/releases/latest), open it and allow installs from your browser once.
- **iPhone:** no store build yet. Build it from source on a Mac (below).

## How it counts

| Exercise | Phone | Sensor |
|---|---|---|
| Push-ups | flat on the floor under your face | proximity sensor by the earpiece: near = 1 rep |
| Sit-ups | on your chest or in your hands | accelerometer: torso tilts up, then back |
| Squats | on your chest or held in front of you | accelerometer: body drops, then rises |

Hold still for the 3-2-1, then go. Every rep is spoken and buzzed; -1 / +1 fix a miss. The plan starts at 10 of each on day 1 and reaches 100 on day 100. Everything stays on the phone: no account, no cloud, no camera.

## Run from source

Needs Node 24, plus Android Studio (SDK, JDK 17) for Android or a Mac with Xcode for iPhone.

```bash
cd mobile
npm ci
npm run android
```

Use `npm run ios` on a Mac. Expo Go cannot run it: the proximity sensor is a native module, so `expo run` builds the app. `npm test` runs the rep-counter and plan tests; `npm run web` opens a browser preview of the screens (no sensors there: tap to count).

The landing page lives at the repo root: `npm ci && npm run build` writes `dist/`.

🏭 Built with [AI Software Factory](https://softwarefactory.company/) by Seif
