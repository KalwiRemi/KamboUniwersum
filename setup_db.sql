CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(25) PRIMARY KEY,
  channel_id VARCHAR(25),
  channel_url VARCHAR(255),
  webpage_url VARCHAR(255),
  timestamp TIMESTAMP,
  epoch BIGINT,
  upload_date VARCHAR(10),
  duration INTEGER,
  duration_string VARCHAR(10),
  view_count BIGINT,
  live_status VARCHAR(25),
  is_live BOOLEAN,
  was_live BOOLEAN,
  title VARCHAR(255),
  full_title TEXT,
  like_count BIGINT,
  comment_count BIGINT,
  thumbnail VARCHAR(255),
  channel_follower_count BIGINT,
  uploader VARCHAR(255),
  uploader_id VARCHAR(255),
  channel VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS videos_channel_id_idx ON videos (channel_id);
CREATE INDEX IF NOT EXISTS videos_timestamp_idx ON videos (timestamp);
