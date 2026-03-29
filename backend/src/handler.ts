import serverless from 'serverless-http'
import { app, connectDB } from './index'

let isConnected = false

export const handler = async (event: any, context: any) => {
  // Ensure DB is connected before handling the request
  if (!isConnected) {
    console.log('[Lambda] Connecting to database...')
    await connectDB()
    isConnected = true
  }
  
  const serverlessHandler = serverless(app)
  return await serverlessHandler(event, context)
}
