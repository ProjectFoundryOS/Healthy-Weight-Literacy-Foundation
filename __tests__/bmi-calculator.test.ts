import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateBmi, bmiCategory, bmiClass, emptyBmiInputs } from '../lib/learning/bmi.ts';

test('BMI matches independent CDC metric and US examples',()=>{
 const metric=calculateBmi('metric',{...emptyBmiInputs,cm:'175',weight:'70'},true);
 assert.ok(Math.abs(metric.result!.bmi-22.857142857142858)<1e-10);
 assert.equal(metric.result!.display,'22.9');assert.equal(metric.result!.category,'Healthy weight');
 const us=calculateBmi('us',{...emptyBmiInputs,feet:'5',inches:'8',weight:'200'},true);
 assert.equal(us.result!.display,'30.4');assert.equal(us.result!.category,'Obesity');assert.equal(us.result!.className,'Class 1');
});
test('adult category and class cutoffs use inclusive lower bounds without gaps',()=>{
 for(const [n,expected] of [[18.4999,'Underweight'],[18.5,'Healthy weight'],[24.9999,'Healthy weight'],[25,'Overweight'],[29.9999,'Overweight'],[30,'Obesity']] as const) assert.equal(bmiCategory(n),expected);
 assert.equal(bmiClass(34.9999),'Class 1'); assert.equal(bmiClass(35),'Class 2'); assert.equal(bmiClass(39.9999),'Class 2');assert.equal(bmiClass(40),'Class 3');
 assert.throws(()=>bmiCategory(NaN));assert.throws(()=>bmiCategory(0));
});
test('display rounding never changes categorization, including class boundaries',()=>{
 const r=calculateBmi('metric',{...emptyBmiInputs,cm:'200',weight:'99.96'},true).result!;
 assert.equal(r.display,'25.0');assert.equal(r.category,'Healthy weight');assert.equal(r.nearBoundary,true);
 const c=calculateBmi('metric',{...emptyBmiInputs,cm:'200',weight:'139.96'},true).result!;
 assert.equal(c.className,'Class 1');assert.equal(c.nearBoundary,true);
});
test('missing adult confirmation, wrong units, missing, invalid and extreme inputs block results',()=>{
 for(const weight of ['', '-70','0','Infinity','NaN','1e2','12abc','70,5','454','24']){
  const r=calculateBmi('metric',{...emptyBmiInputs,cm:'175',weight},true);assert.equal(r.result,null,weight);assert.ok(r.errors.weight);
 }
 const age=calculateBmi('metric',{...emptyBmiInputs,cm:'175',weight:'70'},false);assert.equal(age.result,null);assert.ok(age.errors.adult);
 for(const cm of ['1.75','0','275','']) assert.equal(calculateBmi('metric',{...emptyBmiInputs,cm,weight:'70'},true).result,null);
 for(const inches of ['12','-1','x']) assert.ok(calculateBmi('us',{...emptyBmiInputs,feet:'5',inches,weight:'150'},true).errors.inches);
 assert.equal(calculateBmi('us',{...emptyBmiInputs,feet:'9',inches:'1',weight:'150'},true).result,null);
 assert.equal(calculateBmi('us',{...emptyBmiInputs,feet:'5.5',weight:'150'},true).result,null);
 assert.ok(calculateBmi('us',{...emptyBmiInputs,feet:'6',weight:'180'},true).result);
 assert.ok(calculateBmi('us',{...emptyBmiInputs,feet:'5',inches:'8.5',weight:'150.5'},true).result);
});
