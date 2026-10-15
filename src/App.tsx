import { useState, useRef, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useFinancialDataContext } from './context/FinancialDataContext';
import Header from './components/layout/Header';
import Sidebar, { type View } from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import MainContent from './components/layout/MainContent';
import KPISummaryBar from './components/common/KPISummaryBar';
import PortfolioView from './views/PortfolioView';
import BudgetView from './views/BudgetView';
import GoalsDebtView from './views/GoalsDebtView';
import NetWorthView from './views/NetWorthView';
import RetirementView from './views/RetirementView';
import { exportAllAsJSON, exportAllAsCSV } from './utils/exportUtils';
import { importJSON, importCSV } from './utils/importUtils';

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    portfolio, budget, savingsGoals, debt, netWorth,
    setPortfolio, setBudget, setSavingsGoals, setDebt, setNetWorth,
    resetToSampleData,
  } = useFinancialDataContext();
  const [activeView, setActiveView] = useState<View>('portfolio');
  const importInputRef = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showBanner = useCallback((type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3500);
  }, []);

  const handleImport = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const ext = file.name.split('.').pop()?.toLowerCase();
    let result;
    if (ext === 'json') {
      result = await importJSON(file);
    } else if (ext === 'csv') {
      result = await importCSV(file);
    } else {
      showBanner('error', 'Unsupported file type. Please upload a .json or .csv file.');
      return;
    }

    if (!result.ok) {
      showBanner('error', result.error);
      return;
    }

    if (result.type === 'json') {
      setPortfolio(result.data.portfolio);
      setBudget(result.data.budget);
      setSavingsGoals(result.data.savingsGoals);
      setDebt(result.data.debt);
      setNetWorth(result.data.netWorth);
      showBanner('success', 'All data imported successfully from JSON.');
    } else {
      switch (result.section) {
        case 'portfolio': setPortfolio(result.data as typeof portfolio); break;
        case 'budget':    setBudget(result.data as typeof budget); break;
        case 'goals':     setSavingsGoals(result.data as typeof savingsGoals); break;
        case 'debt':      setDebt(result.data as typeof debt); break;
        case 'networth':  setNetWorth(result.data as typeof netWorth); break;
      }
      showBanner('success', `${result.section} data imported successfully.`);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    const data = { portfolio, budget, savingsGoals, debt, netWorth };
    if (format === 'json') exportAllAsJSON(data);
    else exportAllAsCSV(data);
  };

  const handleReset = () => {
    if (window.confirm('Reset all data to sample values? This cannot be undone.')) {
      resetToSampleData();
      showBanner('success', 'Data reset to sample values.');
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'portfolio': return <PortfolioView />;
      case 'budget':    return <BudgetView />;
      case 'goals':     return <GoalsDebtView />;
      case 'networth':  return <NetWorthView />;
      case 'retire':    return <RetirementView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-800">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onImport={handleImport}
        onExport={handleExport}
        onReset={handleReset}
      />

      {/* Status banner */}
      {banner && (
        <div className={`px-4 py-2 text-sm text-center font-medium ${
          banner.type === 'success'
            ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
        }`}>
          {banner.type === 'success' ? '✅' : '⚠️'} {banner.message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <MainContent>
          <KPISummaryBar />
          {renderView()}
        </MainContent>
      </div>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />

      <input
        ref={importInputRef}
        type="file"
        accept=".json,.csv"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
}

export default App;
