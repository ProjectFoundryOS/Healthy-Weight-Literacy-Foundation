import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as bmi from '../lib/learning/bmi.ts';
const code=ts.transpileModule(readFileSync(new URL('../components/learning/bmi-calculator.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness(){
 let cursor=0;const state:any[]=[];const exports:any={};const calls:string[]=[];
 const forbidden=(name:string)=>()=>{calls.push(name);throw Error('Unexpected data access '+name);};
 const jsx=(type:unknown,props:any)=>({type,props});
 runInNewContext(code,{exports,require:(name:string)=>{
  if(name==='react')return {useRef:()=>({current:null}),useState:(initial:any)=>{const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],(value:any)=>state[i]=value];}};
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='next/link')return {default:'link'};
  if(name==='@/lib/learning/bmi')return bmi;
  throw Error('Unexpected dependency '+name);
 },requestAnimationFrame:(cb:()=>void)=>cb(),fetch:forbidden('fetch'),window:{gtag:forbidden('gtag')},navigator:{sendBeacon:forbidden('beacon')},localStorage:{getItem:forbidden('localStorage read'),setItem:forbidden('localStorage write')},sessionStorage:{getItem:forbidden('sessionStorage read'),setItem:forbidden('sessionStorage write')}});
 function nodes(){cursor=0;const out:any[]=[];function visit(n:any){if(Array.isArray(n))n.forEach(visit);else if(n?.props){out.push(n);visit(n.props.children);}}visit(exports.BmiCalculator());return out;}
 const field=(id:string)=>nodes().find(n=>n.props.id===id)!;
 const button=(name:string)=>nodes().find(n=>n.type==='button'&&n.props.children===name)!;
 return {nodes,field,button,calls,input:(id:string,value:string)=>field(id).props.onChange({target:{value}}),text:()=>JSON.stringify(nodes())};
}
test('calculator handles real interaction flow without storage, network or analytics',()=>{
 const h=harness();h.input('bmi-feet','5');h.input('bmi-inches','8');h.input('bmi-weight','200');
 h.button('Calculate BMI').props.onClick();assert.ok(h.field('bmi-adult-error'));assert.equal(h.nodes().some(n=>n.props.tabIndex===-1),false);
 h.field('bmi-adult').props.onChange({target:{checked:true}});h.button('Calculate BMI').props.onClick();assert.ok(h.text().includes('30.4'));
 assert.ok(h.nodes().some(n=>n.props.href==='/education/lessons/bmi-in-context'));
 h.input('bmi-weight','150');assert.equal(h.nodes().some(n=>n.props.tabIndex===-1),false);
 let prevented=false;h.field('bmi-weight').props.onKeyDown({key:'Enter',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.ok(h.text().includes('22.8'));
 h.button('Clear').props.onClick();for(const id of ['bmi-feet','bmi-inches','bmi-weight'])assert.equal(h.field(id).props.value,'');assert.equal(h.field('bmi-adult').props.checked,false);
 assert.deepEqual(h.calls,[]);
});
test('unit switches clear stale measurements and the optional example remains labeled',()=>{
 const h=harness();h.button('Try a fictional example instead').props.onClick();assert.ok(h.text().includes('Fictional adult example'));assert.ok(h.text().includes('22.9'));
 h.nodes().find(n=>n.props.name==='bmi-units'&&n.props.value==='us').props.onChange();assert.equal(h.field('bmi-weight').props.value,'');assert.equal(h.nodes().some(n=>n.props.tabIndex===-1),false);assert.ok(h.text().includes('Units changed'));
 h.button('Try a fictional example instead').props.onClick();h.input('bmi-weight','80');assert.equal(h.text().includes('Fictional adult example'),false);assert.deepEqual(h.calls,[]);
});
