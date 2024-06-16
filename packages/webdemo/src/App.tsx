import { Button } from "@mantine/core";
import "@mantine/core/styles.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";

function App() {
  return (
    <div>
      <ConnectButton />
      <Button variant="filled">Button</Button>
    </div>
  );
}

export default App;
