'use client'

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-4">
              A global error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
