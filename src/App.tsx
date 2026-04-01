function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Knowledge Repository</h1>
          <nav>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4">
              Login
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to the Repository</h2>
          <p className="text-gray-600 mb-6">
            The database integration and content modules will appear here.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-medium text-lg mb-1">Module 1</h3>
              <p className="text-sm text-gray-500">Placeholder for syllabus data.</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-medium text-lg mb-1">Module 2</h3>
              <p className="text-sm text-gray-500">Placeholder for syllabus data.</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-medium text-lg mb-1">Module 3</h3>
              <p className="text-sm text-gray-500">Placeholder for syllabus data.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App;
