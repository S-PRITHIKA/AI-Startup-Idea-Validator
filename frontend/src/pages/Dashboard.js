import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import HomePage from './HomePage';
import ResultsPage from './ResultsPage';
import HistoryPage from './HistoryPage';
import ComparePage from './ComparePage';
import CoFounderPage from './CoFounderPage';
import WhatIfPage from './WhatIfPage';
import ResourcesPage from './ResourcesPage';
import TimelinePage from './TimelinePage';
import ProfilePage from './ProfilePage';
import InvestorReportPage from './InvestorReportPage';
import ExecutionBlueprintPage from './ExecutionBlueprintPage';
import CompetitorGapPage from './CompetitorGapPage';

export default function Dashboard() {
  const [page, setPage] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = (p, data) => {
    setPage(p);
    if (data) setResult(data);
  };

  const activeIdeaId = result?._id || null;

  const renderPage = () => {
    switch (page) {
      case 'home':            return <HomePage onResult={(r) => navigate('results', r)} />;
      case 'results':         return result ? <ResultsPage result={result} onBack={() => setPage('home')} onNavigate={navigate} /> : <HomePage onResult={(r) => navigate('results', r)} />;
      case 'history':         return <HistoryPage onViewResult={(r) => navigate('results', r)} />;
      case 'compare':         return <ComparePage />;
      case 'cofounder':       return <CoFounderPage ideaId={activeIdeaId} result={result} onGoValidate={() => setPage('home')} />;
      case 'whatif':          return <WhatIfPage ideaId={activeIdeaId} result={result} onGoValidate={() => setPage('home')} />;
      case 'resources':       return <ResourcesPage result={result} />;
      case 'timeline':        return <TimelinePage result={result} onGoValidate={() => setPage('home')} />;
      case 'profile':         return <ProfilePage />;
      case 'investor-report': return <InvestorReportPage result={result} onGoValidate={() => setPage('home')} />;
      case 'blueprint':       return <ExecutionBlueprintPage result={result} onGoValidate={() => setPage('home')} />;
      case 'competitor-gap':  return <CompetitorGapPage result={result} onGoValidate={() => setPage('home')} />;
      default:                return <HomePage onResult={(r) => navigate('results', r)} />;
    }
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} activeIdeaId={activeIdeaId} />
      <div style={{ flex:1, overflow:'auto', background:'var(--cream)' }}>
        {renderPage()}
      </div>
    </div>
  );
}
