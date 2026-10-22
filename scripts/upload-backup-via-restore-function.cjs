const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto')
const dir=path.resolve('.secrets/supabase-backups/2026-10-22-cases')
async function main(){
 const config=JSON.parse(await fs.readFile(path.join(dir,'temporary-upload-client.json')))
 const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex')
 async function post(index,bytes){
  const response=await fetch(config.url+'?file='+index,{method:'POST',signal:AbortSignal.timeout(120000),headers:{'x-hem-restore':config.secret,'Content-Type':'application/octet-stream'},body:bytes})
  const result=await response.json()
  if(!response.ok)throw Error('Restore endpoint HTTP '+response.status+': '+result.error)
  return result
 }
 await post(-1,Buffer.alloc(0))
 const queue=config.files.map((file,index)=>({file,index})),results=[],failures=[]
 async function worker(){
  while(queue.length){const {file,index}=queue.shift()
   try{
    const bytes=await fs.readFile(path.join(dir,'storage',file.bucket,file.name))
    if(bytes.length!==file.bytes||hash(bytes)!==file.sha256)throw Error('Local checksum mismatch')
    let result
    for(let attempt=0;attempt<3;attempt++){try{result=await post(index,bytes);break}catch(error){if(attempt===2)throw error}}
    if(!result.verified||result.sha256!==file.sha256||result.bytes!==file.bytes)throw Error('Verification mismatch')
    results.push({...file,index})
   }catch(error){failures.push({index,error:error.message})}
   if((results.length+failures.length)%20===0)console.log('Files verified in destination: '+results.length+'/'+config.files.length+'; failures: '+failures.length)
  }
 }
 await Promise.all([worker(),worker(),worker()])
 const result={destinationProject:'gwqfwtcxlwcmglrozshc',verifiedAt:new Date().toISOString(),files:results,failures,bytes:results.reduce((sum,f)=>sum+f.bytes,0)}
 await fs.writeFile(path.join(dir,'destination-file-verification.json'),JSON.stringify(result,null,2),{mode:0o600})
 console.log(JSON.stringify({verifiedFiles:results.length,failures:failures.length,bytes:result.bytes}))
 if(failures.length)process.exitCode=1
}
main().catch(error=>{console.error(error.message);process.exitCode=1})
