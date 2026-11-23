import { useState } from 'react'
import { Home, Plus, CircleHelp, Search, ChevronDown, Upload, FileSpreadsheet, LoaderCircle } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
const API = 'http://localhost:8000'

function Sidebar({ page, setPage }) {
  return <aside className="sidebar"><div className="brand">System name</div><nav>
    <button className={page === 'home' ? 'nav active' : 'nav'} onClick={() => setPage('home')}><Home size={15}/>Home</button>
    <button className={page === 'create' ? 'nav active' : 'nav'} onClick={() => setPage('create')}><Plus size={15}/>Create project</button>
    <button className={page === 'help' ? 'nav active' : 'nav'} onClick={() => setPage('help')}><CircleHelp size={15}/>Help</button>
  </nav><small className="side-note">EDM + Explainable AI</small></aside>
}
function Topbar({ title }) { return <header className="topbar"><h1>{title}</h1><div className="search"><Search size={15}/><input placeholder="Type for search"/></div><div className="actions"><button className="question">?</button><span className="avatar">U</span><ChevronDown size={13}/></div></header> }
function HomePage({ projects, setPage, openProject }) {
  return <section className="content"><div className="intro">This web framework provides automated analysis of educational data, supported by explainable AI. Upload a CSV file to create a project, train a predictive model, and inspect its explanations. <button onClick={() => setPage('help')}>Learn more</button></div>
    <div className="heading"><h2>Recent projects</h2><button className="primary compact" onClick={() => setPage('create')}><Plus size={15}/> New project</button></div>
    {projects.length === 0 ? <div className="empty"><FileSpreadsheet size={30}/><b>No projects yet</b><span>Create a project by uploading a CSV dataset.</span><button className="primary" onClick={() => setPage('create')}>Create project</button></div> : <div className="projects">{projects.map((p,i)=><button className="project" key={i} onClick={() => openProject(p)}><b>{p.filename}</b><span>{p.rows_used} records · target: {p.target_column}</span></button>)}<button className="add" onClick={() => setPage('create')}><Plus size={24}/></button></div>}
  </section>
}
function CreatePage({ onAnalyzed }) {
  const [file,setFile]=useState(null), [target,setTarget]=useState('dropout'), [busy,setBusy]=useState(false), [error,setError]=useState('')
  async function submit(e) { e.preventDefault(); if(!file){setError('Select a CSV file first.');return} setBusy(true);setError('');const body=new FormData();body.append('file',file);body.append('target_column',target);
    try { const res=await fetch(`${API}/analyze`,{method:'POST',body});const data=await res.json();if(!res.ok)throw new Error(data.detail||'Analysis failed');onAnalyzed({...data,filename:file.name}) }
    catch(err){setError(`${err.message}. Confirm that the Python API is running at ${API}.`)} finally{setBusy(false)} }
  return <section className="content narrow"><h2>Create project</h2><p className="muted">Upload an educational dataset in CSV format and select the column to predict.</p><form className="upload-panel" onSubmit={submit}>
    <label className="field-label">Dataset (CSV)</label><label className="dropzone"><Upload size={27}/><b>{file?file.name:'Choose a CSV file'}</b><span>{file?`${(file.size/1024).toFixed(1)} KB`:'Select a file from your computer'}</span><input type="file" accept=".csv,text/csv" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
    <label className="field-label" htmlFor="target">Target column</label><input id="target" className="text-input" value={target} onChange={e=>setTarget(e.target.value)}/><small className="muted">Binary classification only (two target classes).</small>
    {error&&<div className="error">{error}</div>}<button className="primary" disabled={busy}>{busy?<><LoaderCircle className="spin" size={16}/>Analyzing...</>:'Analyze dataset'}</button>
  </form></section>
}
function Metric({label,value}) { return <div className="metric"><span>{label}</span><b>{value==null?'—':`${(value*100).toFixed(1)}%`}</b></div> }
function Chart({data,keyName}) { return <div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{top:5,right:15,left:12,bottom:5}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number"/><YAxis type="category" dataKey="name" width={145} tick={{fontSize:10}}/><Tooltip/><Bar dataKey={keyName} fill="#3979bd" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div> }
function Results({result,back}) { const fi=result.global_feature_importance.map(x=>({name:x.feature,value:x.importance}));const sg=result.shap_global.map(x=>({name:x.feature,value:x.mean_abs_shap}));
  return <section className="content"><button className="back" onClick={back}>← Back to projects</button><div className="result-head"><div><h2>{result.filename}</h2><p className="muted">Target: {result.target_column} · Positive class: {result.positive_class}</p></div><span className="status">Analysis complete</span></div>
    <div className="metrics"><Metric label="Accuracy" value={result.test_metrics.accuracy}/><Metric label="Precision" value={result.test_metrics.precision}/><Metric label="Recall" value={result.test_metrics.recall}/><Metric label="F1-score" value={result.test_metrics.f1}/></div>
    <div className="charts"><div className="panel"><h3>Random Forest feature importance</h3><p className="muted">Impurity-based feature importance.</p><Chart data={fi} keyName="value"/></div><div className="panel"><h3>Global SHAP importance</h3><p className="muted">Mean absolute SHAP value in the test sample.</p><Chart data={sg} keyName="value"/></div></div>
    <div className="panel"><h3>Local SHAP explanation</h3><p className="muted">{result.explanation_note}</p><div className="explanations">{result.local_explanation.map(x=><div className="explain-row" key={x.feature}><span>{x.feature}</span><b className={x.shap_value>=0?'positive':'negative'}>{x.shap_value>0?'+':''}{x.shap_value.toFixed(4)}</b><small>{x.direction==='increases_positive_class'?'Moves toward positive class':x.direction==='decreases_positive_class'?'Moves away from positive class':'No contribution'}</small></div>)}</div></div>
    <p className="disclaimer">Research prototype: predictive associations are not causal effects or definitive student outcomes.</p>
  </section>
}
function HelpPage(){return <section className="content narrow"><h2>Help</h2><div className="panel"><h3>How to use this prototype</h3><ol><li>Prepare a CSV with one row per record and a target column.</li><li>Choose Create project and upload the CSV.</li><li>Enter the target column name (for example, <code>dropout</code>).</li><li>Run the analysis and inspect metrics and SHAP charts.</li></ol><p className="muted">The positive class is the second class in alphabetical order. Confirm that this is the outcome you intend to study.</p></div></section>}
export default function App(){const[page,setPage]=useState('home'),[projects,setProjects]=useState([]),[selected,setSelected]=useState(null);function done(r){setProjects(p=>[r,...p]);setSelected(r);setPage('results')}const title={home:'Home',create:'Create project',help:'Help',results:'Analysis results'}[page];return <div className="app"><Sidebar page={page} setPage={setPage}/><main className="main"><Topbar title={title}/>{page==='home'&&<HomePage projects={projects} setPage={setPage} openProject={r=>{setSelected(r);setPage('results')}}/>}{page==='create'&&<CreatePage onAnalyzed={done}/ >}{page==='help'&&<HelpPage/>}{page==='results'&&selected&&<Results result={selected} back={()=>setPage('home')}/>}</main></div>}
