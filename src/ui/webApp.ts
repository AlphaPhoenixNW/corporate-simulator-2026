export function canRegisterWebApp(protocol:string,production:boolean,hasWorker:boolean){return production&&hasWorker&&(protocol==='https:'||protocol==='http:');}
export async function registerWebApp(){
 if(!canRegisterWebApp(location.protocol,import.meta.env.PROD,'serviceWorker' in navigator))return;
 try{await navigator.serviceWorker.register(new URL('./sw.js',document.baseURI),{scope:'./'});}catch{/* hosted play remains available if service workers are blocked */}
}
