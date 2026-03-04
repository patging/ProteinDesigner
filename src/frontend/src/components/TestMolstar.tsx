import { useLocation } from "react-router-dom";
import { Viewer } from "@e-infra/react-molstar-wrapper";
import type { Protein } from "@e-infra/react-molstar-wrapper";
import "@e-infra/react-molstar-wrapper/style.css";
import { useState, ChangeEvent } from "react";

export function TestMolstar() {
  const location = useLocation();
  const name = location.state?.name;

  const [protein, setProtein] = useState<Protein | undefined>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProtein({ file });
    }
  };

  const modelUrls = {
    pdbId: (url: string) => url, // We just pass the Blob URL directly
  };

  return (
    <div style={{ backgroundColor: "white", fontSize: "20px", color: "black" }}>
      <h1>Testing Molstar Protein Visualizer!</h1>
      <h2>{name}</h2>
      <input type="file" onChange={handleFileChange} accept=".pdb,.cif" />
      {protein && <Viewer proteins={[protein]} height={500} />}
    </div>
  );
}
