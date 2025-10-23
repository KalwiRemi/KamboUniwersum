const fs = require('fs');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();

// Configuration - Add multiple channel IDs here
const API_KEY = process.env.YOUTUBE_DATA_V3_API_KEY;
const CHANNEL_IDS = [
  'UCyFrUC936RTrwRjE0tEbZCQ', // popas
];

// Initialize SQLite database
const db = new sqlite3.Database('./youtube_videos.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create table if it doesn't exist (now includes channel_id)
db.run(`
  CREATE TABLE IF NOT EXISTS videos (
    video_id TEXT PRIMARY KEY,
    channel_id TEXT,
    channel_name TEXT,
    title TEXT,
    upload_date TEXT,
    view_count INTEGER,
    last_updated TEXT
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
    process.exit(1);
  }
});

// Function to make HTTPS request
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// Function to get channel info and uploads playlist ID
async function getChannelInfo(channelId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=contentDetails,snippet`;
  const data = await httpsGet(url);
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }
  
  const channel = data.items[0];
  return {
    channelId: channel.id,
    channelName: channel.snippet.title,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads
  };
}

// Function to fetch all videos from uploads playlist
async function fetchPlaylistVideos(playlistId, channelId, channelName, apiKey) {
  const videos = [];
  let nextPageToken = '';
  let pageCount = 0;

  try {
    do {
      pageCount++;
      const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet,contentDetails&maxResults=50${pageTokenParam}`;
      
      console.log(`  Fetching page ${pageCount}...`);
      const playlistData = await httpsGet(url);
      
      // Extract video IDs from this page
      const videoIds = playlistData.items
        .map(item => item.contentDetails.videoId)
        .filter(id => id); // Filter out any undefined IDs
      
      if (videoIds.length > 0) {
        // Fetch detailed statistics for these videos
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(',')}&part=statistics,snippet`;
        const statsData = await httpsGet(statsUrl);
        
        // Combine data
        statsData.items.forEach(video => {
          videos.push({
            videoId: video.id,
            channelId: channelId,
            channelName: channelName,
            title: video.snippet.title,
            uploadDate: video.snippet.publishedAt,
            viewCount: parseInt(video.statistics.viewCount) || 0
          });
        });
      }
      
      console.log(`  Fetched ${videos.length} videos so far...`);
      nextPageToken = playlistData.nextPageToken;
      
      // Small delay to avoid rate limiting
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } while (nextPageToken);
    
    return videos;
  } catch (error) {
    throw new Error(`Error fetching videos: ${error.message}`);
  }
}

// Function to insert videos into database
function insertVideos(videos) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO videos (video_id, channel_id, channel_name, title, upload_date, view_count, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let completed = 0;
    videos.forEach((video) => {
      stmt.run(
        video.videoId,
        video.channelId,
        video.channelName,
        video.title,
        video.uploadDate,
        video.viewCount,
        new Date().toISOString(),
        (err) => {
          if (err) {
            console.error(`Error inserting video ${video.videoId}:`, err.message);
          }
          completed++;
          if (completed === videos.length) {
            stmt.finalize();
            resolve();
          }
        }
      );
    });
  });
}

// Function to process a single channel
async function processChannel(channelId, apiKey) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing channel: ${channelId}`);
    console.log('='.repeat(60));
    
    // Get channel info
    const channelInfo = await getChannelInfo(channelId, apiKey);
    console.log(`Channel Name: ${channelInfo.channelName}`);
    console.log(`Uploads Playlist ID: ${channelInfo.uploadsPlaylistId}\n`);
    
    // Fetch all videos from the uploads playlist
    const videos = await fetchPlaylistVideos(
      channelInfo.uploadsPlaylistId,
      channelInfo.channelId,
      channelInfo.channelName,
      apiKey
    );
    console.log(`\nFound ${videos.length} total videos for ${channelInfo.channelName}`);
    
    // Insert into database
    console.log('Inserting videos into database...');
    await insertVideos(videos);
    console.log(`✓ Successfully saved ${videos.length} videos from ${channelInfo.channelName}`);
    
    return videos.length;
  } catch (error) {
    console.error(`✗ Error processing channel ${channelId}: ${error.message}`);
    return 0;
  }
}

// Function to calculate average daily views per month
function calculateMonthlyAverages() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        channel_id,
        channel_name,
        strftime('%Y-%m', upload_date) as month,
        COUNT(*) as video_count,
        SUM(view_count) as total_views,
        AVG(view_count) as avg_views_per_video
      FROM videos
      WHERE upload_date IS NOT NULL
      GROUP BY channel_id, channel_name, strftime('%Y-%m', upload_date)
      ORDER BY channel_name, month
    `;
    
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Group by channel
      const channelData = {};
      
      rows.forEach(row => {
        if (!channelData[row.channel_id]) {
          channelData[row.channel_id] = {
            channel_id: row.channel_id,
            channel_name: row.channel_name,
            monthly_stats: []
          };
        }
        
        // Calculate days in month for this data
        const [year, month] = row.month.split('-');
        const daysInMonth = new Date(year, month, 0).getDate();
        const avgDailyViews = row.total_views / daysInMonth;
        
        channelData[row.channel_id].monthly_stats.push({
          month: row.month,
          video_count: row.video_count,
          total_views: row.total_views,
          avg_views_per_video: Math.round(row.avg_views_per_video),
          avg_daily_views: Math.round(avgDailyViews),
          days_in_month: daysInMonth
        });
      });
      
      resolve(Object.values(channelData));
    });
  });
}

// Main execution
async function main() {
  try {
    console.log('Starting YouTube Multi-Channel Video Scraper...');
    console.log(`Total channels to process: ${CHANNEL_IDS.length}`);
    
    let totalVideos = 0;
    
    // Process each channel sequentially
    for (let i = 0; i < CHANNEL_IDS.length; i++) {
      const channelId = CHANNEL_IDS[i];
      const videoCount = await processChannel(channelId, API_KEY);
      totalVideos += videoCount;
      
      // Delay between channels to avoid rate limiting
      if (i < CHANNEL_IDS.length - 1) {
        console.log('\nWaiting before next channel...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('ALL CHANNELS PROCESSED');
    console.log('='.repeat(60));
    
    // Display overall statistics
    db.all(`
      SELECT 
        channel_name,
        COUNT(*) as video_count,
        SUM(view_count) as total_views
      FROM videos
      GROUP BY channel_id, channel_name
      ORDER BY video_count DESC
    `, async (err, rows) => {
      if (!err) {
        console.log('\nDatabase Statistics by Channel:');
        console.log('-'.repeat(60));
        rows.forEach(row => {
          console.log(`${row.channel_name}:`);
          console.log(`  Videos: ${row.video_count}`);
          console.log(`  Total Views: ${row.total_views.toLocaleString()}`);
        });
        
        db.get('SELECT COUNT(*) as total, SUM(view_count) as all_views FROM videos', async (err, summary) => {
          if (!err) {
            console.log('-'.repeat(60));
            console.log(`TOTAL VIDEOS: ${summary.total}`);
            console.log(`TOTAL VIEWS: ${summary.all_views.toLocaleString()}`);
          }
          
          // Calculate and export monthly averages
          try {
            console.log('\nCalculating monthly statistics...');
            const monthlyData = await calculateMonthlyAverages();
            
            const outputData = {
              generated_at: new Date().toISOString(),
              total_channels: CHANNEL_IDS.length,
              channels: monthlyData
            };
            
            fs.writeFileSync(
              '../public/monthly_average_views.json',
              JSON.stringify(outputData, null, 2)
            );
            
            console.log('✓ Monthly statistics exported to: monthly_average_views.json');
          } catch (exportErr) {
            console.error('Error exporting monthly data:', exportErr.message);
          }
          
          db.close();
        });
      } else {
        db.close();
      }

      fs.unlinkSync('./youtube_videos.db')
    });
    
  } catch (error) {
    console.error('Fatal Error:', error.message);
    db.close();
    process.exit(1);
  }
}

// Run the program
main();