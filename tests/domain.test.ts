import { describe,expect,it } from "vitest";
import { Jar,progress,remaining,savedAmount,status,summarize,validateDepositInput,validateJarInput } from "../src/domain";

const jar=(target=100,amounts:number[]=[]):Jar=>({id:"jar-1",name:"Rainy day",emoji:"☂️",target,createdAt:"2026-01-01T00:00:00Z",deposits:amounts.map((amount,index)=>({id:`d-${index}`,amount,note:"",date:"",createdAt:"2026-01-01T00:00:00Z"}))});

describe("savings calculations",()=>{
  it("derives all statuses and caps visual progress",()=>{
    expect(status(jar())).toBe("Not Started");expect(status(jar(100,[20]))).toBe("In Progress");expect(status(jar(100,[120]))).toBe("Reached 🎉");expect(progress(jar(100,[120]))).toBe(100);expect(remaining(jar(100,[120]))).toBe(0);
  });
  it("uses decimal-safe totals and complete summaries",()=>{
    expect(savedAmount(jar(1,[.1,.2]))).toBe(.3);expect(summarize([jar(),jar(100,[20]),jar(100,[100])])).toEqual({saved:120,target:300,total:3,notStarted:1,inProgress:1,reached:1});
  });
});

describe("validation",()=>{
  it("rejects blank names, invalid money, and malformed dates",()=>{
    expect(validateJarInput({name:" ",emoji:"",target:"0"})).toMatchObject({ok:false,errors:{name:expect.any(String),target:expect.any(String)}});
    expect(validateDepositInput({amount:"NaN",note:"",date:"not-a-date"})).toMatchObject({ok:false,errors:{amount:expect.any(String),date:expect.any(String)}});
  });
  it("normalizes valid input",()=>{
    expect(validateJarInput({name:"  Laptop ",emoji:"💻",target:"999.999"})).toEqual({ok:true,value:{name:"Laptop",emoji:"💻",target:1000}});
  });
});
