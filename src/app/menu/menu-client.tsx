"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Plus, Minus, CheckCircle2, ArrowLeft, Clock3 } from "lucide-react";
type Item={id:string;name:string;description:string;price:number;station:string};
type Category={id:string;name:string;items:Item[]};
export default function MenuClient({tableNumber,token,validToken,categories}:{tableNumber:number;token:string;validToken:boolean;categories:Category[]}) {
 const [cart,setCart]=useState<Record<string,number>>({});
 const [notes,setNotes]=useState("");
 const [sent,setSent]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);
 const items=categories.flatMap(c=>c.items);
 const count=Object.values(cart).reduce((a,b)=>a+b,0);
 const total=useMemo(()=>items.reduce((sum,i)=>sum+i.price*(cart[i.id]||0),0),[items,cart]);
 function change(id:string,delta:number){setCart(p=>({...p,[id]:Math.max(0,(p[id]||0)+delta)}))}
 async function submit(){if(!count||busy)return;setBusy(true);try{const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tableNumber,token,notes,items:items.filter(i=>cart[i.id]).map(i=>({menuItemId:i.id,quantity:cart[i.id]}))})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Could not place order");setSent(data.id);setCart({});setNotes("");}catch(e){alert(e instanceof Error?e.message:"Order failed");}finally{setBusy(false)}}
 if(!validToken)return <main className="shell"><div className="empty">This QR code is not valid for this table. Please ask a staff member for help.</div></main>;
 return <main className="shell" style={{maxWidth:900}}>
  <header className="topbar"><Link href="/" className="brand" style={{textDecoration:"none",color:"inherit"}}>sage<span>&</span>stone.</Link><span className="pill">Table {tableNumber}</span></header>
  <section className="hero"><div className="eyebrow" style={{color:"#d7f36a"}}>FRESHLY MADE, JUST FOR YOU</div><h1 className="serif">A little moment<br/>to savour.</h1><p>Take a look around our menu. When you're ready, we'll get your order started.</p><div className="pill" style={{marginTop:12}}><Clock3 size={14} style={{marginRight:6}}/> Order at your own pace</div></section>
  {sent&&<div className="toast"><CheckCircle2 size={17} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>Order placed! Your reference is <b>{sent.slice(-6).toUpperCase()}</b>. Staff will confirm it shortly.</div>}
  <div style={{display:"flex",gap:8,overflowX:"auto",padding:"24px 0 18px"}}>{categories.map(c=><a key={c.id} href={`#${c.id}`} className="pill" style={{whiteSpace:"nowrap",textDecoration:"none"}}>{c.name}</a>)}</div>
  {categories.map(c=><section key={c.id} id={c.id} style={{marginBottom:28,scrollMarginTop:16}}><div className="row"><h2 className="section-title serif">{c.name}</h2><span className="muted" style={{fontSize:12}}>{c.items.length} items</span></div><div className="grid">{c.items.map(i=><article key={i.id} className="menu-card"><div className="eyebrow">{i.station==="BAR"?"FROM THE BAR":"FROM THE KITCHEN"}</div><h3>{i.name}</h3><p>{i.description}</p><div className="row" style={{marginTop:"auto"}}><span className="price">{i.price.toFixed(3)} <small style={{fontSize:11}}>TND</small></span><div style={{display:"flex",alignItems:"center",gap:10}}>{cart[i.id]?<><button aria-label="Remove one" className="btn btn-light" style={{padding:8}} onClick={()=>change(i.id,-1)}><Minus size={15}/></button><b>{cart[i.id]}</b></>:null}<button aria-label="Add item" className="btn" style={{padding:9}} onClick={()=>change(i.id,1)}><Plus size={17}/></button></div></div></article>)}</div></section>)}
  <section className="panel" style={{position:"sticky",bottom:12,boxShadow:"0 12px 35px #17231d18"}}><div className="row"><div><div className="eyebrow"><ShoppingBag size={13} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>YOUR ORDER · {count} ITEMS</div><div className="stat">{total.toFixed(3)} <span style={{fontSize:13}}>TND</span></div></div><button className="btn btn-lime" disabled={!count||busy} onClick={submit}>{busy?"Sending…":"Place order"}</button></div>{count>0&&<textarea className="field" style={{marginTop:14,minHeight:58}} placeholder="Any notes for the team? (optional)" value={notes} onChange={e=>setNotes(e.target.value)}/>}</section>
  <div style={{textAlign:"center",padding:25}} className="muted"><Link href={`/menu?table=${tableNumber}&token=${token}`} style={{color:"inherit"}}><ArrowLeft size={13} style={{display:"inline",verticalAlign:"middle"}}/> Refresh menu</Link></div>
 </main>;
}