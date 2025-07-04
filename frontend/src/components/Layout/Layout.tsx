// O Layout deve ser algo assim:
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;  // Esta linha é importante!
}

function Layout({ children }: LayoutProps) {
  return (
    <div>
      {/* layout content */}
      {children}
    </div>
  );
}

export default Layout;