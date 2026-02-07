var k=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var G=Object.getOwnPropertyNames;var H=Object.prototype.hasOwnProperty;var V=(T,e)=>{for(var t in e)k(T,t,{get:e[t],enumerable:!0})},q=(T,e,t,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of G(e))!H.call(T,n)&&n!==t&&k(T,n,{get:()=>e[n],enumerable:!(a=_(e,n))||a.enumerable});return T};var z=T=>q(k({},"__esModule",{value:!0}),T);var j={};V(j,{DEFAULT_FLASHCARD_PROMPTS:()=>$,DEFAULT_SETTINGS:()=>Y,DEFAULT_SUMMARY_PROMPTS:()=>D,default:()=>R});module.exports=z(j);var c=require("obsidian");var f=require("obsidian"),L=class extends f.Modal{constructor(e,t,a="flashcards"){super(e),this.plugin=t,this.activeTab=a,this.options={detailLevel:t.settings.defaultDetailLevel,cardCount:"Auto",saveLocation:t.settings.saveLocation,cardStyle:t.settings.cardStyle,model:t.settings.model,envCustomInstructions:"",envSummaryCustomInstructions:"",flashcardCustomInstructions:"",summaryCustomInstructions:"",multipleChoice:!1,choiceCount:"4",envMultipleChoice:!1,envChoiceCount:"4"}}onOpen(){let{contentEl:e}=this;e.empty(),e.addClass("ai-learning-modal"),e.createEl("h2",{text:"\u{1F9E0} AI Learning Assistant"});let t=e.createDiv({cls:"tab-bar"});t.style.display="flex",t.style.gap="0",t.style.marginBottom="16px",t.style.borderBottom="2px solid var(--background-modifier-border)";let a=t.createEl("button",{text:"\u{1F3B4} Flashcards"}),n=t.createEl("button",{text:"\u{1F4DD} Summary"}),s=t.createEl("button",{text:"\u{1F4DA} Learning Env"});[a,n,s].forEach(o=>{o.style.padding="8px 16px",o.style.border="none",o.style.background="transparent",o.style.cursor="pointer",o.style.fontSize="14px",o.style.borderBottom="2px solid transparent",o.style.marginBottom="-2px"});let i=e.createDiv({cls:"tab-content"}),r=o=>{this.activeTab=o,o==="environment"&&this.options.detailLevel!=="4"&&(this.options.detailLevel="4"),a.style.borderBottomColor=o==="flashcards"?"var(--interactive-accent)":"transparent",a.style.color=o==="flashcards"?"var(--interactive-accent)":"",n.style.borderBottomColor=o==="summary"?"var(--interactive-accent)":"transparent",n.style.color=o==="summary"?"var(--interactive-accent)":"",s.style.borderBottomColor=o==="environment"?"var(--interactive-accent)":"transparent",s.style.color=o==="environment"?"var(--interactive-accent)":"",this.renderTabContent(i)};a.onclick=()=>r("flashcards"),n.onclick=()=>r("summary"),s.onclick=()=>r("environment"),r(this.activeTab)}renderTabContent(e){e.empty();let t=this.plugin.getProvider(),n=new f.Setting(e).setName("Model").addDropdown(s=>{let i=()=>{let r=t!=null&&t.getFavorites?t.getFavorites():[],o=this.options.model;s.selectEl.innerHTML="",r.includes(o)||s.addOption(o,o.split("/").pop()||o),r.forEach(d=>s.addOption(d,d.split("/").pop()||d)),s.setValue(o)};i(),t?(s.selectEl.addEventListener("mousedown",i),s.onChange(async r=>{this.options.model=r,this.plugin.settings.model=r,await this.plugin.saveSettings()})):s.selectEl.title="Manually set model in settings"}).addButton(s=>{s.setButtonText("Browse"),t?s.onClick(()=>{t.openModelSelector("ai-flashcards",i=>{this.options.model=i,this.plugin.settings.model=i,this.plugin.saveSettings(),this.renderTabContent(e)})}):(s.setDisabled(!0),s.setTooltip("Requires OpenRouter Provider plugin"))}).descEl.createDiv({cls:"ai-balance-desc"});if(n.style.fontSize="0.8em",n.style.color="var(--text-muted)",t?(n.setText("Loading balance..."),t.fetchCredits().then(s=>{n.setText(s?`Credits: $${s}`:"Credits: ???")})):(n.setText("\u26A0\uFE0F Standalone Mode"),n.style.color="var(--text-warning)"),this.activeTab==="environment"){e.createEl("p",{text:"Creates a Summary \u2192 Flashcards pipeline. Both are saved to a Learning/ folder.",cls:"setting-item-description"}),this.renderSlider(e,"Summary Detail Level","How detailed should the summary be? (Default: 4)"),this.renderCardStyle(e),this.renderMultipleChoice(e,"envMultipleChoice","envChoiceCount"),this.renderAdvancedOptions(e,"environment"),this.renderGenerateButton(e,"\u{1F4DA} Create Learning Environment",()=>{this.plugin.generateLearningEnvironment(this.options),this.close()});return}this.renderSlider(e,"Detail Level","1 = Brief \u2192 5 = Exhaustive"),new f.Setting(e).setName("Save Location").addDropdown(s=>s.addOption("inline","Inline").addOption("folder","Folder").setValue(this.options.saveLocation).onChange(i=>this.options.saveLocation=i)),this.activeTab==="flashcards"&&(this.renderCardStyle(e),this.renderMultipleChoice(e,"multipleChoice","choiceCount"),new f.Setting(e).setName("Quantity Override").setDesc("Leave 'Auto' or set specific number").addText(s=>s.setPlaceholder("Auto").setValue(this.options.cardCount).onChange(i=>this.options.cardCount=i||"Auto")),this.renderAdvancedOptions(e,"flashcards")),this.activeTab==="summary"&&this.renderAdvancedOptions(e,"summary"),this.renderGenerateButton(e,this.activeTab==="flashcards"?"\u{1F3B4} Generate Flashcards":"\u{1F4DD} Generate Summary",()=>{this.activeTab==="flashcards"?this.plugin.generateFlashcards(this.options):this.plugin.generateSummary(this.options),this.close()})}renderSlider(e,t,a){let s=new f.Setting(e).setName(t).setDesc(a).controlEl.createDiv({cls:"slider-container"});s.style.display="flex",s.style.alignItems="center";let i=s.createEl("span",{text:this.getLevelLabel(this.options.detailLevel),cls:"level-label"});i.style.marginRight="10px",i.style.fontWeight="bold",i.style.minWidth="100px";let r=s.createEl("input",{type:"range",attr:{min:"1",max:"5",step:"1"}});r.value=this.options.detailLevel,r.style.width="120px",r.addEventListener("input",o=>{this.options.detailLevel=o.target.value,i.textContent=this.getLevelLabel(this.options.detailLevel)})}renderCardStyle(e){new f.Setting(e).setName("Card Style").addDropdown(t=>t.addOption("single","Single-line (::)").addOption("multi","Multi-line (?)").setValue(this.options.cardStyle).onChange(a=>this.options.cardStyle=a))}renderMultipleChoice(e,t,a){let n=e.createDiv({cls:"mc-options-container"}),s=new f.Setting(n).setName("Number of Choices").setDesc("How many answer options per question").addDropdown(i=>i.addOption("2","2").addOption("3","3").addOption("4","4").addOption("5","5").setValue(this.options[a]).onChange(r=>this.options[a]=r));s.settingEl.style.display=this.options[t]?"flex":"none",new f.Setting(e).setName("\u{1F518} Multiple Choice").setDesc("Generate questions with A/B/C/D answer options").addToggle(i=>{i.setValue(this.options[t]),i.onChange(r=>{this.options[t]=r,s.settingEl.style.display=r?"flex":"none"})}),e.appendChild(n)}renderAdvancedOptions(e,t){let a=e.createDiv({cls:"advanced-options-container"}),n=a.createDiv({cls:"advanced-content"});n.style.display="none",n.style.marginTop="8px",n.style.paddingLeft="12px",n.style.borderLeft="2px solid var(--interactive-accent)",new f.Setting(a).setName("\u2699\uFE0F Advanced Options").setDesc("Custom instructions for generation").addToggle(s=>{s.setValue(!1),s.onChange(i=>{n.style.display=i?"block":"none"})}),a.appendChild(n),t==="environment"?(new f.Setting(n).setName("Summary Custom Instructions").setDesc("Optional: extra rules for summary generation.").addTextArea(s=>{s.setPlaceholder("E.g., focus on formulas, ignore examples...").setValue(this.options.envSummaryCustomInstructions).onChange(i=>this.options.envSummaryCustomInstructions=i||""),s.inputEl.style.width="100%",s.inputEl.style.height="60px"}),new f.Setting(n).setName("Flashcard Custom Instructions").setDesc("Optional: extra rules for flashcards (e.g., multiple-choice format).").addTextArea(s=>{s.setPlaceholder("E.g., create multiple-choice questions with 4 options...").setValue(this.options.envCustomInstructions).onChange(i=>this.options.envCustomInstructions=i||""),s.inputEl.style.width="100%",s.inputEl.style.height="60px"})):t==="flashcards"?new f.Setting(n).setName("Flashcard Custom Instructions").setDesc("Optional: extra rules for flashcards.").addTextArea(s=>{s.setPlaceholder("E.g., create multiple-choice questions with 4 options...").setValue(this.options.flashcardCustomInstructions).onChange(i=>this.options.flashcardCustomInstructions=i||""),s.inputEl.style.width="100%",s.inputEl.style.height="60px"}):t==="summary"&&new f.Setting(n).setName("Summary Custom Instructions").setDesc("Optional: extra rules for summary generation.").addTextArea(s=>{s.setPlaceholder("E.g., focus on formulas, ignore examples...").setValue(this.options.summaryCustomInstructions).onChange(i=>this.options.summaryCustomInstructions=i||""),s.inputEl.style.width="100%",s.inputEl.style.height="60px"})}renderGenerateButton(e,t,a){new f.Setting(e).addButton(n=>n.setButtonText(t).setCta().onClick(a))}getLevelLabel(e){return{1:"1 - Brief",2:"2 - Basic",3:"3 - Standard",4:"4 - Detailed",5:"5 - Exhaustive"}[e]||"3 - Standard"}onClose(){this.contentEl.empty()}};var m=require("obsidian");var P=class extends m.PluginSettingTab{constructor(e,t){super(e,t),this.plugin=t}display(){let{containerEl:e}=this;e.empty(),e.addClass("ai-learning-settings"),e.createEl("h2",{text:"AI Learning Assistant"});let t=this.plugin.getProvider();if(t){let a=e.createDiv({cls:"ai-settings-balance"});a.setText("Checking balance..."),this.plugin.fetchCredits().then(n=>{a.empty();let s=a.createSpan({cls:"ai-balance-icon"});(0,m.setIcon)(s,"wallet"),a.createSpan({text:n?`Balance: $${n}`:"Balance: Unknown"})}),this.createCollapsibleSection(e,"Provider","plug",!0,()=>{let s=e.createDiv({cls:"ai-settings-section-content"}).createDiv({cls:"ai-settings-row"}),i=s.createDiv({cls:"ai-settings-row-info"}),r=i.createSpan({cls:"ai-status-icon connected"});(0,m.setIcon)(r,"check-circle"),i.createSpan({text:"OpenRouter Provider",cls:"ai-settings-row-name"}),s.createDiv({cls:"ai-settings-row-action"}).createEl("button",{text:"Open Provider Settings",cls:"mod-cta"}).addEventListener("click",()=>{this.app.setting.open(),this.app.setting.openTabById("openrouter-provider")})})}else{let a=e.createDiv({cls:"ai-settings-warning"}),n=a.createSpan({cls:"ai-warning-icon"});(0,m.setIcon)(n,"alert-triangle"),a.createSpan({text:"Standalone Mode - Install OpenRouter Provider for best experience"}),new m.Setting(e).setName("OpenRouter API Key").setDesc("Enter your OpenRouter API key").addText(s=>s.setPlaceholder("sk-or-...").setValue(this.plugin.settings.apiKey).onChange(async i=>{this.plugin.settings.apiKey=i,await this.plugin.saveSettings()}))}this.createCollapsibleSection(e,"Model","cpu",!0,()=>{let a=e.createDiv({cls:"ai-settings-section-content"}),n=a.createDiv({cls:"ai-settings-row"}),s=n.createDiv({cls:"ai-settings-row-info"});s.createSpan({text:"Current Model",cls:"ai-settings-row-name"});let i=this.plugin.settings.model.split("/").pop()||this.plugin.settings.model;s.createSpan({text:i,cls:"ai-settings-row-value"}),t&&n.createDiv({cls:"ai-settings-row-action"}).createEl("button",{text:"Select Model"}).addEventListener("click",()=>{t.openModelSelector("ai-flashcards",()=>{this.plugin.settings.model=t.getModel("ai-flashcards"),this.plugin.saveSettings(),this.display()})});let r=a.createDiv({cls:"ai-settings-row"});r.createDiv({cls:"ai-settings-row-info"}).createSpan({text:"Output Language",cls:"ai-settings-row-name"});let h=r.createDiv({cls:"ai-settings-row-action"}).createEl("input",{type:"text",value:this.plugin.settings.language,cls:"ai-settings-input"});h.addEventListener("change",async()=>{this.plugin.settings.language=h.value,await this.plugin.saveSettings()})}),this.createCollapsibleSection(e,"Defaults","settings",!0,()=>{let a=e.createDiv({cls:"ai-settings-section-content"});new m.Setting(a).setName("Detail Level").addDropdown(n=>n.addOption("1","1 - Brief").addOption("2","2 - Basic").addOption("3","3 - Standard").addOption("4","4 - Detailed").addOption("5","5 - Exhaustive").setValue(this.plugin.settings.defaultDetailLevel).onChange(async s=>{this.plugin.settings.defaultDetailLevel=s,await this.plugin.saveSettings()})),new m.Setting(a).setName("Card Style").addDropdown(n=>n.addOption("single","Single-line (::)").addOption("multi","Multi-line (?)").setValue(this.plugin.settings.cardStyle).onChange(async s=>{this.plugin.settings.cardStyle=s,await this.plugin.saveSettings()})),new m.Setting(a).setName("Save Location").addDropdown(n=>n.addOption("inline","Inline").addOption("folder","Folder").setValue(this.plugin.settings.saveLocation).onChange(async s=>{this.plugin.settings.saveLocation=s,await this.plugin.saveSettings()}))}),this.createCollapsibleSection(e,"Custom Instructions","edit-3",!1,()=>{let a=e.createDiv({cls:"ai-settings-section-content"});new m.Setting(a).setName("Global Instructions").setDesc("Applied to all AI requests").addTextArea(n=>{n.setPlaceholder("Extra rules for all prompts...").setValue(this.plugin.settings.customInstructions).onChange(async s=>{this.plugin.settings.customInstructions=s,await this.plugin.saveSettings()}),n.inputEl.style.width="100%",n.inputEl.style.height="80px"})}),this.createCollapsibleSection(e,"Flashcard Prompts","layers",!1,()=>{let a=e.createDiv({cls:"ai-settings-section-content"});this.renderPromptsEditor(a,"flashcardPrompts",$)}),this.createCollapsibleSection(e,"Summary Prompts","file-text",!1,()=>{let a=e.createDiv({cls:"ai-settings-section-content"});this.renderPromptsEditor(a,"summaryPrompts",D)})}createSection(e,t,a,n){let i=e.createDiv({cls:"ai-settings-section"}).createDiv({cls:"ai-settings-section-header"}),r=i.createSpan({cls:"ai-settings-section-icon"});(0,m.setIcon)(r,a),i.createSpan({text:t}),n()}createCollapsibleSection(e,t,a,n,s){let i=e.createDiv({cls:"ai-settings-section ai-collapsible"});n&&i.addClass("open");let r=i.createDiv({cls:"ai-settings-section-header clickable"}),o=r.createSpan({cls:"ai-settings-section-icon"});(0,m.setIcon)(o,a),r.createSpan({text:t});let d=r.createSpan({cls:"ai-chevron"});(0,m.setIcon)(d,"chevron-down");let h=i.createDiv({cls:"ai-collapsible-content"});r.addEventListener("click",()=>{i.toggleClass("open",!i.hasClass("open"))}),s();let u=e.lastElementChild;u&&u!==i&&h.appendChild(u)}renderPromptsEditor(e,t,a){var r;let n=["","Brief","Basic","Standard","Detailed","Exhaustive"];for(let o=1;o<=5;o++){let d=String(o),h=((r=this.plugin.settings[t])==null?void 0:r[d])||a[d],u=e.createDiv({cls:"ai-prompt-level"});u.createDiv({text:`Level ${o}: ${n[o]}`,cls:"ai-prompt-level-title"}),new m.Setting(u).setName("Goal").addTextArea(l=>{l.setValue(h.purpose).onChange(async p=>{this.plugin.settings[t]||(this.plugin.settings[t]=JSON.parse(JSON.stringify(a))),this.plugin.settings[t][d]||(this.plugin.settings[t][d]={...a[d]}),this.plugin.settings[t][d].purpose=p,await this.plugin.saveSettings()}),l.inputEl.style.width="100%",l.inputEl.style.height="40px"}),new m.Setting(u).setName("Detail Guidance").addTextArea(l=>{l.setValue(h.detail).onChange(async p=>{this.plugin.settings[t]||(this.plugin.settings[t]=JSON.parse(JSON.stringify(a))),this.plugin.settings[t][d]||(this.plugin.settings[t][d]={...a[d]}),this.plugin.settings[t][d].detail=p,await this.plugin.saveSettings()}),l.inputEl.style.width="100%",l.inputEl.style.height="40px"})}e.createDiv({cls:"ai-settings-btn-container"}).createEl("button",{text:"Reset to Defaults",cls:"mod-warning"}).addEventListener("click",async()=>{this.plugin.settings[t]=JSON.parse(JSON.stringify(a)),await this.plugin.saveSettings(),new m.Notice("Prompts reset to defaults"),this.display()})}};var $={1:{purpose:"Summarize the text into key definitions.",detail:"Focus ONLY on core concepts. Ignore sub-points."},2:{purpose:"Cover main concepts and key facts.",detail:"Capture major headings and vital supporting facts."},3:{purpose:"Create a standard study deck.",detail:"Standard coverage. Capture main ideas, key details, and important lists."},4:{purpose:"Create a detailed study deck.",detail:"High Detail. Capture concepts, formulas, lists, and specific nuances."},5:{purpose:"EXHAUSTIVE EXAM PREPARATION.",detail:"ATOMIZE EVERYTHING. Extract EVERY SINGLE FACT. If a paragraph has 3 points, make 3 cards. Precision > Quantity."}},D={1:{purpose:"Create a brief executive summary.",detail:"Maximum 3-5 bullet points. Only the most critical takeaways."},2:{purpose:"Create a concise overview.",detail:"Cover main sections with 1-2 sentences each. Include key terms."},3:{purpose:"Create a balanced study summary.",detail:"Cover all major topics. Include definitions, key points, and important relationships."},4:{purpose:"Create a comprehensive summary.",detail:"Detailed coverage. Include formulas, examples, and nuances. Preserve structure."},5:{purpose:"Create an exhaustive reference document.",detail:"Include EVERYTHING. Formulas, proofs, examples, edge cases. This should serve as complete study notes."}},Y={apiKey:"",model:"google/gemini-2.0-flash-exp:free",language:"German",apiUrl:"https://openrouter.ai/api/v1/chat/completions",defaultDetailLevel:"3",saveLocation:"inline",cardStyle:"single",customInstructions:"",advancedMode:!1,flashcardPrompts:JSON.parse(JSON.stringify($)),summaryPrompts:JSON.parse(JSON.stringify(D)),modelContextLengths:{}},R=class extends c.Plugin{async onload(){await this.loadSettings(),this.statusBarItem=this.addStatusBarItem(),this.statusBarItem.setText(""),this.statusBarItem.addClass("ai-learning-status"),this.addRibbonIcon("brain-circuit","AI Learning Assistant",()=>{new L(this.app,this).open()}),this.addCommand({id:"open-learning-assistant",name:"Open Learning Assistant",callback:()=>{new L(this.app,this).open()}}),this.addCommand({id:"generate-flashcards",name:"Generate Flashcards",callback:()=>{new L(this.app,this,"flashcards").open()}}),this.addCommand({id:"generate-summary",name:"Generate Summary",callback:()=>{new L(this.app,this,"summary").open()}}),this.addCommand({id:"create-learning-environment",name:"Create Learning Environment",callback:()=>{new L(this.app,this,"environment").open()}}),this.addSettingTab(new P(this.app,this)),this.app.workspace.onLayoutReady(()=>{let e=this.getProvider();e&&this.settings.model&&typeof e.setModel=="function"&&e.setModel("ai-flashcards",this.settings.model)})}getProvider(){return this.app.plugins.getPlugin("openrouter-provider")||null}async fetchWithRetry(e,t=5,a=5e3){var i,r,o,d;let n=this.getProvider(),s=n?n.getApiKey():null;if(s||(s=this.settings.apiKey),!s)throw new Error("API Key not found. Please enable OpenRouter Provider OR set a key in settings.");new c.Notice(`\u{1F916} Generating with ${e.model}...`,5e3);for(let h=0;h<t;h++)try{this.setStatus(`API call... (try ${h+1})`);let u=await(0,c.requestUrl)({url:this.settings.apiUrl,method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`,"HTTP-Referer":"https://obsidian.md","X-Title":"Obsidian AI Learning Assistant"},body:JSON.stringify(e)});if(u.status===429){let l=Math.round(a/1e3);this.setStatus(`Rate limit! Wait ${l}s...`),new c.Notice(`\u26A0\uFE0F Rate Limit! Waiting ${l}s... (Retry ${h+1}/${t})`),await new Promise(p=>setTimeout(p,a)),a*=2;continue}if(u.status>=400){let l=`API Error ${u.status}`;try{let p=u.json;(i=p==null?void 0:p.error)!=null&&i.message&&(l+=`: ${p.error.message}`)}catch(p){l+=`: ${((r=u.text)==null?void 0:r.substring(0,100))||"Unknown error"}`}throw new Error(l)}if(((d=(o=u.json)==null?void 0:o.choices)==null?void 0:d.length)>0){let l=u.json.choices[0].message.content;l=l.replace(/<think>[\s\S]*?<\/think>/gi,"").trim(),u.json.choices[0].message.content=l}return u}catch(u){if(console.error("AI Learning Assistant Error:",u),h===t-1)throw this.setStatus(`Failed: ${u.message.substring(0,30)}...`),u;new c.Notice(`\u26A0\uFE0F ${u.message} - Retrying (${h+1}/${t})...`),await new Promise(l=>setTimeout(l,a)),a*=1.5}}async fetchCredits(){let e=this.getProvider();return e?e.fetchCredits():null}getContent(){let e=this.app.workspace.getActiveViewOfType(c.MarkdownView);if(!e)return null;let t=e.editor;return{text:t.getSelection()||t.getValue(),editor:t,file:e.file}}async generateFlashcards(e){var h,u;let t=this.getContent();if(!t){new c.Notice("No active markdown note.");return}if(t.text.trim().length<50){new c.Notice("\u26A0\uFE0F Content too short.");return}if(!this.getProvider())return;let a=e.model||this.settings.model,n=((h=this.settings.modelContextLengths)==null?void 0:h[a])||128e3,s=Math.max(8e3,Math.floor((n-5e3)*3)),i=[];for(let l=0;l<t.text.length;l+=s)i.push(t.text.substring(l,l+s));new c.Notice(`\u{1F9E0} Generating flashcards (${i.length} chunks)...`);let r=[],o=this.buildFlashcardPrompt(e);for(let l=0;l<i.length;l++){let p=i[l];new c.Notice(`\u{1F9E0} Chunk ${l+1}/${i.length}...`);let y=800;e.detailLevel==="1"&&(y=2e3),e.detailLevel==="2"&&(y=1200),e.detailLevel==="4"&&(y=500),e.detailLevel==="5"&&(y=250);let v=Math.ceil(p.length/y),O=e.cardCount!=="Auto"?`Generate EXACTLY ${Math.ceil(parseInt(e.cardCount)/i.length)} flashcards.`:`Generate roughly ${v} flashcards.`,E=e.flashcardCustomInstructions?`

\u26A0\uFE0F IMPORTANT - USER CUSTOM INSTRUCTIONS (APPLY TO CONTENT, NOT FORMAT):
${e.flashcardCustomInstructions}

Remember: Apply these instructions to the CONTENT and STYLE of questions/answers, but ALWAYS keep the MANDATORY FORMAT above!`:"",I=`${o}

QUANTITY: ${O}${E}`,C=this.settings.language||"German";try{let N=(await this.fetchWithRetry({model:e.model||this.settings.model,messages:[{role:"system",content:I},{role:"user",content:`TEXT:
${p}

OUTPUT IN ${C.toUpperCase()}.`}]})).json;if(((u=N.choices)==null?void 0:u.length)>0){let S=N.choices[0].message.content.trim();S=S.replace(/^```markdown\s*/,"").replace(/```$/,""),S=this.cleanLatexDelimiters(S),S.length>10&&r.push(S)}}catch(b){new c.Notice(`\u274C Chunk ${l+1} failed: ${b.message}`)}}if(r.length===0){new c.Notice("\u274C No cards generated.");return}let d=`

---
### \u{1F9E0} Flashcards (Level ${e.detailLevel})

${r.join(`

`)}

`;if(e.saveLocation==="folder"){let p=`${this.generateTag(t.file)}
${d}`;await this.saveToFolder(t.file,p,"Flashcards","_Cards")}else t.editor.replaceRange(d,t.editor.getCursor("to")),new c.Notice("\u2705 Flashcards generated!")}buildFlashcardPrompt(e){let t=this.settings.advancedMode?this.settings.flashcardPrompts:$,a=t[e.detailLevel]||t[3],n=this.settings.language||"German",s=e.multipleChoice?`

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
- NO headers like "### Flashcards" or section titles!${s}`:`FORMAT (MANDATORY - DO NOT CHANGE): Question::Answer
CRITICAL FORMAT RULES:
- One card per line using "::" as separator
- No intro/outro text
- NO "?" separator allowed when using this format`,r=this.settings.customInstructions?`
CUSTOM: ${this.settings.customInstructions}`:"";return`You are a strict flashcard generator.
GOAL: ${a.purpose}
DETAIL: ${a.detail}
LANGUAGE: ${n}
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
Output ONLY raw cards using the MANDATORY FORMAT above.`}async generateSummary(e){var p,y;let t=this.getContent();if(!t){new c.Notice("No active markdown note.");return}if(t.text.trim().length<50){new c.Notice("\u26A0\uFE0F Content too short.");return}if(!this.getProvider())return;let a=e.model||this.settings.model,n=((p=this.settings.modelContextLengths)==null?void 0:p[a])||128e3,s=Math.max(1e4,Math.floor((n-4e3)*3)),i=[];for(let v=0;v<t.text.length;v+=s)i.push(t.text.substring(v,v+s));new c.Notice(`\u{1F4DD} Generating summary (${i.length} chunks)...`);let r=[],o="",d=this.buildSummaryPrompt(e),h=e.summaryCustomInstructions?`
CUSTOM INSTRUCTIONS: ${e.summaryCustomInstructions}`:"";for(let v=0;v<i.length;v++){new c.Notice(`\u{1F4DD} Chunk ${v+1}/${i.length}...`);let O="";o&&(O+=`<previous_context_do_not_output>
${o}
</previous_context_do_not_output>

`),O+=`<new_text_to_summarize>
${i[v]}
</new_text_to_summarize>

INSTRUCTION: Summarize ONLY the content inside <new_text_to_summarize>. The <previous_context> is for continuity ONLY. Do not re-summarize it. OUTPUT IN ${this.settings.language.toUpperCase()}.`;try{let I=(await this.fetchWithRetry({model:e.model||this.settings.model,messages:[{role:"system",content:d+h},{role:"user",content:O}]})).json;if(((y=I.choices)==null?void 0:y.length)>0){let C=I.choices[0].message.content.trim();C=C.replace(/^```markdown\s*/,"").replace(/```$/,""),C=this.cleanLatexDelimiters(C),C.length>10&&(r.push(C),o=C)}}catch(E){new c.Notice(`\u274C Chunk ${v+1} failed: ${E.message}`)}}if(r.length===0){new c.Notice("\u274C No summary generated.");return}let u=r.join(`

---

`),l=`

---
### \u{1F4DD} Summary (Level ${e.detailLevel})

${u}

`;e.saveLocation==="folder"?await this.saveToFolder(t.file,l,"Summaries","_Summary"):(t.editor.replaceRange(l,t.editor.getCursor("to")),new c.Notice("\u2705 Summary generated!"))}async generateLearningEnvironment(e){var b,N,S,U;let t=this.getContent();if(!t){new c.Notice("No active markdown note.");return}if(t.text.trim().length<50){new c.Notice("\u26A0\uFE0F Content too short.");return}if(!this.getProvider())return;this.setStatus("Preparing...");let n=`${((b=t.file.parent)==null?void 0:b.path)||""}/Learning`;await this.app.vault.adapter.exists(n)||await this.app.vault.createFolder(n),this.setStatus("Step 1/2: Summary..."),new c.Notice(`\u{1F4DA} Step 1/2: Generating Summary (Level ${e.detailLevel})...`);let s=e.model||this.settings.model,i=((N=this.settings.modelContextLengths)==null?void 0:N[s])||128e3,r=Math.max(1e4,Math.floor((i-4e3)*3)),o=[];for(let g=0;g<t.text.length;g+=r)o.push(t.text.substring(g,g+r));let d=[],h="",u=this.buildSummaryPrompt(e),l=e.envSummaryCustomInstructions?`
CUSTOM INSTRUCTIONS: ${e.envSummaryCustomInstructions}`:"";for(let g=0;g<o.length;g++){this.setStatus(`Summary ${g+1}/${o.length}...`),new c.Notice(`\u{1F4DD} Summary chunk ${g+1}/${o.length}...`);let x="";h&&(x+=`<previous_context_do_not_output>
${h}
</previous_context_do_not_output>

`),x+=`<new_text_to_summarize>
${o[g]}
</new_text_to_summarize>

INSTRUCTION: Summarize ONLY the content inside <new_text_to_summarize>. The <previous_context> is for continuity ONLY. Do not re-summarize it. OUTPUT IN ${this.settings.language.toUpperCase()}.`;try{let M=(await this.fetchWithRetry({model:e.model||this.settings.model,messages:[{role:"system",content:u+l},{role:"user",content:x}]})).json;if(((S=M.choices)==null?void 0:S.length)>0){let A=M.choices[0].message.content.trim();A=A.replace(/^```markdown\s*/,"").replace(/```$/,""),A=this.cleanLatexDelimiters(A),A.length>10&&(d.push(A),h=A)}}catch(w){new c.Notice(`\u274C Summary chunk ${g+1} failed: ${w.message}`)}}if(d.length===0){this.clearStatus(),new c.Notice("\u274C Failed to generate summary.");return}let p=d.join(`

`);this.setStatus("Saving summary...");let y=`${n}/${t.file.basename}_Summary.md`,v=`# Summary: ${t.file.basename}
Source: [[${t.file.path}]]
Level: ${e.detailLevel}

---

${p}`;await this.app.vault.create(y,v).catch(async()=>{let g=this.app.vault.getAbstractFileByPath(y);g&&await this.app.vault.modify(g,v)}),new c.Notice("\u2705 Summary saved!"),this.setStatus("Step 2/2: Flashcards..."),new c.Notice("\u{1F4DA} Step 2/2: Generating Flashcards from Summary...");let O=e.cardStyle==="multi",E=e.envMultipleChoice?`

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
B`:"",I=O?`You are a flashcard generator.

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
- Output ONLY cards using the MANDATORY FORMAT above, no other text${E}`:`You are a flashcard generator.

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
- Output ONLY cards, no other text`,C=e.envCustomInstructions?`

\u26A0\uFE0F IMPORTANT - USER CUSTOM INSTRUCTIONS (APPLY TO CONTENT, NOT FORMAT):
${e.envCustomInstructions}

Remember: Apply these instructions to the CONTENT and STYLE of questions/answers, but ALWAYS keep the MANDATORY FORMAT above (use ? separator, never ::)!`:"";try{let x=(await this.fetchWithRetry({model:e.model||this.settings.model,messages:[{role:"system",content:I+C},{role:"user",content:`SUMMARY:
${p}

Generate flashcards in ${this.settings.language.toUpperCase()}.`}]})).json;if(((U=x.choices)==null?void 0:U.length)>0){let w=x.choices[0].message.content.trim();w=w.replace(/^```markdown\s*/,"").replace(/```$/,""),w=this.cleanLatexDelimiters(w),this.setStatus("Saving flashcards...");let M=`${n}/${t.file.basename}_Flashcards.md`,F=`${this.generateTag(t.file)}
# Flashcards: ${t.file.basename}
Source: [[${t.file.path}]]
Generated from: [[${y}]]

---

${w}`;await this.app.vault.create(M,F).catch(async()=>{let B=this.app.vault.getAbstractFileByPath(M);B&&await this.app.vault.modify(B,F)}),this.clearStatus(),new c.Notice(`\u2705 Learning Environment created!
\u{1F4C1} ${n}`)}}catch(g){this.clearStatus(),new c.Notice(`\u274C Flashcard generation failed: ${g.message}`)}}buildSummaryPrompt(e){let t=this.settings.advancedMode?this.settings.summaryPrompts:D,a=t[e.detailLevel]||t[3],n=this.settings.language||"German",s=this.settings.customInstructions?`
CUSTOM: ${this.settings.customInstructions}`:"";return`You are an expert note summarizer.
GOAL: ${a.purpose}
DETAIL LEVEL: ${a.detail}
LANGUAGE: ${n}
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
LEITFRAGEN: If the text contains Leitfragen (guiding questions), include them in the summary under an appropriate heading.${s}
Output ONLY the summary, no meta-commentary.`}generateTag(e){var n;let t=e.parent?e.parent.name:"root",a=t.replace(/\s+/g,"_");return["Learning","Flashcards","misc","Summaries"].includes(t)?`#flashcards/${((n=e.parent)!=null&&n.parent?e.parent.parent.name:"root").replace(/\s+/g,"_")}`:`#flashcards/${a}`}async saveToFolder(e,t,a,n){var o;let i=`${((o=e.parent)==null?void 0:o.path)||""}/${a}`;await this.app.vault.adapter.exists(i)||await this.app.vault.createFolder(i);let r=`${i}/${e.basename}${n}.md`;if(await this.app.vault.adapter.exists(r)){let d=this.app.vault.getAbstractFileByPath(r);d&&(await this.app.vault.modify(d,await this.app.vault.read(d)+t),new c.Notice(`\u2705 Appended to: ${r}`))}else await this.app.vault.create(r,`# ${a}: ${e.basename}
Source: [[${e.path}]]
${t}`),new c.Notice(`\u2705 Created: ${r}`)}async loadSettings(){this.settings=Object.assign({},Y,await this.loadData())}async saveSettings(){await this.saveData(this.settings)}cleanLatexDelimiters(e){return e&&(e=e.replace(/\u00A0/g," "),e=e.replace(/[\u2000-\u200B\u202F\u205F\u3000]/g," "),e=e.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g,(t,a)=>`$$
${a.trim()}
$$`),e=e.replace(/\\\(\s*(.*?)\s*\\\)/g,(t,a)=>`$${a.trim()}$`),e)}setStatus(e){this.statusBarItem&&this.statusBarItem.setText(e?`\u{1F9E0} ${e}`:"")}clearStatus(){this.statusBarItem&&this.statusBarItem.setText("")}};
