"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { calculateBmi, emptyBmiInputs, type BmiInputs, type BmiUnits, type BmiErrors } from "@/lib/learning/bmi";

export function BmiCalculator() {
  const [units, setUnits] = useState<BmiUnits>("us");
  const [values, setValues] = useState<BmiInputs>({ ...emptyBmiInputs });
  const [adult, setAdult] = useState(false);
  const [example, setExample] = useState(false);
  const [errors, setErrors] = useState<BmiErrors>({});
  const [result, setResult] = useState<ReturnType<typeof calculateBmi>["result"]>(null);
  const [notice, setNotice] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);
  function showResult() {
    requestAnimationFrame(() => {
      resultHeading.current?.focus({ preventScroll: true });
      resultHeading.current?.scrollIntoView({ block: "center" });
    });
  }
  function edit(key: keyof BmiInputs, value: string) {
    setValues({ ...values, [key]: value }); setResult(null); setErrors({}); setExample(false); setNotice("");
  }
  function calculate() {
    const checked = calculateBmi(units, values, adult);
    setErrors(checked.errors); setResult(checked.result); setNotice("");
    if (checked.result) showResult();
  }
  function clear() {
    setValues({ ...emptyBmiInputs }); setAdult(false); setExample(false); setResult(null); setErrors({}); setNotice("Measurements and result cleared.");
  }
  function field(key: keyof BmiInputs, label: string, placeholder: string) {
    return <div className="min-w-0">
      <label className="block text-sm font-semibold" htmlFor={`bmi-${key}`}>{label}</label>
      <input id={`bmi-${key}`} type="text" inputMode="decimal" autoComplete="off"
        className="mt-2 min-h-12 w-full rounded-lg border border-[#647a72] bg-white px-3 py-2 text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        value={values[key]} placeholder={placeholder} onChange={e => edit(key, e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); calculate(); } }}
        aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `bmi-${key}-error` : undefined} />
      {errors[key] && <p id={`bmi-${key}-error`} className="mt-2 text-sm text-[#913b26]">{errors[key]}</p>}
    </div>;
  }
  return <section id="calculator" aria-label="Adult BMI calculator" className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
    <div className="learning-card">
      <h2 className="text-2xl font-semibold">Start with height and weight</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">For adults 20 and older; not for use during pregnancy. Use the <a className="underline" href="https://www.cdc.gov/bmi/child-teen-calculator/index.html">CDC child and teen calculator</a> for ages 2–19.</p>
      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-semibold">Measurement units</legend>
        <div className="flex flex-wrap gap-3">
          {([['us','Feet / inches / lb'],['metric','Centimeters / kg']] as const).map(([value,label]) =>
            <label key={value} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${units===value ? 'border-primary bg-primary-soft' : 'border-[#647a72]'}`}>
              <input type="radio" name="bmi-units" value={value} checked={units===value} onChange={() => {
                setUnits(value); setValues({...emptyBmiInputs}); setResult(null); setErrors({}); setExample(false); setNotice("Units changed. Enter measurements in the selected units.");
              }} />{label}
            </label>)}
        </div>
      </fieldset>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {units === "us" ? <>{field("feet", "Height — feet", "5")}{field("inches", "Height — inches", "8")}</> : <div className="col-span-2">{field("cm", "Height — centimeters", "175")}</div>}
        <div className="col-span-2">{field("weight", units === "us" ? "Weight — pounds" : "Weight — kilograms", units === "us" ? "150" : "70")}</div>
      </div>
      <label className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <input className="mt-1 h-4 w-4 shrink-0" id="bmi-adult" type="checkbox" checked={adult} aria-invalid={!!errors.adult}
          aria-describedby={errors.adult ? "bmi-adult-error" : undefined} onChange={e=>{setAdult(e.target.checked);setResult(null);setErrors({});}} />
        This calculation is for an adult aged 20 or older.
      </label>
      {errors.adult && <p id="bmi-adult-error" className="text-sm text-[#913b26]">{errors.adult}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="tool-button" onClick={calculate}>Calculate BMI</button>
        <button type="button" className="min-h-12 rounded-full px-4 font-semibold underline underline-offset-4" onClick={clear}>Clear</button>
      </div>
      {!!Object.keys(errors).length && <p role="alert" className="mt-3 text-sm text-[#913b26]">Check the marked fields above. No result has been calculated.</p>}
      <p role="status" className="mt-3 text-sm text-muted-foreground">{notice}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Your measurements and result stay in this page. We do not save them or send them to analytics. No account or email required.</p>
      <button type="button" className="mt-3 min-h-12 text-sm font-semibold underline underline-offset-4" onClick={()=>{
        const sample={feet:"",inches:"",cm:"175",weight:"70"};setUnits("metric");setValues(sample);setAdult(true);setExample(true);setErrors({});setNotice("");setResult(calculateBmi("metric",sample,true).result);
        showResult();
      }}>Try a fictional example instead</button>
      <details className="mt-3 border-t pt-4 text-sm leading-relaxed">
        <summary className="cursor-pointer font-semibold">When to skip this calculator</summary>
        <p className="mt-3">Do not use this tool during pregnancy, if a condition affects your height, or if you have or think you may have an eating disorder. A health professional can help choose a more appropriate assessment. You can read the guide without entering measurements.</p>
        <p className="mt-2">This tool uses the CDC adult age range of 20 and older. Its input limits help catch unit mistakes; they are not targets for height or weight.</p>
      </details>
    </div>
    <div className="learning-card" style={{ background: "#f4f1e9" }}>
      {result ? <>
        <p className="eyebrow">{example ? "Fictional adult example" : "Your calculated result"}</p>
        <h2 ref={resultHeading} tabIndex={-1} className="mt-4 rounded text-5xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{result.display}<span className="ml-3 text-lg font-normal">kg/m²</span></h2>
        <p className="mt-4 text-xl font-semibold">{result.category}<span className="block text-sm font-normal">CDC adult BMI category{result.className ? ` · ${result.className}` : ""}</span></p>
        {result.nearBoundary && <p className="mt-3 text-sm">The display rounds up at a category boundary. The category uses the unrounded value ({result.bmi.toFixed(4)}).</p>}
        <div className="mt-6 rounded-xl bg-white p-5">
          <h3 className="font-semibold">A screening result, in context</h3>
          <p className="mt-2 leading-relaxed">This category describes weight relative to height. It does not diagnose a condition, measure body fat, or establish overall health. “Healthy weight” is a category name, not a health guarantee.</p>
        </div>
        <details className="mt-5 text-sm">
          <summary className="cursor-pointer py-2 font-semibold">See the calculation</summary>
          <p className="mt-2 break-words leading-relaxed">{result.calculation} = {result.display} kg/m² (rounded). Categories use the unrounded calculation.</p>
        </details>
        <Link className="tool-button mt-5" href="/education/lessons/bmi-in-context">Make sense of BMI: try the lesson →</Link>
      </> : <>
        <p className="eyebrow">A number. Then a clearer picture.</p>
        <h2 className="font-editorial mt-5 text-3xl">What will the result tell me?</h2>
        <p className="mt-4 leading-relaxed">You’ll see your calculated BMI, its standard adult category, and the calculation behind it. Then explore what that number leaves out.</p>
        <p className="mt-4 leading-relaxed">BMI compares weight with height. It cannot separate muscle, fat and bone, or show where body fat is carried.</p>
        <p className="mt-4 leading-relaxed">You can use the fictional example if you would rather explore without entering your own measurements.</p>
      </>}
      <div className="mt-7 border-t border-[#c5cfc7] pt-5">
        <h3 className="font-semibold">A useful question for your next visit</h3>
        <p className="mt-2 leading-relaxed">“How does BMI fit with my blood pressure, lab results, medical history and what matters to me?”</p>
        <Link className="mt-4 inline-flex min-h-12 items-center font-semibold underline underline-offset-4" href="/tools/appointment-planner">Build an appointment question list →</Link>
      </div>
    </div>
  </section>;
}
