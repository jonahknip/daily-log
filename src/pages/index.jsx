import Layout from "./Layout.jsx";

import LogEntry from "./LogEntry";

import Dashboard from "./Dashboard";

import Reports from "./Reports";

import TemplateSetup from "./TemplateSetup";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    LogEntry: LogEntry,
    
    Dashboard: Dashboard,
    
    Reports: Reports,
    
    TemplateSetup: TemplateSetup,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<LogEntry />} />
                
                
                <Route path="/LogEntry" element={<LogEntry />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/TemplateSetup" element={<TemplateSetup />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}