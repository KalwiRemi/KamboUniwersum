#!/usr/bin/env bash

download () {
  yt-dlp "$1" \
    -j \
    --no-download \
    --lazy-playlist \
    --break-on-reject \
    --dateafter today-1week \
    --cookies cookies.txt \
      | jq -r '[.id, .channel_id, .channel_url, .webpage_url, .timestamp, .epoch, .upload_date, .duration, .duration_string, .view_count, .live_status, .is_live, .was_live, .title, .fulltitle, .like_count, .comment_count, .thumbnail, .channel_follower_count, .uploader, .uploader_id, .channel] | @csv' > data.csv
}

sqlite3 ./dist/database.sqlite < setup_db.sql

while read -r url; do
  download "$url"
  ./import.py
done < urls.txt
