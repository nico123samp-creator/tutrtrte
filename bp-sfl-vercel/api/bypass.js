export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};
    const target=String(body.url||'').trim();
    if(!/^https?:\/\//i.test(target)) return res.status(400).json({error:'URL tidak valid'});
    const endpoint=process.env.BYPASS_API_URL;
    if(!endpoint) return res.status(503).json({error:'BYPASS_API_URL belum dikonfigurasi di Vercel'});
    const headers={'content-type':'application/json','user-agent':'BP-SFL-Clone/1.0'};
    if(process.env.BYPASS_API_KEY) headers.authorization=`Bearer ${process.env.BYPASS_API_KEY}`;
    const upstream=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({url:target,apiKey:body.apiKey||undefined})});
    const text=await upstream.text();
    let data;try{data=JSON.parse(text)}catch{data={result:text}};
    if(!upstream.ok)return res.status(upstream.status).json({error:data.error||'Upstream API error'});
    const result=data.result||data.url||data.link||data.destination||data.data?.url;
    if(!result)return res.status(502).json({error:'Respons API tidak memiliki field result/url/link/destination'});
    return res.status(200).json({result});
  }catch(e){return res.status(500).json({error:'Backend error: '+e.message})}
}