var k=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var G=Object.getOwnPropertyNames;var H=Object.prototype.hasOwnProperty;var V=(C,e)=>{for(var t in e)k(C,t,{get:e[t],enumerable:!0})},q=(C,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of G(e))!H.call(C,s)&&s!==t&&k(C,s,{get:()=>e[s],enumerable:!(n=_(e,s))||n.enumerable});return C};var z=C=>q(k({},"__esModule",{value:!0}),C);var W={};V(W,{DEFAULT_FLASHCARD_PROMPTS:()=>$,DEFAULT_SETTINGS:()=>Y,DEFAULT_SUMMARY_PROMPTS:()=>P,default:()=>R});module.exports=z(W);var l=require("obsidian");var f=require("obsidian"),O=class extends f.Modal{constructor(e,t,n="flashcards"){super(e),this.plugin=t,this.activeTab=n,this.options={detailLevel:t.settings.defaultDetailLevel,cardCount:"Auto",saveLocation:t.settings.saveLocation,cardStyle:t.settings.cardStyle,model:t.settings.model,envCustomInstructions:"",envSummaryCustomInstructions:"",flashcardCustomInstructions:"",summaryCustomInstructions:"",multipleChoice:!1,choiceCount:"4",envMultipleChoice:!1,envChoiceCount:"4"}}onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("ai-learning-modal"),e.createEl("h2",{text:"\u{1F9E0} AI Learning Assistant"});let t=e.createDiv({cls:"tab-bar"});t.style.display="flex",t.style.gap="0",t.style.marginBottom="16px",t.style.borderBottom="2px solid var(--background-modifier-border)";let n=t.createEl("button",{text:"\u{1F3B4} Flashcards"}),s=t.createEl("button",{text:"\u{1F4DD} Summary"}),a=t.createEl("button",{text:"\u{1F4DA} Learning Env"});[n,s,a].forEach(o=>{o.style.padding="8px 16px",o.style.border="none",o.style.background="transparent",o.style.cursor="pointer",o.style.fontSize="14px",o.style.borderBottom="2px solid transparent",o.style.marginBottom="-2px"});let i=e.createDiv({cls:"tab-content"}),r=o=>{this.activeTab=o,o==="environment"&&this.options.detailLevel!=="4"&&(this.options.detailLevel="4"),n.style.borderBottomColor=o==="flashcards"?"var(--interactive-accent)":"transparent",n.style.color=o==="flashcards"?"var(--interactive-accent)":"",s.style.borderBottomColor=o==="summary"?"var(--interactive-accent)":"transparent",s.style.color=o==="summary"?"var(--interactive-accent)":"",a.style.borderBottomColor=o==="environment"?"var(--interactive-accent)":"transparent",a.style.color=o==="environment"?"var(--interactive-accent)":"",this.renderTabContent(i)};n.onclick=()=>r("flashcards"),s.onclick=()=>r("summary"),a.onclick=()=>r("environment"),r(this.activeTab)}renderTabContent(e){e.empty();let t=this.plugin.getProvider(),s=new f.Setting(e).setName("Model").addDropdown(a=>{let i=()=>{let r=t!=null&&t.getFavorites?t.getFavorites():[],o=this.options.model;a.selectEl.innerHTML="",r.includes(o)||a.addOption(o,o.split("/").pop()||o),r.forEach(u=>a.addOption(u,u.split("/").pop()||u)),a.setValue(o)};i(),t?(a.selectEl.addEventListener("mousedown",i),a.onChange(async r=>{this.options.model=r,this.plugin.settings.model=r,await this.plugin.saveSettings()})):a.selectEl.title="Manually set model in settings"}).addButton(a=>{a.setButtonText("Browse"),t?a.onClick(()=>{t.openModelSelector("ai-flashcards",i=>{this.options.model=i,this.plugin.settings.model=i,this.plugin.saveSettings(),this.renderTabContent(e)})}):(a.setDisabled(!0),a.setTooltip("Requires OpenRouter Provider plugin"))}).descEl.createDiv({cls:"ai-balance-desc"});if(s.style.fontSize="0.8em",s.style.color="var(--text-muted)",t?(s.setText("Loading balance..."),t.fetchCredits().then(a=>{s.setText(a?`Credits: $${a}`:"Credits: ???")})):(s.setText("\u26A0\uFE0F Standalone Mode"),s.style.color="var(--text-warning)"),this.activeTab==="environment"){e.createEl("p",{text:"Creates a Summary \u2192 Flashcards pipeline. Both are saved to a Learning/ folder.",cls:"setting-item-description"}),this.renderSlider(e,"Summary Detail Level","How detailed should the summary be? (Default: 4)"),this.renderCardStyle(e),this.renderMultipleChoice(e,"envMultipleChoice","envChoiceCount"),this.renderAdvancedOptions(e,"environment"),this.renderGenerateButton(e,"\u{1F4DA} Create Learning Environment",()=>{this.plugin.generateLearningEnvironment(this.options),this.close()});return}this.renderSlider(e,"Detail Level","1 = Brief \u2192 5 = Exhaustive"),new f.Setting(e).setName("Save Location").addDropdown(a=>a.addOption("inline","Inline").addOption("folder","Folder").setValue(this.options.saveLocation).onChange(i=>this.options.saveLocation=i)),this.activeTab==="flashcards"&&(this.renderCardStyle(e),this.renderMultipleChoice(e,"multipleChoice","choiceCount"),new f.Setting(e).setName("Quantity Override").setDesc("Leave 'Auto' or set specific number").addText(a=>a.setPlaceholder("Auto").setValue(this.options.cardCount).onChange(i=>this.options.cardCount=i||"Auto")),this.renderAdvancedOptions(e,"flashcards")),this.activeTab==="summary"&&this.renderAdvancedOptions(e,"summary"),this.renderGenerateButton(e,this.activeTab==="flashcards"?"\u{1F3B4} Generate Flashcards":"\u{1F4DD} Generate Summary",()=>{this.activeTab==="flashcards"?this.plugin.generateFlashcards(this.options):this.plugin.generateSummary(this.options),this.close()})}renderSlider(e,t,n){let a=new f.Setting(e).setName(t).setDesc(n).controlEl.createDiv({cls:"slider-container"});a.style.display="flex",a.style.alignItems="center";let i=a.createEl("span",{text:this.getLevelLabel(this.options.detailLevel),cls:"level-label"});i.style.marginRight="10px",i.style.fontWeight="bold",i.style.minWidth="100px";let r=a.createEl("input",{type:"range",attr:{min:"1",max:"5",step:"1"}});r.value=this.options.detailLevel,r.style.width="120px",r.addEventListener("input",o=>{this.options.detailLevel=o.target.value,i.textContent=this.getLevelLabel(this.options.detailLevel)})}renderCardStyle(e){new f.Setting(e).setName("Card Style").addDropdown(t=>t.addOption("single","Single-line (::)").addOption("multi","Multi-line (?)").setValue(this.options.cardStyle).onChange(n=>this.options.cardStyle=n))}renderMultipleChoice(e,t,n){let s=e.createDiv({cls:"mc-options-container"}),a=new f.Setting(s).setName("Number of Choices").setDesc("How many answer options per question").addDropdown(i=>i.addOption("2","2").addOption("3","3").addOption("4","4").addOption("5","5").setValue(this.options[n]).onChange(r=>this.options[n]=r));a.settingEl.style.display=this.options[t]?"flex":"none",new f.Setting(e).setName("\u{1F518} Multiple Choice").setDesc("Generate questions with A/B/C/D answer options").addToggle(i=>{i.setValue(this.options[t]),i.onChange(r=>{this.options[t]=r,a.settingEl.style.display=r?"flex":"none"})}),e.appendChild(s)}renderAdvancedOptions(e,t){let n=e.createDiv({cls:"advanced-options-container"}),s=n.createDiv({cls:"advanced-content"});s.style.display="none",s.style.marginTop="8px",s.style.paddingLeft="12px",s.style.borderLeft="2px solid var(--interactive-accent)",new f.Setting(n).setName("\u2699\uFE0F Advanced Options").setDesc("Custom instructions for generation").addToggle(a=>{a.setValue(!1),a.onChange(i=>{s.style.display=i?"block":"none"})}),n.appendChild(s),t==="environment"?(new f.Setting(s).setName("Summary Custom Instructions").setDesc("Optional: extra rules for summary generation.").addTextArea(a=>{a.setPlaceholder("E.g., focus on formulas, ignore examples...").setValue(this.options.envSummaryCustomInstructions).onChange(i=>this.options.envSummaryCustomInstructions=i||""),a.inputEl.style.width="100%",a.inputEl.style.height="60px"}),new f.Setting(s).setName("Flashcard Custom Instructions").setDesc("Optional: extra rules for flashcards (e.g., multiple-choice format).").addTextArea(a=>{a.setPlaceholder("E.g., create multiple-choice questions with 4 options...").setValue(this.options.envCustomInstructions).onChange(i=>this.options.envCustomInstructions=i||""),a.inputEl.style.width="100%",a.inputEl.style.height="60px"})):t==="flashcards"?new f.Setting(s).setName("Flashcard Custom Instructions").setDesc("Optional: extra rules for flashcards.").addTextArea(a=>{a.setPlaceholder("E.g., create multiple-choice questions with 4 options...").setValue(this.options.flashcardCustomInstructions).onChange(i=>this.options.flashcardCustomInstructions=i||""),a.inputEl.style.width="100%",a.inputEl.style.height="60px"}):t==="summary"&&new f.Setting(s).setName("Summary Custom Instructions").setDesc("Optional: extra rules for summary generation.").addTextArea(a=>{a.setPlaceholder("E.g., focus on formulas, ignore examples...").setValue(this.options.summaryCustomInstructions).onChange(i=>this.options.summaryCustomInstructions=i||""),a.inputEl.style.width="100%",a.inputEl.style.height="60px"})}renderGenerateButton(e,t,n){new f.Setting(e).addButton(s=>s.setButtonText(t).setCta().onClick(n))}getLevelLabel(e){return{1:"1 - Brief",2:"2 - Basic",3:"3 - Standard",4:"4 - Detailed",5:"5 - Exhaustive"}[e]||"3 - Standard"}onClose(){this.contentEl.empty()}};var g=require("obsidian");var D=class extends g.PluginSettingTab{constructor(e,t){super(e,t),this.plugin=t,this.activeTab="general"}display(){let{containerEl:e}=this;e.empty(),e.createEl("h2",{text:"\u{1F9E0} AI Learning Assistant"});let t=e.createDiv({cls:"settings-tab-bar"});t.style.display="flex",t.style.gap="0",t.style.marginBottom="16px",t.style.borderBottom="2px solid var(--background-modifier-border)";let n=[{id:"general",label:"\u2699\uFE0F General"},{id:"flashcards",label:"\u{1F3B4} Flashcard Prompts"},{id:"summary",label:"\u{1F4DD} Summary Prompts"}],s={};n.forEach(i=>{let r=t.createEl("button",{text:i.label});r.style.padding="8px 16px",r.style.border="none",r.style.background="transparent",r.style.cursor="pointer",r.style.fontSize="14px",r.style.borderBottom="2px solid transparent",r.style.marginBottom="-2px",s[i.id]=r,r.onclick=()=>{this.activeTab=i.id,this.updateTabStyles(s),this.renderTabContent(a)}});let a=e.createDiv({cls:"settings-tab-content"});a.style.marginTop="16px",this.updateTabStyles(s),this.renderTabContent(a)}updateTabStyles(e){Object.entries(e).forEach(([t,n])=>{n.style.borderBottomColor=t===this.activeTab?"var(--interactive-accent)":"transparent",n.style.color=t===this.activeTab?"var(--interactive-accent)":""})}renderTabContent(e){switch(e.empty(),this.activeTab){case"general":this.renderGeneralTab(e);break;case"flashcards":this.renderPromptsTab(e,"flashcardPrompts","Flashcard",$);break;case"summary":this.renderPromptsTab(e,"summaryPrompts","Summary",P);break}}renderGeneralTab(e){let t=this.plugin.getProvider();if(t){e.createEl("h3",{text:"\u{1F50C} OpenRouter Provider"});let n=e.createDiv({cls:"setting-item-description"});n.style.marginBottom="10px",n.style.fontWeight="bold",n.style.color="var(--text-accent)",n.setText("Checking balance..."),this.plugin.fetchCredits().then(s=>{n.setText(s?`\u{1F4B3} Balance: $${s}`:"\u{1F4B3} Balance: Unknown")}),new g.Setting(e).setName("Configure API Key").setDesc("Open the OpenRouter Provider settings to manage your API key.").addButton(s=>s.setButtonText("Open Provider Settings").onClick(()=>{this.app.setting.open(),this.app.setting.openTabById("openrouter-provider")})),e.createEl("h3",{text:"\u{1F916} Model"}),new g.Setting(e).setName("Default Model").setDesc(`Current: ${this.plugin.settings.model}`).addButton(s=>s.setButtonText("Select Model").onClick(()=>{t.openModelSelector("ai-flashcards",()=>{this.plugin.settings.model=t.getModel("ai-flashcards"),this.plugin.saveSettings(),this.display()})}))}else{e.createEl("h3",{text:"\u{1F50C} API Configuration (Standalone)"});let n=e.createDiv({cls:"setting-item-description"});n.style.color="var(--text-error)",n.style.fontWeight="bold",n.style.marginBottom="15px",n.innerHTML="\u26A0\uFE0F Works best with <b>OpenRouter Provider</b> plugin.<br>You are currently in standalone mode.",new g.Setting(e).setName("OpenRouter API Key").setDesc("Enter your OpenRouter API key here.").addText(s=>s.setPlaceholder("sk-or-...").setValue(this.plugin.settings.apiKey).onChange(async a=>{this.plugin.settings.apiKey=a,await this.plugin.saveSettings()})),new g.Setting(e).setName("Model ID").setDesc("Manually enter the model ID (e.g., google/gemini-2.0-flash-exp:free)").addText(s=>s.setPlaceholder("provider/model-name").setValue(this.plugin.settings.model).onChange(async a=>{this.plugin.settings.model=a,await this.plugin.saveSettings()}))}new g.Setting(e).setName("Target Language").addText(n=>n.setValue(this.plugin.settings.language).onChange(async s=>{this.plugin.settings.language=s,await this.plugin.saveSettings()})),e.createEl("h3",{text:"\u2699\uFE0F Defaults"}),new g.Setting(e).setName("Default Detail Level").addDropdown(n=>n.addOption("1","1 - Brief").addOption("2","2 - Basic").addOption("3","3 - Standard").addOption("4","4 - Detailed").addOption("5","5 - Exhaustive").setValue(this.plugin.settings.defaultDetailLevel).onChange(async s=>{this.plugin.settings.defaultDetailLevel=s,await this.plugin.saveSettings()})),new g.Setting(e).setName("Default Card Style").addDropdown(n=>n.addOption("single","Single-line (::)").addOption("multi","Multi-line (?)").setValue(this.plugin.settings.cardStyle).onChange(async s=>{this.plugin.settings.cardStyle=s,await this.plugin.saveSettings()})),new g.Setting(e).setName("Default Save Location").addDropdown(n=>n.addOption("inline","Inline").addOption("folder","Folder").setValue(this.plugin.settings.saveLocation).onChange(async s=>{this.plugin.settings.saveLocation=s,await this.plugin.saveSettings()})),new g.Setting(e).setName("Global Custom Instructions").setDesc("Applied to all AI requests").addTextArea(n=>{n.setPlaceholder("Extra rules for all prompts...").setValue(this.plugin.settings.customInstructions).onChange(async s=>{this.plugin.settings.customInstructions=s,await this.plugin.saveSettings()}),n.inputEl.style.width="100%",n.inputEl.style.height="80px"})}renderPromptsTab(e,t,n,s){var a;e.createEl("h3",{text:`${n} Prompt Customization`}),e.createEl("p",{text:"Customize what the AI is told at each detail level.",cls:"setting-item-description"});for(let i=1;i<=5;i++){let r=String(i),o=((a=this.plugin.settings[t])==null?void 0:a[r])||s[r],u=["","Brief","Basic","Standard","Detailed","Exhaustive"],h=e.createDiv();h.style.marginTop="16px",h.style.marginBottom="8px",h.style.fontWeight="bold",h.style.fontSize="14px",h.textContent=`Level ${i}: ${u[i]}`,new g.Setting(e).setName("Goal").setDesc("What the AI should accomplish").addTextArea(d=>{d.setValue(o.purpose).onChange(async c=>{this.plugin.settings[t]||(this.plugin.settings[t]=JSON.parse(JSON.stringify(s))),this.plugin.settings[t][r]||(this.plugin.settings[t][r]={...s[r]}),this.plugin.settings[t][r].purpose=c,await this.plugin.saveSettings()}),d.inputEl.style.width="100%",d.inputEl.style.height="40px"}),new g.Setting(e).setName("Detail Guidance").setDesc("How thoroughly to process content").addTextArea(d=>{d.setValue(o.detail).onChange(async c=>{this.plugin.settings[t]||(this.plugin.settings[t]=JSON.parse(JSON.stringify(s))),this.plugin.settings[t][r]||(this.plugin.settings[t][r]={...s[r]}),this.plugin.settings[t][r].detail=c,await this.plugin.saveSettings()}),d.inputEl.style.width="100%",d.inputEl.style.height="40px"})}new g.Setting(e).addButton(i=>i.setButtonText(`Reset ${n} Prompts to Defaults`).setWarning().onClick(async()=>{var r;this.plugin.settings[t]=JSON.parse(JSON.stringify(s)),await this.plugin.saveSettings(),new g.Notice(`\u2705 ${n} prompts reset`),this.renderTabContent(((r=e.parentElement)==null?void 0:r.querySelector(".settings-tab-content"))||e)}))}};var $={1:{purpose:"Summarize the text into key definitions.",detail:"Focus ONLY on core concepts. Ignore sub-points."},2:{purpose:"Cover main concepts and key facts.",detail:"Capture major headings and vital supporting facts."},3:{purpose:"Create a standard study deck.",detail:"Standard coverage. Capture main ideas, key details, and important lists."},4:{purpose:"Create a detailed study deck.",detail:"High Detail. Capture concepts, formulas, lists, and specific nuances."},5:{purpose:"EXHAUSTIVE EXAM PREPARATION.",detail:"ATOMIZE EVERYTHING. Extract EVERY SINGLE FACT. If a paragraph has 3 points, make 3 cards. Precision > Quantity."}},P={1:{purpose:"Create a brief executive summary.",detail:"Maximum 3-5 bullet points. Only the most critical takeaways."},2:{purpose:"Create a concise overview.",detail:"Cover main sections with 1-2 sentences each. Include key terms."},3:{purpose:"Create a balanced study summary.",detail:"Cover all major topics. Include definitions, key points, and important relationships."},4:{purpose:"Create a comprehensive summary.",detail:"Detailed coverage. Include formulas, examples, and nuances. Preserve structure."},5:{purpose:"Create an exhaustive reference document.",detail:"Include EVERYTHING. Formulas, proofs, examples, edge cases. This should serve as complete study notes."}},Y={apiKey:"",model:"google/gemini-2.0-flash-exp:free",language:"German",apiUrl:"https://openrouter.ai/api/v1/chat/completions",defaultDetailLevel:"3",saveLocation:"inline",cardStyle:"single",customInstructions:"",advancedMode:!1,flashcardPrompts:JSON.parse(JSON.stringify($)),summaryPrompts:JSON.parse(JSON.stringify(P)),modelContextLengths:{}},R=class extends l.Plugin{async onload(){await this.loadSettings(),this.statusBarItem=this.addStatusBarItem(),this.statusBarItem.setText(""),this.statusBarItem.addClass("ai-learning-status"),this.addRibbonIcon("brain-circuit","AI Learning Assistant",()=>{new O(this.app,this).open()}),this.addCommand({id:"open-learning-assistant",name:"Open Learning Assistant",callback:()=>{new O(this.app,this).open()}}),this.addCommand({id:"generate-flashcards",name:"Generate Flashcards",callback:()=>{new O(this.app,this,"flashcards").open()}}),this.addCommand({id:"generate-summary",name:"Generate Summary",callback:()=>{new O(this.app,this,"summary").open()}}),this.addCommand({id:"create-learning-environment",name:"Create Learning Environment",callback:()=>{new O(this.app,this,"environment").open()}}),this.addSettingTab(new D(this.app,this)),this.app.workspace.onLayoutReady(()=>{let e=this.getProvider();e&&this.settings.model&&typeof e.setModel=="function"&&e.setModel("ai-flashcards",this.settings.model)})}getProvider(){return this.app.plugins.getPlugin("openrouter-provider")||null}async fetchWithRetry(e,t=5,n=5e3){var i,r,o,u;let s=this.getProvider(),a=s?s.getApiKey():null;if(a||(a=this.settings.apiKey),!a)throw new Error("API Key not found. Please enable OpenRouter Provider OR set a key in settings.");new l.Notice(`\u{1F916} Generating with ${e.model}...`,5e3);for(let h=0;h<t;h++)try{this.setStatus(`API call... (try ${h+1})`);let d=await(0,l.requestUrl)({url:this.settings.apiUrl,method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`,"HTTP-Referer":"https://obsidian.md","X-Title":"Obsidian AI Learning Assistant"},body:JSON.stringify(e)});if(d.status===429){let c=Math.round(n/1e3);this.setStatus(`Rate limit! Wait ${c}s...`),new l.Notice(`\u26A0\uFE0F Rate Limit! Waiting ${c}s... (Retry ${h+1}/${t})`),await new Promise(m=>setTimeout(m,n)),n*=2;continue}if(d.status>=400){let c=`API Error ${d.status}`;try{let m=d.json;(i=m==null?void 0:m.error)!=null&&i.message&&(c+=`: ${m.error.message}`)}catch(m){c+=`: ${((r=d.text)==null?void 0:r.substring(0,100))||"Unknown error"}`}throw new Error(c)}if(((u=(o=d.json)==null?void 0:o.choices)==null?void 0:u.length)>0){let c=d.json.choices[0].message.content;c=c.replace(/<think>[\s\S]*?<\/think>/gi,"").trim(),d.json.choices[0].message.content=c}return d}catch(d){if(console.error("AI Learning Assistant Error:",d),h===t-1)throw this.setStatus(`Failed: ${d.message.substring(0,30)}...`),d;new l.Notice(`\u26A0\uFE0F ${d.message} - Retrying (${h+1}/${t})...`),await new Promise(c=>setTimeout(c,n)),n*=1.5}}async fetchCredits(){let e=this.getProvider();return e?e.fetchCredits():null}getContent(){let e=this.app.workspace.getActiveViewOfType(l.MarkdownView);if(!e)return null;let t=e.editor;return{text:t.getSelection()||t.getValue(),editor:t,file:e.file}}async generateFlashcards(e){var h,d;let t=this.getContent();if(!t){new l.Notice("No active markdown note.");return}if(t.text.trim().length<50){new l.Notice("\u26A0\uFE0F Content too short.");return}if(!this.getProvider())return;let n=e.model||this.settings.model,s=((h=this.settings.modelContextLengths)==null?void 0:h[n])||128e3,a=Math.max(8e3,Math.floor((s-5e3)*3)),i=[];for(let c=0;c<t.text.length;c+=a)i.push(t.text.substring(c,c+a));new l.Notice(`\u{1F9E0} Generating flashcards (${i.length} chunks)...`);let r=[],o=this.buildFlashcardPrompt(e);for(let c=0;c<i.length;c++){let m=i[c];new l.Notice(`\u{1F9E0} Chunk ${c+1}/${i.length}...`);let v=800;e.detailLevel==="1"&&(v=2e3),e.detailLevel==="2"&&(v=1200),e.detailLevel==="4"&&(v=500),e.detailLevel==="5"&&(v=250);let y=Math.ceil(m.length/v),L=e.cardCount!=="Auto"?`Generate EXACTLY ${Math.ceil(parseInt(e.cardCount)/i.length)} flashcards.`:`Generate roughly ${y} flashcards.`,b=e.flashcardCustomInstructions?`

\u26A0\uFE0F IMPORTANT - USER CUSTOM INSTRUCTIONS (APPLY TO CONTENT, NOT FORMAT):
${e.flashcardCustomInstructions}

Remember: Apply these instructions to the CONTENT and STYLE of questions/answers, but ALWAYS keep the MANDATORY FORMAT above!`:"",E=`${o}

QUANTITY: ${L}${b}`,T=this.settings.language||"German";try{let N=(await this.fetchWithRetry({model:e.model||this.settings.model,messages:[{role:"system",content:E},{role:"user",content:`TEXT:
${m}

OUTPUT IN ${T.toUpperCase()}.`}]})).json;if(((d=N.choices)==null?void 0:d.length)>0){let S=N.choices[0].message.content.trim();S=S.replace(/^```markdown\s*/,"").replace(/```$/,""),S=this.cleanLatexDelimiters(S),S.length>10&&r.push(S)}}catch(x){new l.Notice(`\u274C Chunk ${c+1} failed: ${x.message}`)}}if(r.length===0){new l.Notice("\u274C No cards generated.");return}let u=`

---
### \u{1F9E0} Flashcards (Level ${e.detailLevel})

${r.join(`

`)}

`;if(e.saveLocation==="folder"){let m=`${this.generateTag(t.file)}
${u}`;await this.saveToFolder(t.file,m,"Flashcards","_Cards")}else t.editor.replaceRange(u,t.editor.getCursor("to")),new l.Notice("\u2705 Flashcards generated!")}buildFlashcardPrompt(e){let t=this.settings.advancedMode?this.settings.flashcardPrompts:$,n=t[e.detailLevel]||t[3],s=this.settings.language||"German",a=e.multipleChoice?`

\u{1F518} MULTIPLE CHOICE MODE (MANDATORY):
- Create multiple choice questions with EXACTLY ${e.choiceCount} options labeled A), B), C), D), E) as needed
- Put ALL choices in the QUESTION part
- Put ONLY the correct letter (e.g., "A" or "B") in the ANSWER part
- Make one option clearly correct, others plausible but wrong
- CRITICAL: RANDOMIZE which letter is correct! Do NOT always use A!
  - Vary answers across A, B, C, D roughly equally
  - Example: first card answer=C, second=A, third=D, fourth=B, etc.
- Example format:
What is 2+2?
A) 3
B) 4
C) 5
D) 6
?
B`:"",i=e.cardStyle==="multi"?`FORMAT (MANDATORY - DO NOT CHANGE):
Question text here
?
Answer text here

Another question
?
Another answer

CRITICAL FORMAT RULES:
- Each card has: question, then IMMEDIATELY a line with ONLY "?", then the answer
- NO blank line between question and "?" - they must be adjacent!
- Blank line ONLY between cards (after answer, before next question)
- The "?" on its own line is the SEPARATOR - this is required!
- NO "::" separator allowed when using this format
- NO "---" horizontal rules between cards!
- NO headers like "### Flashcards" or section titles!${a}`:`FORMAT (MANDATORY - DO NOT CHANGE): Question::Answer
CRITICAL FORMAT RULES:
- One card per line using "::" as separator
- No intro/outro text
- NO "?" separator allowed when using this format`,r=this.settings.customInstructions?`
CUSTOM: ${this.settings.customInstructions}`:"";return`You are a strict flashcard generator.
GOAL: ${n.purpose}
DETAIL: ${n.detail}
LANGUAGE: ${s}
MATH SUPPORT: Use Obsidian-compatible LaTeX (MathJax).
- Inline Math: $ a^2 + b^2 = c^2 $
- Block Math: $$ \\frac{a}{b} $$
- STRICTLY AVOID Typst syntax (no $ x "text" $ or #let).
- Do NOT USE \\[ ... \\] for math blocks!!! Use $$...$$ for math blocks or $...$ for inline math!!!
VISUAL STYLING:
- Use **bold** for key terms.

${i}

STYLE ADAPTATION:
1. First, analyze the Document Style. Is it Conceptual (explaining 'why'/'how') or Technical (formulas, proofs, calculations)?
2. If Conceptual: Focus flashcards on understanding, mechanisms, and cause-effect relationships. Avoid isolated formulas.
3. If Technical: Focus on formulas, conditions, and calculation steps.
4. "Leitfragen" / Example Questions: If present, use them as the GOLD STANDARD for card style. If the text asks "Explain the concept of...", do NOT generate a formula card for that concept.
5. Mimic the depth and tone of the source text.
${r}
Output ONLY raw cards using the MANDATORY FORMAT above.`}async generateSummary(e){var m,v;let t=this.getContent();if(!t){new l.Notice("No active markdown note.");return}if(t.text.trim().length<50){new l.Notice("\u26A0\uFE0F Content too short.");return}if(!this.getProvider())return;let n=e.model||this.settings.model,s=((m=this.settings.modelContextLengths)==null?void 0:m[n])||128e3,a=Math.max(1e4,Math.floor((s-4e3)*3)),i=[];for(let y=0;y<t.text.length;y+=a)i.push(t.text.substring(y,y+a));new l.Notice(`\u{1F4DD} Generating summary (${i.length} chunks)...`);let r=[],o="",u=this.buildSummaryPrompt(e),h=e.summaryCustomInstructions?`
CUSTOM INSTRUCTIONS: ${e.summaryCustomInstructions}`:"";for(let y=0;y<i.length;y++){new l.Notice(`\u{1F4DD} Chunk ${y+1}/${i.length}...`);let L="";o&&(L+=`<previous_context_do_not_output>
${o}
</previous_context_do_not_output>

`),L+=`<new_text_to_summarize>
${i[y]}
</new_text_to_summarize>

INSTRUCTION: Summarize ONLY the content inside <new_text_to_summarize>. The <previous_context> is for continuity ONLY. Do not re-summarize it. OUTPUT IN ${this.settings.language.toUpperCase()}.`;try{let E=(await this.fetchWithRetry({model:e.model||this.settings.model,messages:[{role:"system",content:u+h},{role:"user",content:L}]})).json;if(((v=E.choices)==null?void 0:v.length)>0){let T=E.choices[0].message.content.trim();T=T.replace(/^```markdown\s*/,"").replace(/```$/,""),T=this.cleanLatexDelimiters(T),T.length>10&&(r.push(T),o=T)}}catch(b){new l.Notice(`\u274C Chunk ${y+1} failed: ${b.message}`)}}if(r.length===0){new l.Notice("\u274C No summary generated.");return}let d=r.join(`

---

`),c=`

---
### \u{1F4DD} Summary (Level ${e.detailLevel})

${d}

`;e.saveLocation==="folder"?await this.saveToFolder(t.file,c,"Summaries","_Summary"):(t.editor.replaceRange(c,t.editor.getCursor("to")),new l.Notice("\u2705 Summary generated!"))}async generateLearningEnvironment(e){var x,N,S,U;let t=this.getContent();if(!t){new l.Notice("No active markdown note.");return}if(t.text.trim().length<50){new l.Notice("\u26A0\uFE0F Content too short.");return}if(!this.getProvider())return;this.setStatus("Preparing...");let s=`${((x=t.file.parent)==null?void 0:x.path)||""}/Learning`;await this.app.vault.adapter.exists(s)||await this.app.vault.createFolder(s),this.setStatus("Step 1/2: Summary..."),new l.Notice(`\u{1F4DA} Step 1/2: Generating Summary (Level ${e.detailLevel})...`);let a=e.model||this.settings.model,i=((N=this.settings.modelContextLengths)==null?void 0:N[a])||128e3,r=Math.max(1e4,Math.floor((i-4e3)*3)),o=[];for(let p=0;p<t.text.length;p+=r)o.push(t.text.substring(p,p+r));let u=[],h="",d=this.buildSummaryPrompt(e),c=e.envSummaryCustomInstructions?`
CUSTOM INSTRUCTIONS: ${e.envSummaryCustomInstructions}`:"";for(let p=0;p<o.length;p++){this.setStatus(`Summary ${p+1}/${o.length}...`),new l.Notice(`\u{1F4DD} Summary chunk ${p+1}/${o.length}...`);let I="";h&&(I+=`<previous_context_do_not_output>
${h}
</previous_context_do_not_output>

`),I+=`<new_text_to_summarize>
${o[p]}
</new_text_to_summarize>

INSTRUCTION: Summarize ONLY the content inside <new_text_to_summarize>. The <previous_context> is for continuity ONLY. Do not re-summarize it. OUTPUT IN ${this.settings.language.toUpperCase()}.`;try{let M=(await this.fetchWithRetry({model:e.model||this.settings.model,messages:[{role:"system",content:d+c},{role:"user",content:I}]})).json;if(((S=M.choices)==null?void 0:S.length)>0){let w=M.choices[0].message.content.trim();w=w.replace(/^```markdown\s*/,"").replace(/```$/,""),w=this.cleanLatexDelimiters(w),w.length>10&&(u.push(w),h=w)}}catch(A){new l.Notice(`\u274C Summary chunk ${p+1} failed: ${A.message}`)}}if(u.length===0){this.clearStatus(),new l.Notice("\u274C Failed to generate summary.");return}let m=u.join(`

`);this.setStatus("Saving summary...");let v=`${s}/${t.file.basename}_Summary.md`,y=`# Summary: ${t.file.basename}
Source: [[${t.file.path}]]
Level: ${e.detailLevel}

---

${m}`;await this.app.vault.create(v,y).catch(async()=>{let p=this.app.vault.getAbstractFileByPath(v);p&&await this.app.vault.modify(p,y)}),new l.Notice("\u2705 Summary saved!"),this.setStatus("Step 2/2: Flashcards..."),new l.Notice("\u{1F4DA} Step 2/2: Generating Flashcards from Summary...");let L=e.cardStyle==="multi",b=e.envMultipleChoice?`

\u{1F518} MULTIPLE CHOICE MODE (MANDATORY):
- Create multiple choice questions with EXACTLY ${e.envChoiceCount} options labeled A), B), C), D), E) as needed
- Put ALL choices in the QUESTION part
- Put ONLY the correct letter (e.g., "A" or "B") in the ANSWER part
- Make one option clearly correct, others plausible but wrong
- CRITICAL: RANDOMIZE which letter is correct! Do NOT always use A!
  - Vary answers across A, B, C, D roughly equally
  - Example: first card answer=C, second=A, third=D, fourth=B, etc.
- Example format:
What is 2+2?
A) 3
B) 4
C) 5
D) 6
?
B`:"",E=L?`You are a flashcard generator.

FORMAT (MANDATORY - DO NOT CHANGE):
The question text here
?
The answer text here

Another question
?
Another answer

CRITICAL FORMAT RULES:
- Each card has: question, then IMMEDIATELY a line with ONLY "?", then the answer
- NO blank line between question and "?" - they must be adjacent!
- Blank line ONLY between cards (after answer, before next question)
- The "?" on its own line is the SEPARATOR - this is REQUIRED!
- NO "::" separator allowed when using this format
- NO "---" horizontal rules between cards!
- NO headers like "### Flashcards" or section titles!
- NO labels like "Question:" or "Answer:"
- NO numbering
- STYLE ADAPTATION: Analyze the text. If it explains CONCEPTS, generate CONCEPTUAL cards (explain why/how). If it derives FORMULAS, generate MATH cards. If it has example questions, MIMIC THEIR STYLE exactly. Match the source text's depth.
- One fact per card
- Language: ${this.settings.language}
- MATH SUPPORT: Use MathJax (LaTeX). Inline: $...$, Block: $$...$$. NO Typst.
- Output ONLY cards using the MANDATORY FORMAT above, no other text${b}`:`You are a flashcard generator.

FORMAT (MANDATORY - DO NOT CHANGE): Question::Answer

Example:
What is X?::X is the definition here
What does Y do?::Y performs this function
Define Z::Z means this

CRITICAL FORMAT RULES:
- Format: question::answer (double colon separator)
- One card per line
- NO "?" separator allowed when using this format
- NO labels like "Question:" or "Answer:"
- NO numbering, NO bullet points
- STYLE ADAPTATION: Analyze the text. If it explains CONCEPTS, generate CONCEPTUAL cards (explain why/how). If it derives FORMULAS, generate MATH cards. If it has example questions, MIMIC THEIR STYLE exactly. Match the source text's depth.
- One fact per card
- Language: ${this.settings.language}
- MATH SUPPORT: Use MathJax (LaTeX). Inline: $...$, Block: $$...$$. NO Typst.
- VISUALS: Use **bold** for terms
- Output ONLY cards, no other text`,T=e.envCustomInstructions?`

\u26A0\uFE0F IMPORTANT - USER CUSTOM INSTRUCTIONS (APPLY TO CONTENT, NOT FORMAT):
${e.envCustomInstructions}

Remember: Apply these instructions to the CONTENT and STYLE of questions/answers, but ALWAYS keep the MANDATORY FORMAT above (use ? separator, never ::)!`:"";try{let I=(await this.fetchWithRetry({model:e.model||this.settings.model,messages:[{role:"system",content:E+T},{role:"user",content:`SUMMARY:
${m}

Generate flashcards in ${this.settings.language.toUpperCase()}.`}]})).json;if(((U=I.choices)==null?void 0:U.length)>0){let A=I.choices[0].message.content.trim();A=A.replace(/^```markdown\s*/,"").replace(/```$/,""),A=this.cleanLatexDelimiters(A),this.setStatus("Saving flashcards...");let M=`${s}/${t.file.basename}_Flashcards.md`,B=`${this.generateTag(t.file)}
# Flashcards: ${t.file.basename}
Source: [[${t.file.path}]]
Generated from: [[${v}]]

---

${A}`;await this.app.vault.create(M,B).catch(async()=>{let F=this.app.vault.getAbstractFileByPath(M);F&&await this.app.vault.modify(F,B)}),this.clearStatus(),new l.Notice(`\u2705 Learning Environment created!
\u{1F4C1} ${s}`)}}catch(p){this.clearStatus(),new l.Notice(`\u274C Flashcard generation failed: ${p.message}`)}}buildSummaryPrompt(e){let t=this.settings.advancedMode?this.settings.summaryPrompts:P,n=t[e.detailLevel]||t[3],s=this.settings.language||"German",a=this.settings.customInstructions?`
CUSTOM: ${this.settings.customInstructions}`:"";return`You are an expert note summarizer.
GOAL: ${n.purpose}
DETAIL LEVEL: ${n.detail}
LANGUAGE: ${s}
FORMAT: Use markdown with headers. Use MathJax (LaTeX) for math. DO NOT use Typst.
VISUALS:
- Use ==highlights== for key terms.
- Use **Mermaid Diagrams** (\`\`\`mermaid) for processes, flows, or hierarchies.
  IMPORTANT MERMAID RULES:
  1. Use the "Academic Blue" color scheme for ALL Mermaid diagrams:
     - Primary/Main color: #184a85 (dark blue) - use for main nodes, borders, arrows
     - Accent background: #f2f6fa (light blue-grey) - use for node fills
     - Result/highlight: #e6fffa (light cyan) - use for emphasized/result nodes
     - Text color: #1a1a1a (dark grey)
  2. CRITICAL SYNTAX RULES to prevent parsing errors:
     - NEVER use invisible/non-breaking spaces - use only standard spaces
     - Use standard spaces for indentation, NOT tabs or special whitespace
     - ALWAYS wrap node labels containing special characters in double quotes ""
      - Special characters that REQUIRE quotes: \u2192 \u2190 \u2194 \u2082 \u2083 \u207A \u207B \xB0 \u2260 \u2264 \u2265 \u221E \u221D _ etc.
      - Mermaid labels do NOT support LaTeX ($...$). Avoid LaTeX inside labels.
      - If you need Greek letters, use Unicode (e.g., "\u03C3") inside quotes, or plain text (e.g., "sigma").
    - Prefer ASCII operators in labels (use ">=" instead of "\u2265", "<=" instead of "\u2264").
     - Example: D["Metall \u2192 Metall-Ionen + e\u207B"] NOT D[Metall \u2192 Metall-Ionen + e\u207B]
     - Mathematical operations like + or - in labels are misread without quotes
  3. Example with correct theming and syntax:
  \`\`\`mermaid
  %%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#f2f6fa', 'primaryBorderColor': '#184a85', 'primaryTextColor': '#1a1a1a', 'lineColor': '#184a85', 'secondaryColor': '#e6fffa', 'tertiaryColor': '#fff9e6'}}}%%
  graph LR
      A[Metall] --> B["Prozess mit O\u2082"]
      style A fill:#f2f6fa,stroke:#184a85
  \`\`\`
- Use **Markdown Tables** for comparisons.
Preserve important formulas and definitions.
LEITFRAGEN: If the text contains Leitfragen (guiding questions), include them in the summary under an appropriate heading.${a}
Output ONLY the summary, no meta-commentary.`}generateTag(e){var s;let t=e.parent?e.parent.name:"root",n=t.replace(/\s+/g,"_");return["Learning","Flashcards","misc","Summaries"].includes(t)?`#flashcards/${((s=e.parent)!=null&&s.parent?e.parent.parent.name:"root").replace(/\s+/g,"_")}`:`#flashcards/${n}`}async saveToFolder(e,t,n,s){var o;let i=`${((o=e.parent)==null?void 0:o.path)||""}/${n}`;await this.app.vault.adapter.exists(i)||await this.app.vault.createFolder(i);let r=`${i}/${e.basename}${s}.md`;if(await this.app.vault.adapter.exists(r)){let u=this.app.vault.getAbstractFileByPath(r);u&&(await this.app.vault.modify(u,await this.app.vault.read(u)+t),new l.Notice(`\u2705 Appended to: ${r}`))}else await this.app.vault.create(r,`# ${n}: ${e.basename}
Source: [[${e.path}]]
${t}`),new l.Notice(`\u2705 Created: ${r}`)}async loadSettings(){this.settings=Object.assign({},Y,await this.loadData())}async saveSettings(){await this.saveData(this.settings)}cleanLatexDelimiters(e){return e&&(e=e.replace(/\u00A0/g," "),e=e.replace(/[\u2000-\u200B\u202F\u205F\u3000]/g," "),e=e.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g,(t,n)=>`$$
${n.trim()}
$$`),e=e.replace(/\\\(\s*(.*?)\s*\\\)/g,(t,n)=>`$${n.trim()}$`),e)}setStatus(e){this.statusBarItem&&this.statusBarItem.setText(e?`\u{1F9E0} ${e}`:"")}clearStatus(){this.statusBarItem&&this.statusBarItem.setText("")}};
