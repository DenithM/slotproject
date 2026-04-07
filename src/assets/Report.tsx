import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface Report {
  id: string;
  name: string;
  date: string;
  type?: string;
  status?: 'normal' | 'attention' | 'critical';
  doctorName?: string;
  results?: string;
  notes?: string;
  fileUrl?: string;
}

interface ReportProps {
  onNavigateToDashboard?: () => void;
  onNavigateToAppointment?: () => void;
  onNavigateToDoctorList?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToFeedback?: () => void;
  onLogout?: () => void;
}

const Report: React.FC<ReportProps> = ({ onNavigateToDashboard, onNavigateToAppointment, onNavigateToDoctorList, onNavigateToHistory, onNavigateToFeedback, onLogout }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const searchTerm = '';
  const filterType = 'all';
  const filterStatus = 'all';
  const [activeMenuItem, setActiveMenuItem] = useState<string>('reports');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const mockReports: Report[] = [
        {
          id: '1',
          name: 'Glucose',
          date: '02/11/2023',
          type: 'Blood Test',
          status: 'normal',
          doctorName: 'Dr. Sarah Johnson',
          results: '92 mg/dL - Normal range',
          notes: 'Patient glucose levels are within normal range. Continue current diet and exercise routine.'
        },
        {
          id: '2',
          name: 'Blood Count',
          date: '02/11/2023',
          type: 'CBC',
          status: 'normal',
          doctorName: 'Dr. Michael Chen',
          results: 'All parameters normal',
          notes: 'Complete blood count shows all values within normal limits.'
        },
        {
          id: '3',
          name: 'Full Body X-Ray',
          date: '02/11/2023',
          type: 'Imaging',
          status: 'attention',
          doctorName: 'Dr. Emily Davis',
          results: 'Minor inflammation detected',
          notes: 'Slight inflammation observed in lower back region. Recommend follow-up in 3 months.'
        },
        {
          id: '4',
          name: 'Hepatitis Panel',
          date: '02/11/2023',
          type: 'Blood Test',
          status: 'normal',
          doctorName: 'Dr. James Wilson',
          results: 'Negative for all types',
          notes: 'No evidence of hepatitis infection detected.'
        },
        {
          id: '5',
          name: 'Calcium',
          date: '02/11/2023',
          type: 'Blood Test',
          status: 'critical',
          doctorName: 'Dr. Lisa Anderson',
          results: '8.2 mg/dL - Below normal',
          notes: 'Calcium levels below normal range. Patient should increase calcium intake and schedule follow-up.'
        },
        {
          id: '6',
          name: 'Cholesterol Panel',
          date: '01/15/2023',
          type: 'Blood Test',
          status: 'attention',
          doctorName: 'Dr. Robert Taylor',
          results: 'LDL: 145 mg/dL - Elevated',
          notes: 'LDL cholesterol elevated. Recommend dietary changes and consider medication.'
        },
        {
          id: '7',
          name: 'ECG',
          date: '01/10/2023',
          type: 'Cardiac',
          status: 'normal',
          doctorName: 'Dr. Patricia Brown',
          results: 'Normal sinus rhythm',
          notes: 'Electrocardiogram shows normal cardiac function.'
        }
      ];

      setReports(mockReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getReportStatusColor = (status?: string) => {
    switch(status) {
      case 'normal': return 'bg-green-50 border-green-200 text-green-700';
      case 'attention': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch(type) {
      case 'Blood Test': return '🩸';
      case 'CBC': return '🔬';
      case 'Imaging': return '📷';
      case 'Cardiac': return '❤️';
      default: return '📋';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  const handleDownloadAllReports = () => {
    const allReportsContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>All Medical Reports Summary</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; color: #333; }
          .subtitle { font-size: 18px; color: #555; margin-top: 5px; }
          .summary-stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .stat-item { text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
          .stat-label { font-size: 14px; color: #666; }
          .report-summary { margin-bottom: 30px; padding: 15px; border: 1px solid #eee; border-radius: 8px; }
          .report-title { font-size: 20px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
          .label { font-weight: bold; color: #555; width: 100px; display: inline-block; }
          .value { color: #333; }
          .status-normal { color: #28a745; font-weight: bold; }
          .status-attention { color: #ffc107; font-weight: bold; }
          .status-critical { color: #dc3545; font-weight: bold; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
          @media print {
            body { margin: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">All Medical Reports Summary</div>
          <div class="subtitle">Overview of all patient medical test results</div>
        </div>
        
        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-number">${reports.length}</div>
            <div class="stat-label">Total Reports</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${reports.filter(r => r.status === 'normal').length}</div>
            <div class="stat-label">Normal</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${reports.filter(r => r.status === 'attention').length}</div>
            <div class="stat-label">Needs Attention</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${reports.filter(r => r.status === 'critical').length}</div>
            <div class="stat-label">Critical</div>
          </div>
        </div>
        
        ${reports.map(report => `
          <div class="report-summary">
            <div class="report-title">${report.name} (ID: ${report.id})</div>
            <div class="section">
              <span class="label">Date:</span>
              <span class="value">${report.date}</span>
            </div>
            <div class="section">
              <span class="label">Type:</span>
              <span class="value">${report.type || 'N/A'}</span>
            </div>
            <div class="section">
              <span class="label">Status:</span>
              <span class="value status-${report.status || 'normal'}">
                ${report.status === 'normal' ? 'Normal' : 
                  report.status === 'attention' ? 'Needs Attention' : 'Critical'}
              </span>
            </div>
            <div class="section">
              <span class="label">Doctor:</span>
              <span class="value">${report.doctorName || 'N/A'}</span>
            </div>
            ${report.results ? `
            <div class="section">
              <span class="label">Results:</span>
              <span class="value">${report.results}</span>
            </div>
            ` : ''}
            ${report.notes ? `
            <div class="section">
              <span class="label">Notes:</span>
              <span class="value">${report.notes}</span>
            </div>
            ` : ''}
          </div>
        `).join('')}
        
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Create a blob from the HTML content
    const blob = new Blob([allReportsContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `All_Medical_Reports_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Also try to open in new window for printing
    setTimeout(() => {
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.focus();
      }
    }, 100);
  };

  const handleDownloadReport = (report: Report) => {
    // Create a printable HTML content for the report
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Report - ${report.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #333; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #555; width: 120px; display: inline-block; }
          .value { color: #333; }
          .status-normal { color: #28a745; font-weight: bold; }
          .status-attention { color: #ffc107; font-weight: bold; }
          .status-critical { color: #dc3545; font-weight: bold; }
          .results { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .notes { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
          @media print {
            body { margin: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Medical Report</div>
        </div>
        
        <div class="section">
          <span class="label">Report Name:</span>
          <span class="value">${report.name}</span>
        </div>
        
        <div class="section">
          <span class="label">Type:</span>
          <span class="value">${report.type || 'N/A'}</span>
        </div>
        
        <div class="section">
          <span class="label">Date:</span>
          <span class="value">${report.date}</span>
        </div>
        
        <div class="section">
          <span class="label">Status:</span>
          <span class="value status-${report.status || 'normal'}">
            ${report.status === 'normal' ? 'Normal' : 
              report.status === 'attention' ? 'Needs Attention' : 'Critical'}
          </span>
        </div>
        
        <div class="section">
          <span class="label">Doctor:</span>
          <span class="value">${report.doctorName || 'N/A'}</span>
        </div>
        
        <div class="section">
          <span class="label">Report ID:</span>
          <span class="value">${report.id}</span>
        </div>
        
        ${report.results ? `
        <div class="section">
          <div class="label">Results:</div>
          <div class="results">${report.results}</div>
        </div>
        ` : ''}
        
        ${report.notes ? `
        <div class="section">
          <div class="label">Doctor's Notes:</div>
          <div class="notes">${report.notes}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()}
        </div>
        
        <script>
          // Auto-trigger print dialog when page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
          
          // Close window after printing (or if cancelled)
          window.onafterprint = function() {
            window.close();
          };
        </script>
      </body>
      </html>
    `;
    
    // Create a blob from the HTML content
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}_Report_${report.date.replace(/\//g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Also try to open in new window for printing
    setTimeout(() => {
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.focus();
      }
    }, 100);
  };

  const handleShareReport = (report: Report) => {
    // In a real implementation, this would share the report
    alert(`Sharing report: ${report.name}`);
  };

  const handleSidebarClick = (item: string) => {
    setActiveMenuItem(item);
    
    // Handle navigation logic
    switch (item) {
      case 'overview':
        onNavigateToDashboard?.();
        break;
      case 'appointments':
        onNavigateToAppointment?.();
        break;
      case 'doctors':
        onNavigateToDoctorList?.();
        break;
      case 'history':
        onNavigateToHistory?.();
        break;
      case 'feedback':
        onNavigateToFeedback?.();
        break;
      case 'message':
        console.log('Navigate to messages');
        break;
      case 'reports':
        // Already on reports
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'logout':
        onLogout?.();
        break;
      default:
        console.log(`Navigating to: ${item}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Sidebar activeItem={activeMenuItem} onItemClick={handleSidebarClick} />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onNavigateToDashboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Medical Reports</h1>
            <p className="text-gray-600">View and manage your medical test results</p>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleDownloadAllReports}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Download All Reports"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

       
        {/* Reports Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{reports.length}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Reports</h3>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                    ✅
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.status === 'normal').length}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Normal</h3>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                    ⚠️
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {reports.filter(r => r.status === 'attention').length}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Needs Attention</h3>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                    🚨
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {reports.filter(r => r.status === 'critical').length}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Critical</h3>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-800">
                  Reports ({filteredReports.length})
                </h3>
              </div>
              
              {filteredReports.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    📭
                  </div>
                  <p className="text-gray-600 font-medium">No reports found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${
                            report.status === 'normal' ? 'from-green-400 to-green-600' :
                            report.status === 'attention' ? 'from-yellow-400 to-yellow-600' :
                            'from-red-400 to-red-600'
                          } rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                            {getTypeIcon(report.type)}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-semibold text-gray-800">{report.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full border ${getReportStatusColor(report.status)}`}>
                                {report.status === 'normal' ? 'Normal' : 
                                 report.status === 'attention' ? 'Review' : 'Urgent'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600">{report.type}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{report.date}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{report.doctorName}</span>
                            </div>
                            {report.results && (
                              <p className="text-sm text-gray-700 mt-2">{report.results}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadReport(report);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareReport(report);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m9.032 4.026A9.001 9.001 0 012.968 10.326" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${
                      selectedReport.status === 'normal' ? 'from-green-400 to-green-600' :
                      selectedReport.status === 'attention' ? 'from-yellow-400 to-yellow-600' :
                      'from-red-400 to-red-600'
                    } rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                      {getTypeIcon(selectedReport.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedReport.name}</h3>
                      <p className="text-sm text-gray-600">{selectedReport.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
                    <p className="text-gray-800">{selectedReport.date}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    <span className={`px-3 py-1 text-sm rounded-full border ${getReportStatusColor(selectedReport.status)}`}>
                      {selectedReport.status === 'normal' ? 'Normal' : 
                       selectedReport.status === 'attention' ? 'Needs Attention' : 'Critical'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Doctor</h4>
                    <p className="text-gray-800">{selectedReport.doctorName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Report ID</h4>
                    <p className="text-gray-800">{selectedReport.id}</p>
                  </div>
                </div>

                {selectedReport.results && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Results</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800">{selectedReport.results}</p>
                    </div>
                  </div>
                )}

                {selectedReport.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Doctor's Notes</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-gray-800">{selectedReport.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleShareReport(selectedReport)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m9.032 4.026A9.001 9.001 0 012.968 10.326" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Report;
