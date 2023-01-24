import { useState, useContext, createContext } from "react";

const ScreenFixedProviderContext = createContext();

export function useScreenFixedProvider() {
  return useContext(ScreenFixedProviderContext);
}

export default function ScreenFixedProvider({ children }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const value = { showOverlay, setShowOverlay };

  return (
    <ScreenFixedProviderContext.Provider value={value}>
      {children}
    </ScreenFixedProviderContext.Provider>
  );
}
