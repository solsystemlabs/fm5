/**
 * Dev Services Testing Interface
 *
 * Provides UI for testing external services (R2, Email) in development/staging.
 * This route is environment-gated and only accessible in non-production environments.
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc } from '../../lib/api'

export const Route = createFileRoute('/dev/services')({
  component: DevServicesPage,
  beforeLoad: () => {
    // Environment gating: prevent access in production
    if (import.meta.env.PROD && process.env.NODE_ENV === 'production') {
      throw new Error('Dev tools not available in production')
    }
  },
})

function DevServicesPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">External Services Testing</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <StorageTester />
        <EmailTester />
      </div>
    </div>
  )
}

function StorageTester() {
  const [filename, setFilename] = useState('test-file.txt')
  const [content, setContent] = useState('Hello from FM5!')
  const [uploadResult, setUploadResult] = useState<string>('')
  const [testKey, setTestKey] = useState<string>('')
  const [downloadResult, setDownloadResult] = useState<string>('')

  const utils = trpc.useUtils()
  const uploadMutation = trpc.dev.testFileUpload.useMutation()
  const downloadQuery = trpc.dev.testFileDownload.useQuery(
    { key: testKey },
    { enabled: false }
  )
  const listQuery = trpc.dev.listTestFiles.useQuery()
  const deleteMutation = trpc.dev.deleteTestFile.useMutation()

  const handleUpload = async () => {
    try {
      const result = await uploadMutation.mutateAsync({
        filename,
        content,
        contentType: 'text/plain',
      })
      setUploadResult(`✅ Uploaded: ${result.key} (${result.size} bytes)`)
      setTestKey(result.key)
      listQuery.refetch()
    } catch (error: any) {
      setUploadResult(`❌ Error: ${error.message}`)
    }
  }

  const handleDownload = async () => {
    if (!testKey) {
      setDownloadResult('❌ No file key provided')
      return
    }

    try {
      const result = await downloadQuery.refetch()
      if (result.data) {
        setDownloadResult(`✅ Downloaded: ${result.data.content}`)
      }
    } catch (error: any) {
      setDownloadResult(`❌ Error: ${error.message}`)
    }
  }

  const handleDownloadFile = async (key: string) => {
    try {
      const result = await utils.dev.testFileDownload.fetch({ key })
      setDownloadResult(`✅ Downloaded ${key}: ${result.content}`)
    } catch (error: any) {
      setDownloadResult(`❌ Error downloading ${key}: ${error.message}`)
    }
  }

  const handleDelete = async (key: string) => {
    try {
      await deleteMutation.mutateAsync({ key })
      listQuery.refetch()
    } catch (error: any) {
      alert(`Error deleting file: ${error.message}`)
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Storage (R2/MinIO) Tester</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Filename</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
        </button>

        {uploadResult && (
          <div className="bg-gray-100 p-3 rounded text-sm">{uploadResult}</div>
        )}

        <hr className="my-4" />

        <div>
          <label className="block text-sm font-medium mb-2">File Key</label>
          <input
            type="text"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="users/test-user/models/test-model/test-file.txt"
          />
        </div>

        <button
          onClick={handleDownload}
          disabled={downloadQuery.isFetching}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {downloadQuery.isFetching ? 'Downloading...' : 'Download File'}
        </button>

        {downloadResult && (
          <div className="bg-gray-100 p-3 rounded text-sm">{downloadResult}</div>
        )}

        <hr className="my-4" />

        <h3 className="font-semibold">Test Files</h3>
        {listQuery.isLoading && <p>Loading...</p>}
        {listQuery.data && (
          <div className="space-y-2">
            {listQuery.data.files.length === 0 && (
              <p className="text-gray-500 text-sm">No test files found</p>
            )}
            {listQuery.data.files.map((file) => (
              <div
                key={file.key}
                className="flex justify-between items-center bg-gray-50 p-2 rounded"
              >
                <div className="text-sm flex-1">
                  <div className="font-mono">{file.key}</div>
                  <div className="text-gray-500 text-xs">
                    {file.size} bytes • {new Date(file.uploaded).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadFile(file.key)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.key)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmailTester() {
  const [email, setEmail] = useState('test@example.com')
  const [template, setTemplate] = useState<'verification' | 'passwordReset' | 'welcome'>('verification')
  const [userName, setUserName] = useState('Test User')
  const [result, setResult] = useState<string>('')

  const sendMutation = trpc.dev.testEmailSend.useMutation()

  const handleSend = async () => {
    try {
      const emailResult = await sendMutation.mutateAsync({
        to: email,
        template,
        userName,
      })

      if (emailResult.success) {
        setResult(`✅ Email sent successfully! Message ID: ${emailResult.messageId}`)
      } else {
        setResult(`❌ Failed to send email: ${emailResult.error}`)
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Email (Resend) Tester</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="verification">Verification Email</option>
            <option value="passwordReset">Password Reset</option>
            <option value="welcome">Welcome Email</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">User Name (optional)</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sendMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {sendMutation.isPending ? 'Sending...' : 'Send Test Email'}
        </button>

        {result && (
          <div className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
            {result}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
          <p className="font-medium">Note:</p>
          <p className="text-gray-700">
            If RESEND_API_KEY is configured, emails will be sent via Resend API.
            Otherwise, emails are logged to console.
          </p>
        </div>
      </div>
    </div>
  )
}
