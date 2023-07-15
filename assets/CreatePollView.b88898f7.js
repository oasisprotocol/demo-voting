import{d as T,u as j,a as A,b as J,r as d,o as a,c as l,e as t,w as _,v as x,F as S,f as N,g as I,h as U,i as F,N as M,t as q,p as $,j as L,_ as R}from"./index.4b7ee666.js";const c=p=>($("data-v-95950bfc"),p=p(),L(),p),z={style:{"max-width":"60ch"},class:"py-5 m-auto w-4/5"},G=c(()=>t("h2",null,"New Poll",-1)),K=c(()=>t("legend",null,"Name",-1)),Q=c(()=>t("legend",null,"Description",-1)),W=c(()=>t("legend",null,"Choices",-1)),X={class:"ml-8 list-decimal"},Y=["onUpdate:modelValue"],Z=["data-ix","onClick"],ee=["onClick"],te=c(()=>t("legend",null,"Additional Options",-1)),se={class:"px-3"},oe={class:"my-3"},ae=c(()=>t("label",{class:"inline-block mx-3",for:"publish-votes"},"Publish individual votes after voting has ended.",-1)),le={key:0,class:"text-red-500 px-3 mt-5 rounded-sm"},ne=c(()=>t("span",{class:"font-bold"},"Errors:",-1)),ie={class:"list-disc px-8"},re=["disabled"],ce={key:0},ue={key:1},de=T({__name:"CreatePollView",setup(p){const B=j(),f=A(),m=J(),D=async(o,s)=>{const e=await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${o}`},body:JSON.stringify({pinataContent:s})}),i=await e.json();if(e.status!==200)throw new Error("failed to pin");const r={ipfsHash:i.IpfsHash};return new Response(JSON.stringify(r),{status:201,headers:{"content-type":"application/json"}})},u=d([]),w=d(""),y=d(""),n=d([]),g=d(!1),h=d(!1);let k=0;const E=o=>n.value.splice(o,1),v=()=>{n.value.push({key:k,value:""}),k++};v(),v(),v();async function O(o){var s;if(!(o.target instanceof HTMLFormElement&&(o.target.checkValidity(),!o.target.reportValidity()))){o.preventDefault();try{u.value.splice(0,u.value.length),h.value=!0;const e=await H();if(!e)return;B.push({name:"poll",params:{id:e}})}catch(e){u.value.push(`Failed to create poll: ${(s=e.message)!=null?s:JSON.stringify(e)}`),console.error(e)}finally{h.value=!1}}}async function H(){if(await f.connect(),await f.switchNetwork(M.FromConfig),u.value.length>0)return"";const o={creator:f.address,name:w.value,description:y.value,choices:n.value.map(b=>b.value),options:{publishVotes:g.value}},s=await D("",o),e=await s.json();if(s.status!==201)throw new Error(e.error);const r={ipfsHash:e.ipfsHash,numChoices:n.value.length,publishVotes:o.options.publishVotes},C=await m.value.callStatic.createProposal(r);console.log("creating proposal");const P=await m.value.createProposal(r);if(console.log("creating proposal in",P.hash),(await P.wait()).status!==1)throw new Error("createProposal tx receipt reported failure.");let V=!1;for(;!V;)console.log("checking if ballot has been created on Sapphire"),V=await m.value.callStatic.ballotIsActive(C),await new Promise(b=>setTimeout(b,1e3));return C.replace("0x","")}return(o,s)=>(a(),l("main",z,[G,t("form",{onSubmit:O},[t("fieldset",null,[K,_(t("input",{class:"w-3/4",type:"text","onUpdate:modelValue":s[0]||(s[0]=e=>w.value=e),required:""},null,512),[[x,w.value]])]),t("fieldset",null,[Q,_(t("textarea",{class:"p-2 bg-transparent w-full h-full","onUpdate:modelValue":s[1]||(s[1]=e=>y.value=e),required:""},null,512),[[x,y.value]])]),t("fieldset",null,[W,t("ol",X,[(a(!0),l(S,null,N(n.value,(e,i)=>(a(),l("li",{class:"choice-item",key:e.key},[_(t("input",{type:"text",required:"","onUpdate:modelValue":r=>n.value[i].value=r},null,8,Y),[[x,n.value[i].value]]),n.value.length>1?(a(),l("button",{key:0,class:"inline-block text-lg text-gray-500 pl-1","data-ix":i,onClick:I(r=>E(i),["prevent"])}," \u24CD ",8,Z)):F("",!0)]))),128))]),t("button",{class:"underline ml-3 my-2 text-gray-700",onClick:I(v,["prevent"])}," \uFF0BAdd choice ",8,ee)]),t("fieldset",null,[te,t("ul",se,[t("li",oe,[_(t("input",{id:"publish-votes",type:"checkbox","onUpdate:modelValue":s[2]||(s[2]=e=>g.value=e)},null,512),[[U,g.value]]),ae])])]),u.value.length>0?(a(),l("div",le,[ne,t("ul",ie,[(a(!0),l(S,null,N(u.value,e=>(a(),l("li",{key:e},q(e),1))),128))])])):F("",!0),t("button",{class:"my-3 border-2 border-blue-700 text-blue-900 rounded-md p-2",disabled:h.value},[h.value?(a(),l("span",ce,"Creating\u2026")):(a(),l("span",ue,"Create Poll"))],8,re)],32)]))}});const he=R(de,[["__scopeId","data-v-95950bfc"]]);export{he as default};
//# sourceMappingURL=CreatePollView.b88898f7.js.map
