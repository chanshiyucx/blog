---
title: Rclone Two Way Sync With OneDrive
date: 2026-03-25 11:10:57
tags:
  - Digital/Rclone
---
I wanted to sync a folder from an external hard drive to OneDrive as a backup. But during setup, I realized it's not as straightforward on macOS as I expected.

The OneDrive client on macOS can only sync its own local folder, while the data I want to sync is on an external drive. My first idea was to use a symlink to mount that folder into the OneDrive directory. However, this approach is not supported on macOS (it seems to work on Windows? Microsoft, please support this on Mac).

After some searching with the help of AI, I found an open-source tool called Rclone. It can bypass the limitations of the OneDrive client and sync any folder directly to the cloud. I'll document the setup process here.

## What bisync does

Rclone has a command called `bisync` that keeps two locations in sync:

- Add a file locally, it shows up in the cloud
- Add a file in the cloud, it shows up locally
- Delete a file on either side, it gets deleted on the other

## Install rclone

```bash
brew install rclone
```

## Connect to OneDrive

```bash
rclone config
```

Follow the steps:

1. Type `n` to create a new config
2. Name it `onedrive`
3. Choose `Microsoft OneDrive`
4. Press enter to skip `client_id` and `secret`
5. Choose your account type (personal or business)
6. Log in in the browser when it opens
7. Finish setup

Check if it works:

```bash
rclone lsd onedrive:
```

If you see your folders, it is ready.

## First-time setup

Before running `bisync` for the first time, you need to pass `--resync` to build the initial baseline. This tells rclone to scan both sides and record their current state. Future syncs compare against this snapshot to detect changes.

> If the two sides already have different files, the result might not be what you expect.  
> Run with `--dry-run` first to preview what will happen. Back up anything important before proceeding.

I also recommend using `--check-access`. It requires a file called `RCLONE_TEST` in both folders. If it is missing, the sync will stop. This is a simple safeguard against mistakes like a wrong path or an unmounted drive. Create the files first:

```bash
# Create locally
touch /Users/xin/Documents/SyncTest/RCLONE_TEST

# Create on OneDrive
rclone touch onedrive:SyncTest/RCLONE_TEST
```

Then run the initial sync:

```bash
rclone bisync /Users/xin/Documents/SyncTest onedrive:SyncTest \
  --resync \
  --check-access \
  --recover \
  --resilient \
  --create-empty-src-dirs \
  --max-delete 50 \
  --conflict-resolve newer \
  --verbose \
  --progress
```

Here is what each flag does:

|Flag|What it does|
|---|---|
|`--resync`|Rebuilds the sync baseline. Use on first run or after a corrupted state|
|`--check-access`|Checks for `RCLONE_TEST` on both sides before doing anything|
|`--recover`|Tries to recover from a previous interrupted sync instead of failing|
|`--resilient`|Keeps going if a single file fails, instead of stopping everything|
|`--create-empty-src-dirs`|Syncs empty folder creation and deletion|
|`--max-delete`|Limits how many files can be deleted in one run|
|`--conflict-resolve newer`|Keeps the newer file when both sides changed the same file|
|`--track-renames`|Detects renames instead of treating them as a delete and re-upload|
|`--verbose`|Prints detailed output, useful for debugging|
|`--log-file`|Writes output to a log file|
|`--progress`|Shows live progress while syncing|
|`--dry-run`|Simulates the sync without making any changes|

## Daily sync

After the first run, drop `--resync` and add `--track-renames`:

```bash
rclone bisync /Users/xin/Documents/SyncTest onedrive:SyncTest \
  --check-access \
  --recover \
  --resilient \
  --create-empty-src-dirs \
  --max-delete 50 \
  --conflict-resolve newer \
  --track-renames \
  --log-file=/tmp/rclone-bisync.log \
  --progress
```

## Sync script

Typing that command every time is tedious. I do not need automatic or scheduled syncing, so I wrote a short script to run it manually when I want.

```bash
#!/bin/bash

LOCAL="/Users/xin/Documents/SyncTest"
REMOTE="onedrive:SyncTest"
LOG_FILE="/tmp/rclone-bisync.log"

echo "🔄 Syncing $LOCAL <-> $REMOTE"

rclone bisync "$LOCAL" "$REMOTE" \
  --check-access \
  --recover \
  --resilient \
  --create-empty-src-dirs \
  --max-delete 50 \
  --conflict-resolve newer \
  --track-renames \
  --log-file="$LOG_FILE" \
  --progress

if [ $? -eq 0 ]; then
  echo "✅ Done"
else
  echo "❌ Sync failed. Check the log: $LOG_FILE"
  exit 1
fi
```

Make it executable before running:

```bash
chmod +x sync.sh
```

Just Enjoy it.
