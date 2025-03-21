// pages/receiving/create.js
import { useState, useEffect } from 'react';
import axios from 'axios'; // Or your preferred HTTP client
import getBaseURL  from "@/app/constant/baseurl"

export default function CreateReceipt() {
  const [suppliers, setSuppliers] = useState(null);
  const [supplierId, setSupplierId] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const baseURL = getBaseURL()
  


  useEffect(() => {
    // Fetch suppliers from the backend
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/suppliers`); // Assuming you have this endpoint
        setSuppliers(response.data);
      } catch (err) {
        setError('Failed to load suppliers.');
        console.error(err);
      }
    };

    fetchSuppliers();
  },);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const receiptData = {
        SupplierID: parseInt(supplierId),
        ReceiptDate: receiptDate,
        ReferenceNumber: referenceNumber,
        Notes: notes,
      };

      const response = await axios.post('/api/receiving/receipts', receiptData);

      if (response.status === 201) {
        // Redirect to the page to add line items
        // router.push(`/receiving/${response.data.data.ReceiptID}/edit`);
      } else {
        setError(response.data.message || 'Failed to create receipt.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Receiving Receipt</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">{error}</span>
      </div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="supplierId" className="block text-gray-700 text-sm font-bold mb-2">Supplier</label>
          <select
            id="supplierId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="">Select Supplier</option>
            { suppliers && suppliers.map((supplier) => (
              <option key={supplier.SupplierID} value={supplier.SupplierID}>
                {supplier.CompanyName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="receiptDate" className="block text-gray-700 text-sm font-bold mb-2">Receipt Date</label>
          <input
            type="date"
            id="receiptDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={receiptDate}
            onChange={(e) => setReceiptDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="referenceNumber" className="block text-gray-700 text-sm font-bold mb-2">Reference Number (Optional)</label>
          <input
            type="text"
            id="referenceNumber"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">Notes (Optional)</label>
          <textarea
            id="notes"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Receipt'}
        </button>
      </form>
    </div>
  );
};

