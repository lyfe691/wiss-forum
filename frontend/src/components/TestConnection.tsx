import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TestDocument {
  _id: string;
  name: string;
  createdAt: string;
  randomValue: number;
}

export function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [createStatus, setCreateStatus] = useState<string>('');
  const [documents, setDocuments] = useState<TestDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  
  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  // Test the connection to the backend
  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing connection...');
    
    try {
      const response = await axios.get(`${API_URL}/api/test-connection`);
      setConnectionStatus(`Connection successful: ${response.data.message}`);
    } catch (error) {
      setConnectionStatus('Connection failed. Make sure the backend server is running.');
      console.error('Connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a test document in MongoDB
  const createTestDocument = async () => {
    setIsLoading(true);
    setCreateStatus('Creating test document...');
    
    try {
      const response = await axios.post(`${API_URL}/api/create-test-document`);
      setCreateStatus(`Test document created successfully! ID: ${response.data.documentId}`);
      // Refresh documents list after creating a new one
      fetchDocuments();
    } catch (error) {
      setCreateStatus('Failed to create test document. Check the backend console for details.');
      console.error('Error creating document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all test documents from MongoDB
  const fetchDocuments = async () => {
    setIsLoadingDocuments(true);
    
    try {
      const response = await axios.get(`${API_URL}/api/test-documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Backend Connection Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Test API Connection</h2>
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="mb-2"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>
        {connectionStatus && (
          <div className={`mt-2 p-3 rounded ${connectionStatus.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {connectionStatus}
          </div>
        )}
      </div>

      <Separator className="my-6" />
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Create Test Document in MongoDB</h2>
        <Button 
          onClick={createTestDocument} 
          disabled={isLoading}
          variant="outline"
          className="mb-2"
        >
          {isLoading ? 'Creating...' : 'Create Test Document'}
        </Button>
        {createStatus && (
          <div className={`mt-2 p-3 rounded ${createStatus.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            {createStatus}
          </div>
        )}
      </div>

      <Separator className="my-6" />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">3. Test Documents in MongoDB</h2>
        <Button 
          onClick={fetchDocuments} 
          variant="secondary"
          disabled={isLoadingDocuments}
          className="mb-4"
        >
          {isLoadingDocuments ? 'Loading...' : 'Refresh Documents'}
        </Button>
        
        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Random Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc._id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.randomValue}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    {isLoadingDocuments ? 'Loading documents...' : 'No documents found. Create one using the button above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 