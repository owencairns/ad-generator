# Ad Generator Backend

Backend server for AI ad generation.

## Deployment to Google Cloud Run

### Prerequisites

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Install [Docker](https://docs.docker.com/get-docker/)
3. Set up a Google Cloud project
4. Enable the required services:
   ```
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```
5. Set up Firebase service account credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file containing your credentials

### Environment Variables

The application requires these environment variables, which will be securely managed:

**Firebase Credentials:**
- `project_id`: Your Firebase project ID
- `private_key`: Your Firebase service account private key
- `client_email`: Your Firebase service account client email

**API Keys:**
- `GOOGLE_API_KEY`: Your Google API key
- `OPENAI_API_KEY`: Your OpenAI API key

**Application Settings:**
- `NODE_ENV`: Set to 'production' for deployment
- `PORT`: The port to listen on (8080 for Cloud Run)

### Secure Deployment with npm

The deploy script securely stores your credentials in Google Secret Manager:

```bash
# Deploy to the default project (ad-generator-570e6)
npm run deploy:prod

# Deploy to a different project
npm run deploy your-project-id
```

### How It Works

1. Your local `.env` file is read for credentials
2. Sensitive values are stored in Google Secret Manager
3. A service account is created for your Cloud Run service
4. The service account is granted access to the secrets
5. Cloud Run is configured to use these secrets as environment variables

This approach provides enhanced security by:
- Not storing credentials in plain text
- Using IAM permissions to control secret access
- Centralizing credential management in Secret Manager

### Manual Deployment

1. Authenticate with Google Cloud:
   ```
   gcloud auth login
   ```

2. Set your project ID:
   ```
   gcloud config set project YOUR_PROJECT_ID
   ```

3. Build and push the Docker image:
   ```
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ad-generator-backend
   ```

4. Deploy to Cloud Run:
   ```
   gcloud run deploy ad-generator-backend \
     --image gcr.io/YOUR_PROJECT_ID/ad-generator-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Environment Variables

Set these environment variables in the Google Cloud Run console or using the `--set-env-vars` flag:

- `PORT`: Port number (default: 8080)
- Additional environment variables required by your application

### Continuous Deployment

1. Connect your repository to Google Cloud Build
2. Use the provided `cloudbuild.yaml` file for automated builds and deployments

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Run in production mode:
   ```
   npm start
   ``` 