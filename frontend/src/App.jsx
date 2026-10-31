import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowRight, BriefcaseBusiness, Building2, CheckCircle2,
  ChevronDown, CircleHelp, ClipboardList, FileSpreadsheet, GraduationCap, LayoutDashboard,
  LogOut, Menu, Plus, Search, ShieldCheck, Sparkles, Users, X, Zap, CircleCheck,
  CircleAlert, TrendingUp, Clock3, Filter, LockKeyhole, Mail, Github
} from 'lucide-react'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api, { clearCredentials, setCredentials } from './api'

const DEMO = {
  admin: ['admin@drivesync.local', 'Admin@123'],
  student: ['student@drivesync.local', 'Student@123']
}
const statusSteps = ['APPLIED','SHORTLISTED','SELECTED']
const pretty = s => (s || '').toLowerCase().replaceAll('_',' ').replace(/\b\w/g, c => c.toUpperCase())
const errText = e => e?.response?.data?.message || e?.response?.data?.error || 'Something went wrong. Check that the backend is running.'

export default function App() {
  const [session, setSession] = useState(null)
  const [login, setLogin] = useState({ email: DEMO.student[0], password: DEMO.student[1] })
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState('Overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [drives, setDrives] = useState([])
  const [applications, setApplications] = useState([])
  const [students, setStudents] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [notice, setNotice] = useState(null)
  const [search, setSearch] = useState('')
  const [showDriveForm, setShowDriveForm] = useState(false)
  const [editingDriveId, setEditingDriveId] = useState(null)
  const [selectedDrive, setSelectedDrive] = useState(null)
  const [appAnswers, setAppAnswers] = useState({})
  const [driveForm, setDriveForm] = useState({ company:'', roleTitle:'', description:'', minCgpa:7, maxArrears:0, deadline:'', branches:'IT, CSE', formQuestions:'Why are you interested in this role?\nDescribe a project you built.' })
  const [importResult, setImportResult] = useState(null)

  const admin = session?.role === 'ADMIN'
  const student = session?.role === 'STUDENT'
  const notify = (type, message) => { setNotice({type,message}); window.setTimeout(() => setNotice(null), 4200) }

  async function refresh(me=session) {
    if (!me) return
    const isAdmin = me.role === 'ADMIN'
    try {
      const [d, a] = await Promise.all([
        api.get(isAdmin ? '/drives' : '/drives/eligible'),
        api.get(isAdmin ? '/applications/admin-list' : '/applications/me').catch(() => ({data: []}))
      ])
      setDrives(d.data || [])
      setApplications(a.data || [])
      if (isAdmin) {
        const [s, stats] = await Promise.all([api.get('/students'), api.get('/analytics')])
        setStudents(s.data || []); setAnalytics(stats.data)
      }
    } catch (e) { notify('error', errText(e)) }
  }

  async function signIn(e) {
    e.preventDefault(); setLoading(true); setLoginError('')
    try {
      setCredentials(login.email.trim(), login.password)
      const { data } = await api.get('/auth/me')
      setSession(data); setSection('Overview'); await refresh(data)
    } catch (e) { clearCredentials(); setLoginError('Login failed. Check your email, password, and backend connection.') }
    finally { setLoading(false) }
  }
  function signOut() {
    clearCredentials(); setSession(null); setDrives([]); setApplications([]); setStudents([]); setAnalytics(null); setSection('Overview')
  }
  useEffect(() => { if (session) refresh(session) }, []) // initial mount only

  const nav = admin
    ? [{label:'Workspace',items:[['Overview',LayoutDashboard],['Placement drives',BriefcaseBusiness],['Applicants',ClipboardList]]},{label:'Management',items:[['Students',GraduationCap],['Eligible students',Users],['Rounds & results',ClipboardList],['Notifications',Mail],['Analytics',TrendingUp]]}]
    : [{label:'Student portal',items:[['Overview',LayoutDashboard],['Explore drives',BriefcaseBusiness],['My applications',ClipboardList],['Profile',GraduationCap],['Notifications',Mail]]}]
  const filteredDrives = useMemo(() => drives.filter(d => `${d.company} ${d.roleTitle}`.toLowerCase().includes(search.toLowerCase())), [drives,search])
  const filteredStudents = useMemo(() => students.filter(s => `${s.name} ${s.rollNo} ${s.branch}`.toLowerCase().includes(search.toLowerCase())), [students,search])

  if (!session) return <div className="login-shell">
    <div className="login-left">
      <div className="brand brand-light"><div className="brand-mark"><Zap size={21} fill="currentColor"/></div><span>DriveSync</span></div>
      <div className="login-hero">
        <div className="eyebrow"><Sparkles size={14}/> CAMPUS PLACEMENT, REIMAGINED</div>
        <h1>Your next chapter<br/><span>starts here.</span></h1>
        <p>One connected space for placement drives, eligibility, applications and every milestone that gets you hired.</p>
        <div className="hero-stat-row"><div><strong>01</strong><span>Verified profiles</span></div><div><strong>02</strong><span>Smarter eligibility</span></div><div><strong>03</strong><span>Live progress</span></div></div>
      </div>
      <div className="login-footer">BUILT FOR AMBITIOUS CAMPUSES <span>·</span> DRIVE THE FUTURE</div>
    </div>
    <div className="login-right">
      <form className="login-card" onSubmit={signIn}>
        <div className="mobile-brand brand"><div className="brand-mark"><Zap size={20} fill="currentColor"/></div><span>DriveSync</span></div>
        <div className="welcome-label">WELCOME BACK</div><h2>Sign in to DriveSync</h2><p className="muted">Use your campus account to continue.</p>
        <label className="field-label">Email address</label><div className="input-icon"><Mail size={17}/><input type="email" required value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} placeholder="you@college.edu"/></div>
        <label className="field-label">Password</label><div className="input-icon"><LockKeyhole size={17}/><input type="password" required value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} placeholder="Enter your password"/></div>
        {loginError && <div className="form-error"><CircleAlert size={16}/>{loginError}</div>}
        <button className="btn btn-primary login-submit" disabled={loading}>{loading?'Signing in…':'Sign in securely'} <ArrowRight size={17}/></button>
        <div className="demo-box"><div className="demo-title"><ShieldCheck size={16}/> DEMO ACCESS</div><div className="demo-actions"><button type="button" onClick={()=>setLogin({email:DEMO.student[0],password:DEMO.student[1]})}>Student account</button><button type="button" onClick={()=>setLogin({email:DEMO.admin[0],password:DEMO.admin[1]})}>TPO account</button></div></div>
        <div className="login-security"><ShieldCheck size={15}/> Protected with role-based access</div>
      </form>
    </div>
  </div>

  const activeCount = drives.filter(d=>d.active!==false).length
  const selectedCount = applications.filter(a=>a.status==='SELECTED').length
  const applicationRate = applications.length ? Math.round(selectedCount/applications.length*100) : 0

  async function applyToDrive(drive) {
    try {
      const answers = Object.fromEntries((drive.formQuestions||[]).map(q=>[q,appAnswers[q]||'']))
      await api.post('/applications',{driveId:drive.id,answers})
      notify('success',`Application submitted to ${drive.company}.`); setSelectedDrive(null); setAppAnswers({}); await refresh()
    } catch(e) { notify('error',errText(e)) }
  }
  async function createDrive(e) {
    e.preventDefault()
    try {
      const payload={...driveForm,minCgpa:Number(driveForm.minCgpa),maxArrears:Number(driveForm.maxArrears),deadline:driveForm.deadline||null,branches:driveForm.branches.split(',').map(x=>x.trim().toUpperCase()).filter(Boolean),formQuestions:driveForm.formQuestions.split('\n').map(x=>x.trim()).filter(Boolean),active:true}
      if(editingDriveId) await api.put(`/drives/${editingDriveId}`,payload); else await api.post('/drives',payload)
      notify('success',editingDriveId?'Placement drive updated successfully.':'Placement drive created successfully.'); setEditingDriveId(null); setShowDriveForm(false); setDriveForm({company:'',roleTitle:'',description:'',minCgpa:7,maxArrears:0,deadline:'',branches:'IT, CSE',formQuestions:'Why are you interested in this role?\nDescribe a project you built.'}); await refresh()
    } catch(e) { notify('error',errText(e)) }
  }
  async function updateStatus(id,status) {
    try { await api.put(`/applications/${id}/status`,{status}); notify('success',`Application moved to ${pretty(status)}.`); await refresh() }
    catch(e) { notify('error',errText(e)) }
  }
  async function exportDrive(id) {
    try { const res=await api.get(`/drives/${id}/export`,{responseType:'blob'}); const url=URL.createObjectURL(res.data); const a=document.createElement('a'); a.href=url; a.download=`drivesync-${id}-applicants.xlsx`; a.click(); URL.revokeObjectURL(url) }
    catch(e) { notify('error',errText(e)) }
  }
  async function importFile(e) {
    const file=e.target.files?.[0]; if(!file)return
    const fd=new FormData(); fd.append('file',file)
    try { const {data}=await api.post('/students/import',fd,{headers:{'Content-Type':'multipart/form-data'}}); setImportResult(data); notify('success',`Imported ${data.inserted} student record(s).`); await refresh() }
    catch(e) { notify('error',errText(e)) }
    e.target.value=''
  }

  const currentNav = nav.flatMap(g=>g.items).find(x=>x[0]===section)
  return <div className="app-shell">
    {mobileNav && <div className="mobile-overlay" onClick={()=>setMobileNav(false)} />}
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Zap size={20} fill="currentColor"/></div><span>DriveSync</span><button className="icon-btn close-nav" onClick={()=>setMobileNav(false)}><X size={19}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="role-chip"><span className={`role-dot ${admin?'admin-dot':''}`}/><span>{admin?'TPO / ADMIN':'STUDENT PORTAL'}</span><ChevronDown size={14}/></div>
      <nav className="nav-groups">{nav.map(group=><div key={group.label}><div className="nav-group-title">{group.label}</div>{group.items.map(([label,Icon])=><button key={label} className={`nav-link ${section===label?'active':''}`} onClick={()=>{setSection(label);setMobileNav(false);setSearch('')}}><Icon size={18}/><span>{label}</span>{label==='Applicants'&&admin&&<span className="nav-count">{applications.length}</span>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>Keep your placement journey moving.</p><button onClick={()=>notify('info','Ask your TPO for campus-specific help.')}>Get support <ArrowRight size={14}/></button></div><div className="profile-mini"><div className="avatar">{(session.name||session.email).slice(0,1).toUpperCase()}</div><div className="profile-copy"><strong>{session.name||'Placement Admin'}</strong><span>{session.email}</span></div><button className="icon-btn" title="Sign out" onClick={signOut}><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><div><div className="breadcrumb">DriveSync <span>/</span> {section}</div><h1>{section}</h1></div></div><div className="topbar-actions"><div className="system-status"><span className="pulse-dot"/> System operational</div><div className="top-avatar">{(session.name||session.email).slice(0,1).toUpperCase()}</div></div></header>
      <div className="content-area">
        {notice && <div className={`toast toast-${notice.type}`}><span>{notice.type==='success'?<CircleCheck size={17}/>:<CircleAlert size={17}/>}</span>{notice.message}<button onClick={()=>setNotice(null)}><X size={15}/></button></div>}
        {section==='Overview' && <Overview admin={admin} session={session} drives={drives} applications={applications} students={students} analytics={analytics} onNavigate={setSection} />}
        {section==='Explore drives' && <DriveList drives={filteredDrives} student onApply={d=>{setSelectedDrive(d);setAppAnswers({})}} search={search} setSearch={setSearch}/>}
        {section==='Placement drives' && <><div className="section-toolbar"><div><p className="section-kicker">OPPORTUNITIES</p><h2>Manage placement drives</h2><p className="muted">Create and maintain company opportunities and eligibility rules.</p></div><button className="btn btn-primary" onClick={()=>{setEditingDriveId(null);setDriveForm({company:'',roleTitle:'',description:'',minCgpa:7,maxArrears:0,deadline:'',branches:'IT, CSE',formQuestions:'Why are you interested in this role?\nDescribe a project you built.'});setShowDriveForm(true)}}><Plus size={17}/> Create drive</button></div><DriveList drives={filteredDrives} admin onExport={exportDrive} onView={d=>setSelectedDrive(d)} search={search} setSearch={setSearch}/></>}
        {section==='My applications' && <Applications applications={applications} student />}
        {section==='Profile' && <StudentProfile session={session}/>}
        {section==='Applicants' && <Applicants applications={applications} drives={drives} onStatus={updateStatus} onExport={exportDrive} />}
        {section==='Students' && <Students students={filteredStudents} search={search} setSearch={setSearch} onImport={importFile} importResult={importResult} onMobile={async (id)=>{const value=window.prompt('Mobile number in international format (e.g. +919876543210):');if(value===null)return;try{await api.put(`/students/${id}/mobile`,{mobileNumber:value});notify('success','Mobile number updated.');await refresh()}catch(e){notify('error',errText(e))}}}/>}
        {section==='Eligible students' && <EligibleStudents drives={drives}/>}
        {section==='Rounds & results' && <RoundsManagement drives={drives} applications={applications} notify={notify}/>}
        {section==='Notifications' && (admin ? <NotificationCenter drives={drives} notify={notify}/> : <StudentNotifications/>)}
        {section==='Analytics' && <Analytics analytics={analytics} />}
      </div>
      <footer className="app-footer"><span>© 2026 DriveSync</span><span>PLACEMENT INTELLIGENCE, CONNECTED.</span><span><ShieldCheck size={14}/> Secure workspace</span></footer>
    </main>
    {showDriveForm && <Modal title={editingDriveId?"Edit placement drive":"Create a placement drive"} subtitle="Define the opportunity and screening rules." onClose={()=>setShowDriveForm(false)}><form className="modal-form" onSubmit={createDrive}>
      <div className="form-grid"><div><label>Company name</label><input required value={driveForm.company} onChange={e=>setDriveForm({...driveForm,company:e.target.value})} placeholder="e.g. Acme Technologies"/></div><div><label>Role title</label><input required value={driveForm.roleTitle} onChange={e=>setDriveForm({...driveForm,roleTitle:e.target.value})} placeholder="Graduate Engineer"/></div><div className="span-two"><label>Description</label><textarea rows="2" value={driveForm.description} onChange={e=>setDriveForm({...driveForm,description:e.target.value})} placeholder="A short role overview…"/></div><div><label>Minimum CGPA</label><input type="number" min="0" max="10" step=".1" required value={driveForm.minCgpa} onChange={e=>setDriveForm({...driveForm,minCgpa:e.target.value})}/></div><div><label>Maximum arrears</label><input type="number" min="0" required value={driveForm.maxArrears} onChange={e=>setDriveForm({...driveForm,maxArrears:e.target.value})}/></div><div><label>Application deadline <small>Optional</small></label><input type="datetime-local" value={driveForm.deadline||''} onChange={e=>setDriveForm({...driveForm,deadline:e.target.value})}/></div><div className="span-two"><label>Allowed branches <small>Comma-separated; leave blank for all branches</small></label><input value={driveForm.branches} onChange={e=>setDriveForm({...driveForm,branches:e.target.value})} placeholder="IT, CSE, ECE"/></div><div className="span-two"><label>Company form questions <small>One question per line</small></label><textarea rows="4" value={driveForm.formQuestions} onChange={e=>setDriveForm({...driveForm,formQuestions:e.target.value})}/></div></div><div className="modal-actions"><button type="button" className="btn btn-quiet" onClick={()=>setShowDriveForm(false)}>Cancel</button><button className="btn btn-primary"><Plus size={16}/> {editingDriveId?"Save changes":"Publish drive"}</button></div></form></Modal>}
    {selectedDrive && student && <Modal title={`Apply to ${selectedDrive.company}`} subtitle={selectedDrive.roleTitle} onClose={()=>setSelectedDrive(null)}><div className="apply-summary"><div><span>Minimum CGPA</span><strong>{selectedDrive.minCgpa.toFixed(1)}</strong></div><div><span>Maximum arrears</span><strong>{selectedDrive.maxArrears}</strong></div><div><span>Eligibility</span><strong className="green-text">Verified</strong></div></div><form className="modal-form" onSubmit={e=>{e.preventDefault();applyToDrive(selectedDrive)}}>{(selectedDrive.formQuestions||[]).map((q,i)=><div key={q}><label>{q}</label><textarea required rows="2" value={appAnswers[q]||''} onChange={e=>setAppAnswers({...appAnswers,[q]:e.target.value})} placeholder="Your answer…"/></div>)}<div className="modal-actions"><button type="button" className="btn btn-quiet" onClick={()=>setSelectedDrive(null)}>Cancel</button><button className="btn btn-primary">Submit application <ArrowRight size={16}/></button></div></form></Modal>}
    {selectedDrive && admin && <Modal title={selectedDrive.company} subtitle={selectedDrive.roleTitle} onClose={()=>setSelectedDrive(null)}><div className="drive-detail"><p>{selectedDrive.description}</p><div className="rule-list"><div><span>Minimum CGPA</span><strong>{selectedDrive.minCgpa}</strong></div><div><span>Maximum arrears</span><strong>{selectedDrive.maxArrears}</strong></div><div><span>Allowed branches</span><strong>{selectedDrive.branches?.length?selectedDrive.branches.join(', '):'All branches'}</strong></div><div><span>Applicants</span><strong>{selectedDrive.applicantCount||0}</strong></div></div><h4>Application form questions</h4>{selectedDrive.formQuestions?.map(q=><div className="question-item" key={q}>{q}</div>)}<div className="modal-actions"><button className="btn btn-quiet" onClick={()=>setSelectedDrive(null)}>Close</button><button className="btn btn-quiet" onClick={()=>{setDriveForm({company:selectedDrive.company,roleTitle:selectedDrive.roleTitle,description:selectedDrive.description||'',minCgpa:selectedDrive.minCgpa,maxArrears:selectedDrive.maxArrears,deadline:selectedDrive.deadline?selectedDrive.deadline.slice(0,16):'',branches:(selectedDrive.branches||[]).join(', '),formQuestions:(selectedDrive.formQuestions||[]).join('\n')});setEditingDriveId(selectedDrive.id);setSelectedDrive(null);setShowDriveForm(true)}}>Edit drive</button><button className="btn btn-primary" onClick={()=>{setSection('Applicants');setSelectedDrive(null)}}>View applicants <ArrowRight size={16}/></button></div></div></Modal>}
  </div>
}

function Overview({admin,session,drives,applications,students,analytics,onNavigate}) {
  const statCards = admin ? [
    {label:'Registered students',value:students.length,sub:'Verified student profiles',icon:GraduationCap,tone:'violet'},
    {label:'Active drives',value:drives.filter(d=>d.active!==false).length,sub:'Open opportunities',icon:BriefcaseBusiness,tone:'blue'},
    {label:'Total applications',value:applications.length,sub:'Across placement drives',icon:ClipboardList,tone:'orange'},
    {label:'Students selected',value:analytics?.selected||0,sub:`${analytics?.selectionRate||0}% selection rate`,icon:CheckCircle2,tone:'green'}
  ] : [
    {label:'Available drives',value:drives.filter(d=>d.eligible&& !d.alreadyApplied).length,sub:'Matching your profile',icon:BriefcaseBusiness,tone:'violet'},
    {label:'Applications sent',value:applications.length,sub:'Your placement activity',icon:ClipboardList,tone:'blue'},
    {label:'Shortlisted',value:applications.filter(a=>['SHORTLISTED','APTITUDE','TECHNICAL','HR','SELECTED'].includes(a.status)).length,sub:'Moving forward',icon:TrendingUp,tone:'orange'},
    {label:'Offers received',value:applications.filter(a=>a.status==='SELECTED').length,sub:'You made it!',icon:CheckCircle2,tone:'green'}
  ]
  return <div className="dashboard-view">
    <div className="welcome-banner"><div><div className="eyebrow"><Sparkles size={14}/> YOUR PLACEMENT COMMAND CENTER</div><h2>{admin?'Good to see you, TPO team.':'Ready for your next opportunity?'}</h2><p>{admin?'Every drive, every candidate, every outcome — in one clear view.':`Welcome${session.name?`, ${session.name.split(' ')[0]}`:''}. Discover opportunities tailored to your profile and track each step.`}</p><button className="banner-link" onClick={()=>onNavigate(admin?'Placement drives':'Explore drives')}>{admin?'Manage placement drives':'Explore opportunities'} <ArrowRight size={16}/></button></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-core"><Zap size={34} fill="currentColor"/></div><div className="float-card float-one"><CheckCircle2 size={16}/> Eligibility verified</div><div className="float-card float-two"><TrendingUp size={16}/> Progress, in real time</div></div></div>
    <div className="stats-grid">{statCards.map(s=><div className="stat-card" key={s.label}><div className={`stat-icon ${s.tone}`}><s.icon size={20}/></div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div><div className="stat-sub"><span className="tiny-dot"/> {s.sub}</div></div>)}</div>
    <div className="dashboard-columns"><div className="panel panel-large"><div className="panel-heading"><div><h3>{admin?'Placement drives':'Recommended for you'}</h3><p>{admin?'Keep track of the opportunities currently in motion.':'Roles where your profile matches the requirements.'}</p></div><button className="text-action" onClick={()=>onNavigate(admin?'Placement drives':'Explore drives')}>View all <ArrowRight size={15}/></button></div>
      {drives.slice(0,4).map(d=><div className="opportunity-row" key={d.id}><div className="company-logo">{d.company?.slice(0,1)}</div><div className="opportunity-main"><strong>{d.company}</strong><span>{d.roleTitle}</span><div className="tag-row"><span className="soft-tag">{d.minCgpa}+ CGPA</span><span className="soft-tag">{d.maxArrears} arrears max</span></div></div><div className="opportunity-right">{admin?<><span className="applicant-count"><Users size={14}/>{d.applicantCount||0}</span><button className="round-arrow" onClick={()=>onNavigate('Placement drives')}><ArrowRight size={16}/></button></>:d.eligible?<span className="eligible-pill"><CheckCircle2 size={13}/> Eligible</span>:<span className="not-eligible-pill"><CircleAlert size={13}/> Not eligible</span>}</div></div>)}
      {!drives.length&&<EmptyState icon={BriefcaseBusiness} title="No drives yet" detail="Placement opportunities will appear here."/>}
    </div><div className="panel activity-panel"><div className="panel-heading"><div><h3>{admin?'Placement pulse':'Your journey'}</h3><p>{admin?'A quick snapshot of outcomes.':'Your latest application activity.'}</p></div><div className="pulse-icon"><Activity size={17}/></div></div>
      {admin?<><div className="pulse-number">{analytics?.totalApplications||0}<span> applications</span></div><div className="mini-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={Object.entries(analytics?.byCompany||{}).map(([name,value])=>({name:name.split(' ')[0],value}))}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#edf0f5"/><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10}/><YAxis hide/><Tooltip/><Bar dataKey="value" fill="#6c63ff" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div><div className="pulse-footer"><span><span className="legend-dot purple"/> Applications</span><button onClick={()=>onNavigate('Analytics')}>View analytics <ArrowRight size={14}/></button></div></>:<><div className="journey-steps">{statusSteps.slice(0,4).map((s,i)=><div className={`journey-step ${applications.some(a=>statusSteps.indexOf(a.status)>=i)?'done':''}`} key={s}><div className="journey-node">{applications.some(a=>statusSteps.indexOf(a.status)>=i)?<CheckCircle2 size={15}/>:i+1}</div><div><strong>{pretty(s)}</strong><span>{['Application received','Under consideration','Assessment stage','Technical evaluation'][i]}</span></div></div>)}</div><button className="wide-quiet" onClick={()=>onNavigate('My applications')}>Track applications <ArrowRight size={15}/></button></>}
    </div></div>
    <div className="bottom-note"><div className="note-symbol"><ShieldCheck size={18}/></div><div><strong>{admin?'Fair screening. Clear decisions.':'Your profile. Your progress. Your future.'}</strong><p>{admin?'Eligibility rules are checked on the server, and access is separated by role.':'Your eligibility is calculated from the verified profile on file — not manually entered each time.'}</p></div><Sparkles className="note-spark" size={20}/></div>
  </div>
}

function SearchBar({value,onChange,placeholder='Search…'}) { return <div className="search-box"><Search size={17}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>{value&&<button onClick={()=>onChange('')}><X size={14}/></button>}</div> }

function DriveList({drives,student,admin,onApply,onExport,onView,search,setSearch}) {
  return <div className="list-view"><div className="list-toolbar"><div className="list-intro"><span className="result-count">{drives.length} opportunities</span><span className="muted">· Updated from DriveSync records</span></div><div className="list-tools"><SearchBar value={search} onChange={setSearch} placeholder="Search companies or roles"/><button className="btn btn-quiet filter-button" onClick={()=>setSearch('')}><Filter size={16}/> Clear</button></div></div>
    <div className="drive-grid">{drives.map(d=><article className="drive-card" key={d.id}><div className="drive-card-top"><div className="company-logo big-logo">{d.company?.slice(0,1)}</div><div className="drive-company"><strong>{d.company}</strong><span>{d.roleTitle}</span></div><button className="more-btn" title="View details" onClick={()=>onView?.(d)}><ArrowRight size={17}/></button></div><p className="drive-description">{d.description||'A new opportunity to build your skills and take the next step in your career.'}</p><div className="drive-metrics"><div><span>MIN. CGPA</span><strong>{Number(d.minCgpa).toFixed(1)}</strong></div><div><span>MAX. ARREARS</span><strong>{d.maxArrears}</strong></div><div><span>APPLICANTS</span><strong>{d.applicantCount||0}</strong></div></div>{student&&<div className={`eligibility-box ${d.eligible?'eligible':'ineligible'}`}>{d.eligible?<CheckCircle2 size={16}/>:<CircleAlert size={16}/>}<div><strong>{d.eligible?'You meet the criteria':'Eligibility requirements not met'}</strong>{d.eligible?<span>Verified against your profile</span>:<span>{(d.reasons||[]).join(' · ')}</span>}</div></div>}<div className="drive-card-bottom"><div className="branch-tags">{d.branches?.length?d.branches.slice(0,3).map(b=><span key={b}>{b}</span>):<span>All branches</span>}</div>{student?(d.alreadyApplied?<span className="applied-label"><CheckCircle2 size={15}/> Applied</span>:<button className="btn btn-primary btn-small" disabled={!d.eligible||!d.active} onClick={()=>onApply(d)}>Apply now <ArrowRight size={15}/></button>):<button className="btn btn-quiet btn-small" onClick={()=>onExport?.(d.id)}><ArrowDownToLine size={15}/> Export</button>}</div></article>)}</div>
    {!drives.length&&<EmptyState icon={Search} title="No matching drives" detail="Try a different search term or check back later."/>}
  </div>
}

function Applications({applications,student}) {
 const [rounds,setRounds]=useState({});
 useEffect(()=>{let live=true;Promise.all(applications.map(async app=>{try{const r=await api.get(`/applications/${app.id}/round-results`);return [app.id,r.data]}catch{return [app.id,[]]}})).then(items=>{if(live)setRounds(Object.fromEntries(items))});return()=>{live=false}},[applications]);
 return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">YOUR ACTIVITY</p><h2>Application tracker</h2><p className="muted">Follow every milestone from application to final outcome.</p></div><div className="tracker-total"><strong>{applications.length}</strong><span>total applications</span></div></div>
 {!applications.length?<EmptyState icon={ClipboardList} title="Your story starts with one application" detail="Explore placement drives that match your profile."/>:<div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Company / role</th><th>Applied on</th><th>Current stage</th><th>Round results</th></tr></thead><tbody>{applications.map(app=><tr key={app.id}><td><div className="table-company"><div className="company-logo">{app.drive?.company?.slice(0,1)||'D'}</div><div><strong>{app.drive?.company||`Drive #${app.drive?.id||''}`}</strong><span>{app.drive?.roleTitle||'Placement role'}</span></div></div></td><td>{app.appliedAt?new Date(app.appliedAt).toLocaleDateString():'—'}</td><td><StatusBadge status={app.status}/></td><td>{(rounds[app.id]||[]).map(r=><div key={r.id}>{r.round?.name}: <strong>{r.result}</strong>{r.remarks?` — ${r.remarks}`:''}</div>)}</td></tr>)}</tbody></table></div></div>}
 </div>
}

function Applicants({applications,drives,onStatus,onExport}) {
  const [driveId,setDriveId]=useState('all')
  const [rows,setRows]=useState([])
  const [busy,setBusy]=useState(false)
  useEffect(()=>{let live=true; async function load(){setBusy(true);try{if(driveId==='all'){setRows(applications)}else{const r=await api.get(`/drives/${driveId}/applicants`);if(live)setRows(r.data)}}catch{if(live)setRows([])}finally{if(live)setBusy(false)}}load();return()=>{live=false}},[driveId,applications])
  return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">CANDIDATE PIPELINE</p><h2>Applicants & outcomes</h2><p className="muted">Review responses and move candidates through the selection process.</p></div><div className="select-wrap"><Filter size={16}/><select value={driveId} onChange={e=>setDriveId(e.target.value)}><option value="all">All placement drives</option>{drives.map(d=><option key={d.id} value={d.id}>{d.company} — {d.roleTitle}</option>)}</select></div></div>
    <div className="panel table-panel"><div className="table-topline"><span className="result-count">{rows.length} candidates</span>{driveId!=='all'&&<button className="btn btn-quiet btn-small" onClick={()=>onExport(Number(driveId))}><ArrowDownToLine size={15}/> Export Excel</button>}</div>{busy?<div className="empty-state">Loading applicants…</div>:!rows.length?<EmptyState icon={Users} title="No applicants yet" detail="Applications will show up here when students apply."/>:<div className="table-wrap"><table><thead><tr><th>Student</th><th>Academic profile</th><th>Drive</th><th>Current status</th><th>Form responses</th><th>Update stage</th></tr></thead><tbody>{rows.map(a=><tr key={a.id}><td><div className="table-company"><div className="avatar avatar-small">{a.student?.name?.slice(0,1)||'S'}</div><div><strong>{a.student?.name||'Student'}</strong><span>{a.student?.rollNo||'—'}</span></div></div></td><td><strong>{a.student?.cgpa?.toFixed?.(1)||a.student?.cgpa||'—'} CGPA</strong><span className="table-sub">{a.student?.branch||'—'} · {a.student?.arrears??'—'} arrears</span></td><td><strong>{a.drive?.company||'—'}</strong><span className="table-sub">{a.drive?.roleTitle||''}</span></td><td><StatusBadge status={a.status}/></td><td>{Object.entries(a.answers||{}).map(([q,v])=><div key={q}><strong>{q}:</strong> {v}</div>)}</td><td><select className="status-select" value={a.status} onChange={e=>onStatus(a.id,e.target.value)}>{['APPLIED','SHORTLISTED','SELECTED','REJECTED'].map(s=><option key={s} value={s}>{pretty(s)}</option>)}</select></td></tr>)}</tbody></table></div>}</div>
  </div>
}

function Students({students,search,setSearch,onImport,importResult,onMobile}) {
  return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">VERIFIED RECORDS</p><h2>Student directory</h2><p className="muted">Manage academic profiles used by the eligibility engine.</p></div><label className="btn btn-primary file-button"><FileSpreadsheet size={17}/> Import Excel<input type="file" accept=".xlsx" onChange={onImport}/></label></div>
    {importResult&&<div className="import-result"><strong>Last import: {importResult.inserted} record(s) added</strong>{importResult.errors?.length>0&&<details><summary>{importResult.errors.length} row errors</summary>{importResult.errors.map(e=><p key={e}>{e}</p>)}</details>}<p className="muted">{importResult.message}</p></div>}
    <div className="list-toolbar"><span className="result-count">{students.length} student records</span><SearchBar value={search} onChange={setSearch} placeholder="Search by name, roll number, branch"/></div>
    <div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Student</th><th>Roll number</th><th>Branch</th><th>CGPA</th><th>Arrears</th><th>Email</th><th>Mobile number</th><th>Manage</th></tr></thead><tbody>{students.map(s=><tr key={s.id}><td><div className="table-company"><div className="avatar avatar-small">{s.name?.slice(0,1)}</div><strong>{s.name}</strong></div></td><td>{s.rollNo}</td><td><span className="soft-tag">{s.branch}</span></td><td><strong>{Number(s.cgpa).toFixed(1)}</strong></td><td>{s.arrears===0?<span className="good-number">0</span>:s.arrears}</td><td>{s.email||'—'}</td><td>{s.mobileNumber||'—'}</td><td><button className="btn btn-quiet btn-small" onClick={()=>onMobile(s.id)}>Edit mobile</button></td></tr>)}</tbody></table></div></div>
    <p className="import-hint"><CircleHelp size={15}/> Excel columns: RollNo, Name, Branch, CGPA, Arrears, Email, Mobile Number (optional). Imported students receive temporary password <code>ChangeMe@123</code>.</p>
  </div>
}



function StudentProfile({session}) {
 return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">YOUR CAMPUS PROFILE</p><h2>Student profile</h2><p className="muted">Academic information used by the placement eligibility engine.</p></div></div><div className="panel drive-detail"><div className="rule-list"><div><span>Full name</span><strong>{session.name||'—'}</strong></div><div><span>Roll number</span><strong>{session.rollNo||'—'}</strong></div><div><span>Email</span><strong>{session.email||'—'}</strong></div><div><span>Branch</span><strong>{session.branch||'—'}</strong></div><div><span>CGPA</span><strong>{session.cgpa??'—'}</strong></div><div><span>Arrears</span><strong>{session.arrears??'—'}</strong></div><div><span>Mobile number</span><strong>{session.mobileNumber||'Not added — contact your TPO'}</strong></div></div></div></div>
}
function StudentNotifications() {
 const [items,setItems]=useState([]);
 useEffect(()=>{api.get('/notifications/me').then(r=>setItems(r.data||[])).catch(()=>setItems([]))},[]);
 return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">PLACEMENT UPDATES</p><h2>Notifications</h2><p className="muted">Email and SMS notification activity for your eligible placement drives.</p></div></div><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Channel</th><th>Status</th><th>Details</th><th>Date</th></tr></thead><tbody>{items.map(n=><tr key={n.id}><td>{n.channel}</td><td>{n.status}</td><td>{n.detail}</td><td>{n.createdAt?new Date(n.createdAt).toLocaleString():'—'}</td></tr>)}</tbody></table></div>{!items.length&&<div className="empty-state">No placement notifications recorded yet.</div>}</div></div>
}

function EligibleStudents({drives}) {
 const [driveId,setDriveId]=useState(''),[data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{if(!driveId){setData(null);return}let live=true;api.get(`/applications/drive/${driveId}/eligible`).then(r=>{if(live){setData(r.data);setError('')}}).catch(e=>{if(live){setError(errText(e));setData(null)}});return()=>{live=false}},[driveId]);
 return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">SERVER-SIDE SCREENING</p><h2>Eligible student roster</h2><p className="muted">Backend evaluation of branch, CGPA and arrears.</p></div><div className="select-wrap"><select value={driveId} onChange={e=>setDriveId(e.target.value)}><option value="">Select a placement drive</option>{drives.map(d=><option key={d.id} value={d.id}>{d.company} — {d.roleTitle}</option>)}</select></div></div>
 {error&&<div className="form-error">{error}</div>}{data&&<><div className="stat-card"><div className="stat-label">Eligible students</div><div className="stat-value">{data.eligibleCount}</div><div className="stat-sub">{data.company}</div></div><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Name</th><th>Roll number</th><th>Branch</th><th>CGPA</th><th>Arrears</th><th>Email</th></tr></thead><tbody>{data.eligibleStudents.map(s=><tr key={s.studentId}><td>{s.name}</td><td>{s.rollNo}</td><td>{s.branch}</td><td>{s.cgpa}</td><td>{s.arrears}</td><td>{s.email||'—'}</td></tr>)}</tbody></table></div></div></>}</div>
}

function RoundsManagement({drives,applications,notify}) {
 const [driveId,setDriveId]=useState(''),[rounds,setRounds]=useState([]),[name,setName]=useState(''),[seq,setSeq]=useState(1),[results,setResults]=useState({});
 const load=async()=>{if(!driveId){setRounds([]);setResults({});return}try{const r=await api.get(`/drives/${driveId}/rounds`);setRounds(r.data);const pairs=await Promise.all(r.data.map(async round=>{const res=await api.get(`/rounds/${round.id}/results`);return res.data.map(item=>[`${round.id}-${item.application?.id}`,item.result])}));setResults(Object.fromEntries(pairs.flat()))}catch(e){notify('error',errText(e))}};
 useEffect(()=>{load()},[driveId]);
 const create=async e=>{e.preventDefault();try{await api.post(`/drives/${driveId}/rounds`,{name,sequenceNo:Number(seq)});setName('');setSeq(Number(seq)+1);notify('success','Placement round created.');load()}catch(e){notify('error',errText(e))}};
 const update=async(roundId,applicationId,result)=>{try{await api.post(`/rounds/${roundId}/results`,{applicationId,result});setResults(old=>({...old,[`${roundId}-${applicationId}`]:result}));notify('success','Round result saved.')}catch(e){notify('error',errText(e))}};
 const rows=applications.filter(x=>String(x.drive?.id)===String(driveId));
 return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">SELECTION PIPELINE</p><h2>Placement rounds & results</h2><p className="muted">Create interview rounds and record applicant progress.</p></div><div className="select-wrap"><select value={driveId} onChange={e=>setDriveId(e.target.value)}><option value="">Select a drive</option>{drives.map(d=><option key={d.id} value={d.id}>{d.company} — {d.roleTitle}</option>)}</select></div></div>
 {driveId&&<><form className="modal-form panel" onSubmit={create}><div className="form-grid"><div><label>Round name</label><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Technical interview"/></div><div><label>Sequence</label><input type="number" min="1" value={seq} onChange={e=>setSeq(e.target.value)}/></div></div><button className="btn btn-primary">Add round</button></form>
 <div className="panel table-panel">{rounds.length===0?<div className="empty-state">No rounds configured yet.</div>:rounds.map(r=><div className="table-topline" key={r.id}><strong>{r.sequenceNo}. {r.name}</strong><span className="muted">Round #{r.id}</span></div>)}</div>
 <div className="panel table-panel"><div className="table-topline"><strong>Applicant results</strong><span>{rows.length} applications</span></div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Application status</th>{rounds.map(r=><th key={r.id}>{r.name}</th>)}</tr></thead><tbody>{rows.map(app=><tr key={app.id}><td>{app.student?.name} ({app.student?.rollNo})</td><td><StatusBadge status={app.status}/></td>{rounds.map(r=><td key={r.id}><select className="status-select" value={results[`${r.id}-${app.id}`]||"PENDING"} onChange={e=>update(r.id,app.id,e.target.value)}><option>PENDING</option><option>SHORTLISTED</option><option>SELECTED</option><option>REJECTED</option></select></td>)}</tr>)}</tbody></table></div></div></>}</div>
}

function NotificationCenter({drives,notify}) {
 const [driveId,setDriveId]=useState(''),[logs,setLogs]=useState([]);
 const load=async()=>{if(!driveId){setLogs([]);return}try{const r=await api.get(`/drives/${driveId}/notifications`);setLogs(r.data)}catch(e){notify('error',errText(e))}};
 useEffect(()=>{load()},[driveId]);
 const run=async()=>{try{await api.post(`/drives/${driveId}/notifications/test`);notify('success','Notification workflow completed.');load()}catch(e){notify('error',errText(e))}};
 return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">EMAIL & SMS DELIVERY</p><h2>Notification status</h2><p className="muted">Test mode is enabled by default; no external messages are sent.</p></div><div className="select-wrap"><select value={driveId} onChange={e=>setDriveId(e.target.value)}><option value="">Select a drive</option>{drives.map(d=><option key={d.id} value={d.id}>{d.company}</option>)}</select></div></div>
 {driveId&&<><button className="btn btn-primary" onClick={run}>Run notification workflow</button><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Student ID</th><th>Channel</th><th>Status</th><th>Details</th><th>Created</th></tr></thead><tbody>{logs.map(l=><tr key={l.id}><td>{l.studentId}</td><td>{l.channel}</td><td>{l.status}</td><td>{l.detail}</td><td>{l.createdAt?new Date(l.createdAt).toLocaleString():'—'}</td></tr>)}</tbody></table></div>{!logs.length&&<div className="empty-state">No notification attempts recorded.</div>}</div></>}</div>
}

function Analytics({analytics}) {
  const companyData=Object.entries(analytics?.byCompany||{}).map(([name,value])=>({name,value,selected:analytics?.selectedByCompany?.[name]||0}))
  const branchData=Object.entries(analytics?.byBranch||{}).map(([name,value])=>({name,value,selected:analytics?.selectedByBranch?.[name]||0}))
  return <div className="list-view"><div className="section-toolbar"><div><p className="section-kicker">PLACEMENT INTELLIGENCE</p><h2>Analytics & insights</h2><p className="muted">A clear picture of participation and selection outcomes.</p></div><div className="analytics-icon"><TrendingUp size={21}/></div></div>
    <div className="stats-grid analytics-stats"><div className="stat-card"><div className="stat-icon blue"><ClipboardList size={20}/></div><div className="stat-label">Total applications</div><div className="stat-value">{analytics?.totalApplications||0}</div><div className="stat-sub">All active and past applications</div></div><div className="stat-card"><div className="stat-icon green"><CheckCircle2 size={20}/></div><div className="stat-label">Students selected</div><div className="stat-value">{analytics?.selected||0}</div><div className="stat-sub">Final selection outcomes</div></div><div className="stat-card"><div className="stat-icon violet"><Activity size={20}/></div><div className="stat-label">Selection rate</div><div className="stat-value">{analytics?.selectionRate||0}<small>%</small></div><div className="stat-sub">Selected / total applications</div></div></div>
    <div className="chart-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h3>Applications by company</h3><p>Application volume and selected candidates.</p></div></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={companyData}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#edf0f5"/><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11}/><Tooltip/><Bar dataKey="value" name="Applications" fill="#7770f7" radius={[5,5,0,0]}/><Bar dataKey="selected" name="Selected" fill="#29b58b" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></div><div className="panel chart-panel"><div className="panel-heading"><div><h3>Branch participation</h3><p>Students applying by academic branch.</p></div></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={branchData}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#edf0f5"/><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11}/><Tooltip/><Bar dataKey="value" name="Applications" fill="#5c9af5" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></div></div>
    <div className="panel insight-panel"><div className="insight-mark"><Sparkles size={18}/></div><div><strong>Make every placement count</strong><p>Use company-wise and branch-wise trends to identify high-interest roles and support students who need additional preparation.</p></div></div>
  </div>
}

function StatusBadge({status}) { const tone=status==='SELECTED'?'selected':status==='REJECTED'?'rejected':['SHORTLISTED'].includes(status)?'progress':'applied';return <span className={`status-badge ${tone}`}><span/>{pretty(status)}</span> }
function Progress({status}) { const idx=statusSteps.indexOf(status);const width=status==='REJECTED'?100:Math.max(8,(Math.max(0,idx)+1)/statusSteps.length*100);return <div className="progress-wrap"><div className={`progress-track ${status==='REJECTED'?'progress-rejected':''}`}><span style={{width:`${width}%`}}/></div><small>{status==='REJECTED'?'Closed':`${Math.max(1,idx+1)} of ${statusSteps.length}`}</small></div> }
function EmptyState({icon:Icon,title,detail}) { return <div className="empty-state"><div className="empty-icon"><Icon size={23}/></div><strong>{title}</strong><p>{detail}</p></div> }
function Modal({title,subtitle,onClose,children}) { return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="modal"><header className="modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-btn" onClick={onClose}><X size={20}/></button></header>{children}</section></div> }
