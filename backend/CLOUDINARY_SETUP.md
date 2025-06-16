# Cloudinary Setup Guide

## Step 1: Get Your Cloudinary Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Sign up or log in to your account
3. From the dashboard, copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 2: Update Configuration

Open `backend/config/cloudinaryConfig.js` and replace the placeholder values:

```javascript
export const cloudinaryConfig = {
  cloud_name: 'your_actual_cloud_name',  // Replace this
  api_key: 'your_actual_api_key',        // Replace this
  api_secret: 'your_actual_api_secret'   // Replace this
};
```

## Example:
```javascript
export const cloudinaryConfig = {
  cloud_name: 'mycompany',
  api_key: '123456789012345',
  api_secret: 'abcdefghijklmnopqrstuvwxyz123456'
};
```

## Step 3: Test the Upload

1. Restart your server: `npm run dev`
2. You should see: `✅ Cloudinary credentials found`
3. Test upload with Postman - files should now upload to Cloudinary

## Troubleshooting

- **"Cloudinary credentials missing or invalid"**: Make sure you've updated all three values in the config file
- **"Must supply api_key"**: Check that your credentials are correct and not the placeholder values
- **Upload fails**: Verify your Cloudinary account is active and has upload permissions

## Security Note

This configuration file will be committed to your repository. For production, consider using environment variables or a secure configuration management system. 