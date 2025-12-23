import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { uploadDocument, getDocuments, signDocument } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Document {
  _id: string;
  title: string;
  filePath: string;
  status: 'draft' | 'signed';
  uploadedBy: {
    _id: string;
    name: string;
  };
  signedBy: string[];
  createdAt: string;
  fileType: string;
}

export const DocumentsPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchDocuments = async () => {
    try {
      const { data } = await getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', file.name);

    try {
      await uploadDocument(formData);
      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async (id: string) => {
    try {
      await signDocument(id);
      await fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Securely upload and sign legal documents</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Upload New Document</h2>
        </CardHeader>
        <CardBody>
            {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded flex items-center">
                    <AlertCircle size={16} className="mr-2"/> {error}
                </div>
            )}
            <div className="flex items-end gap-4">
                <div className="flex-1">
                    <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                </div>
                <Button 
                    onClick={handleUpload}
                    disabled={!file || isLoading}
                    isLoading={isLoading}
                    leftIcon={<Upload size={16} />}
                >
                    Upload
                </Button>
            </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
        </CardHeader>
        <CardBody>
            <div className="space-y-2">
                {documents.map((doc) => {
                    const isSignedByMe = user && doc.signedBy.includes(user.id);
                    return (
                        <div key={doc._id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                            <div className="p-2 bg-primary-50 rounded-lg mr-4">
                                <FileText size={24} className="text-primary-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                    <a href={`http://localhost:5000${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {doc.title}
                                    </a>
                                </h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    Uploaded by {doc.uploadedBy?.name} • {new Date(doc.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {doc.status === 'signed' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle size={14} className="mr-1" /> Signed
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Draft
                                    </span>
                                )}

                                {!isSignedByMe && (
                                    <Button size="sm" variant="outline" onClick={() => handleSign(doc._id)}>
                                        Sign Document
                                    </Button>
                                )}
                                
                                <a href={`http://localhost:5000${doc.filePath}`} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="ghost" className="p-2">
                                        <Download size={18} />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    );
                })}
                {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No documents found.</div>
                )}
            </div>
        </CardBody>
      </Card>
    </div>
  );
};