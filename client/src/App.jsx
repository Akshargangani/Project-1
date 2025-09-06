// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App







import React, { useEffect, useState } from 'react';
import Editor from './components/Editor';
import axios from 'axios';

export default function App(){
  const [code, setCode] = useState('// loading sample...');
  const [output, setOutput] = useState('');
  const [samples, setSamples] = useState({});
  useEffect(()=> {
    axios.get('/api/samples').then(r => {
      setSamples(r.data);
      setCode(Object.values(r.data)[0] || '');
    }).catch(e => {
      setCode('// Load samples failed. Put sample code here.');
    });
  }, []);

  async function run(){
    setOutput('Running...');
    const r = await axios.post('/api/run', { source: code }).catch(e => ({ data: e.response ? e.response.data : { ok:false, error: e.message }}));
    if (r.data && r.data.ok) setOutput(r.data.stdout || '');
    else setOutput('Error: ' + (r.data && r.data.error ? r.data.error : 'Unknown'));
  }

  async function compile(){
    const r = await axios.post('/api/compile', { source: code }).catch(e => ({ data: e.response ? e.response.data : { ok:false, error: e.message }}));
    if (r.data && r.data.ok) alert('Compile OK: AST size '+ r.data.astSize);
    else alert('Compile error: ' + (r.data && r.data.error ? r.data.error : 'Unknown'));
  }

  function loadSample(name){
    setCode(samples[name]);
  }

  return (
    <div style={{display:'flex', height: '100vh'}}>
      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
        <div style={{padding:13, display:'flex', gap:8}}>
          <button onClick={run}>Run</button>
          <button onClick={compile}>Compile</button>
          <a href="/auth/github"><button>Login with GitHub</button></a>
          <select onChange={e=>loadSample(e.target.value)}>
            <option value="">-- Samples --</option>
            {Object.keys(samples).map(k=> <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <Editor code={code} onChange={setCode} />
      </div>
      <div style={{width:400, borderLeft:'1px solid #ddd', padding:30}}>
        <h3>Output</h3>
        <pre style={{whiteSpace:'pre-wrap'}}>{output}</pre>
      </div>
    </div>
  );
}
