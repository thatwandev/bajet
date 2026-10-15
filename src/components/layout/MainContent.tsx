import React from 'react';
interface Props { children: React.ReactNode; }
const MainContent: React.FC<Props> = ({ children }) => (
  <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(79,255,176,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(167,139,250,0.04) 0%, transparent 60%), #000' }}>
    <div className="max-w-7xl mx-auto p-4 sm:p-6">{children}</div>
  </main>
);
export default MainContent;
