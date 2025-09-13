'use client';

import { useState, useRef } from 'react';

interface CSVManagerProps {
  currentFilters?: {
    search?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
  };
}

export default function CSVManager({ currentFilters = {} }: CSVManagerProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
    total?: number;
    errors?: Array<{ row: number; errors: string[] }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/buyers/export?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `buyer-leads-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(`Export failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        // Refresh the page to show new data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Import failed. Please try again.'
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const template = [
      'Full Name,Email,Phone,City,Property Type,BHK,Purpose,Min Budget (₹),Max Budget (₹),Timeline,Source,Status,Notes,Tags',
      'John Doe,john@example.com,9876543210,Chandigarh,Apartment,Two,Buy,5000000,8000000,T0_3m,Website,New,Sample lead,urgent',
      'Jane Smith,jane@example.com,9876543211,Mohali,Villa,Three,Buy,10000000,15000000,T3_6m,Referral,Qualified,Premium client,vip'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyer-leads-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        CSV Import/Export
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Export Leads</h4>
          <p className="text-sm text-slate-600">
            Download current filtered leads as CSV file
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </div>
            ) : (
              'Export CSV'
            )}
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Import Leads</h4>
          <p className="text-sm text-slate-600">
            Upload CSV file to import multiple leads
          </p>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={isImporting}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            <button
              onClick={downloadTemplate}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          importResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
              importResult.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {importResult.success ? (
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.message}
              </p>
              {importResult.imported && importResult.total && (
                <p className="text-sm text-green-700 mt-1">
                  Imported {importResult.imported} out of {importResult.total} rows
                </p>
              )}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-800">Errors found:</p>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>
                        Row {error.row}: {error.errors.join(', ')}
                      </li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>... and {importResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
