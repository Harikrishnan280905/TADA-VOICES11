import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { firebaseService } from '../services/firebase';
import { SurveyResponse } from '../types';
import { Search, Filter, Trash2, Download, LogOut, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import ExcelJS from 'exceljs';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [opinionFilter, setOpinionFilter] = useState<string>('all');
  const [designationFilter, setDesignationFilter] = useState<string>('all');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Real-time listener for responses
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToResponses((updatedResponses) => {
      setResponses(updatedResponses);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      await firebaseService.deleteResponse(id);
    } catch (err) {
      console.error('Error deleting response:', err);
    } finally {
      setIsDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Helper to obtain exact human text from response choices as per instructions
  const getExactOpinionContent = (resp: SurveyResponse): string => {
    if (resp.opinion === 'continue_no_changes') {
      return 'UATT 2.0 may be continued without any changes';
    }
    if (resp.opinion === 'staff_not_merged') {
      return 'Only field level staffs of different departments cannot be merged. It will cause confusion in control and implementation.';
    }
    if (resp.opinion === 'old_uatt_continue') {
      return 'Old UATT system may be continued';
    }
    if (resp.opinion === 'changes_needed') {
      if (resp.changesNeeded === 'villages_divided') {
        return 'Villages should be evenly divided.';
      }
      if (resp.changesNeeded === 'transfers_promotions') {
        return 'Transfers / Promotions between AAO / AHO / AAO(AB) should be done.';
      }
      if (resp.changesNeeded === 'other_suggestions') {
        return resp.otherSuggestion || '';
      }
      return 'Changes Needed';
    }
    return '';
  };

  // Filter & Search Logic
  const filteredResponses = responses.filter((resp) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase().trim();
    const exactContent = getExactOpinionContent(resp).toLowerCase();
    const matchesSearch = !query || 
      resp.name.toLowerCase().includes(query) ||
      resp.phoneNumber.includes(query) ||
      resp.block.toLowerCase().includes(query) ||
      resp.district.toLowerCase().includes(query) ||
      resp.headquarters.toLowerCase().includes(query) ||
      (resp.email && resp.email.toLowerCase().includes(query)) ||
      exactContent.includes(query);

    // 2. Opinion Filter matching
    let matchesOpinion = true;
    if (opinionFilter !== 'all') {
      if (opinionFilter === 'changes_needed') {
        matchesOpinion = resp.opinion === 'changes_needed';
      } else if (opinionFilter === 'continue_no_changes') {
        matchesOpinion = resp.opinion === 'continue_no_changes';
      } else if (opinionFilter === 'staff_not_merged') {
        matchesOpinion = resp.opinion === 'staff_not_merged';
      } else if (opinionFilter === 'old_uatt_continue') {
        matchesOpinion = resp.opinion === 'old_uatt_continue';
      }
    }

    // 3. Designation Filter
    const matchesDesignation = designationFilter === 'all' || resp.designation === designationFilter;

    return matchesSearch && matchesOpinion && matchesDesignation;
  });

  // Export to Excel using exceljs
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Survey Responses');

      // Define Columns with exact headings - SUBMISSION DATE AND TIME HAS BEEN REMOVED!
      worksheet.columns = [
        { header: 'Phone Number', key: 'phoneNumber', width: 15 },
        { header: 'Name', key: 'name', width: 22 },
        { header: 'Verified Google Email', key: 'email', width: 26 },
        { header: 'Designation', key: 'designation', width: 15 },
        { header: 'District', key: 'district', width: 20 },
        { header: 'Block Name', key: 'block', width: 18 },
        { header: 'Headquarters', key: 'headquarters', width: 30 },
        { header: 'Number of Villages', key: 'villages', width: 18 },
        { header: 'Distance of farthest village from headquarter (km)', key: 'distance', width: 30 },
        { header: 'Opinion Status / Selected Content', key: 'opinion', width: 55 },
      ];

      // Format Headers with Vibrant Blue theme!
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' } // Royal blue hex ARGB
      };

      // Add actual filtered data (omits createdAt fields!)
      filteredResponses.forEach((resp) => {
        worksheet.addRow({
          phoneNumber: resp.phoneNumber,
          name: resp.name,
          email: resp.email || 'N/A',
          designation: resp.designation,
          district: resp.district,
          block: resp.block,
          headquarters: resp.headquarters,
          villages: resp.villages,
          distance: resp.distance,
          opinion: getExactOpinionContent(resp),
        });
      });

      // Write workbook file to browser
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `UATT_2.0_Opinion_Responses_${new Date().toISOString().split('T')[0]}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export excel sheet:', err);
      alert('Error exporting to excel.');
    }
  };

  const totalResponses = responses.length;
  const aaoCount = responses.filter((r) => r.designation === 'AAO').length;
  const aaoAbCount = responses.filter((r) => r.designation === 'AAO (AB)' || r.designation === 'AAO (AB)').length;
  const ahoCount = responses.filter((r) => r.designation === 'AHO').length;

  return (
    <section id="admin-dashboard-container" className="py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fadeIn text-left text-white">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#061124] border border-emerald-500/20 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 id="dashboard-title" className="text-lg md:text-2xl font-black text-white tracking-tight">
              {t.adminDashboardTitle}
            </h2>
          </div>
          <p className="text-xs text-emerald-400 font-bold tracking-wide mt-1 font-mono">
            UATT 2.0 Welfare Survey Control Engine &bull; Registered counts: {responses.length}
          </p>
        </div>

        {/* Action Panel Buttons */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border border-emerald-500/25 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
            title="Download responses spreadsheet (omits dates)"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportBtn}</span>
          </button>
          
          <button
            id="btn-admin-inner-logout"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-red-950/40 border border-red-500/25 hover:bg-red-900/40 text-red-200 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>

      {/* 4-Column Stat Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
         {/* Card 1: Total */}
        <div className="p-4 bg-[#061124] border border-emerald-500/20 rounded-xl flex items-center gap-3 md:gap-3.5 shadow-md">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Total Responses</p>
            <p className="text-xl md:text-2xl font-black mt-1 font-mono text-white">{totalResponses}</p>
          </div>
        </div>

        {/* Card 2: AAO */}
        <div className="p-4 bg-[#061124] border border-emerald-500/15 rounded-xl flex items-center gap-3 md:gap-3.5 shadow-md">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-450">
            <CheckCircle2 className="w-5 h-5 text-emerald-450" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">AAO</p>
            <p className="text-xl md:text-2xl font-black mt-1 font-mono text-emerald-400">{aaoCount}</p>
          </div>
        </div>

        {/* Card 3: AAO (AB) */}
        <div className="p-4 bg-[#061124] border border-violet-500/15 rounded-xl flex items-center gap-3 md:gap-3.5 shadow-md">
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <CheckCircle2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">AAO (AB)</p>
            <p className="text-xl md:text-2xl font-black mt-1 font-mono text-violet-400">{aaoAbCount}</p>
          </div>
        </div>

        {/* Card 4: AHO */}
        <div className="p-4 bg-[#061124] border border-sky-500/15 rounded-xl flex items-center gap-3 md:gap-3.5 shadow-md">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <CheckCircle2 className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">AHO</p>
            <p className="text-xl md:text-2xl font-black mt-1 font-mono text-sky-400">{ahoCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/40 border border-emerald-500/10 rounded-xl">
        
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/70">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="admin-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="pl-9 w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none transition-all"
          />
        </div>

        {/* Filter Opinion Dropdown */}
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-emerald-500/70 shrink-0" />
          <select
            id="admin-filter-opinion"
            value={opinionFilter}
            onChange={(e) => setOpinionFilter(e.target.value)}
            className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 text-xs py-2.5 px-3 text-white focus:outline-none transition-all"
          >
            <option value="all">-- {t.allOpinions} --</option>
            <option value="continue_no_changes">Continue without changes</option>
            <option value="changes_needed">Changes Needed Only</option>
            <option value="staff_not_merged">Merged Staff Protest</option>
            <option value="old_uatt_continue">Revert to Old UATT Only</option>
          </select>
        </div>

        {/* Filter Designation Dropdown */}
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-emerald-500/70 shrink-0" />
          <select
            id="admin-filter-designation"
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="w-full rounded-md bg-[#030815] border border-slate-850 focus:border-emerald-500 text-xs py-2.5 px-3 text-white focus:outline-none transition-all"
          >
            <option value="all">All Designations</option>
            <option value="AAO">AAO</option>
            <option value="AHO">AHO</option>
            <option value="AAO (AB)">AAO (AB)</option>
          </select>
        </div>

      </div>

      {/* Responses Table: keep headquarters, exact status sentences; omit Category & Suggestion columns */}
      <div className="bg-[#061124] border border-emerald-500/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-wider border-b border-slate-855">
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Verified Google Account</th>
                <th className="py-3.5 px-4">Desig.</th>
                <th className="py-3.5 px-4">District</th>
                <th className="py-3.5 px-4">Block</th>
                <th className="py-3.5 px-4">Headquarters</th>
                <th className="py-3.5 px-4 text-center">Villages</th>
                <th className="py-3.5 px-4 text-center">Dist (KM)</th>
                <th className="py-3.5 px-4">Opinion Status Selection</th>
                <th className="py-3.5 px-4">Submission Date &amp; Time</th>
                <th className="py-3.5 px-4 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/80 text-xs text-slate-300">
              {filteredResponses.length > 0 ? (
                filteredResponses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-4 font-mono select-all text-blue-400">
                      {item.phoneNumber}
                    </td>
                    <td className="py-3 px-4 font-black text-white">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-mono select-all text-xs font-medium text-emerald-400/90 max-w-[170px] truncate" title={item.email || 'N/A'}>
                      {item.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#030815] text-blue-300 border border-blue-500/20">
                        {item.designation}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.district}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {item.block}
                    </td>
                    <td className="py-3 px-4 max-w-[150px] truncate" title={item.headquarters}>
                      {item.headquarters}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {item.villages}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-300">
                      {item.distance}
                    </td>
                    <td className="py-3 px-4 max-w-[320px]" title={getExactOpinionContent(item)}>
                      <div className="text-xs text-slate-100 font-medium line-clamp-2">
                        {getExactOpinionContent(item)}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-blue-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        id={`btn-delete-resp-${item.id}`}
                        onClick={() => setConfirmDeleteId(item.id)}
                        disabled={isDeletingId === item.id}
                        className="p-1.5 rounded-md hover:bg-red-950/35 text-red-400 hover:text-red-350 border border-transparent hover:border-red-500/20 disabled:opacity-40 select-none cursor-pointer transition-colors"
                        title="Delete Response"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-blue-300/45">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-45" />
                      <span>{t.noResponses}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Yes-No Delete Confirmation Dialog */}
      {confirmDeleteId !== null && (
        <div id="delete-confirm-overlay" className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#061124] border border-red-500/30 rounded-2xl shadow-2xl p-6 text-center text-white space-y-4 animate-scaleUp">
            
            <div className="flex justify-center">
              <div className="p-3 bg-red-950/25 border border-red-500/25 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-1.5 text-center">
              <h3 className="text-base md:text-lg font-black text-white tracking-tight">
                Delete Survey Entry?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Are you sure you want to permanently delete the entry submitted by <strong className="text-red-400 font-extrabold">{responses.find(r => r.id === confirmDeleteId)?.name || 'this participant'}</strong>?
              </p>
              <p className="text-[10px] text-slate-400">
                This will instantly update the live count counter and the Excel download data.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-1.5">
              <button
                id="btn-confirm-delete-cancel"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-705 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-lg transition-all border border-slate-700 cursor-pointer"
              >
                No, Keep
              </button>
              <button
                id="btn-confirm-delete-execute"
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_4px_12px_rgba(220,38,38,0.25)] border border-red-400/20 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
