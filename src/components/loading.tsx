import React from "react";

function Loading() {
  return (
    <div className="dashboard-layout">
      <div className="main-content flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading workspace...
        </div>
      </div>
    </div>
  );
}

export default Loading;
