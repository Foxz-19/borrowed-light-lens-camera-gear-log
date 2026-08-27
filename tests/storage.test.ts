import { describe,expect,it,vi } from "vitest";
import { STORAGE_KEY,loadData,saveData } from "../src/storage";

describe("storage boundary",()=>{
  it("loads valid versioned data",()=>{const value={version:1 as const,jars:[]};const storage={getItem:vi.fn(()=>JSON.stringify(value)),setItem:vi.fn()};expect(loadData(storage)).toEqual({data:value})});
  it("surfaces blocked reads instead of silently reseeding",()=>{const storage={getItem:vi.fn(()=>{throw new Error("blocked")}),setItem:vi.fn()};expect(loadData(storage).warning).toMatch(/blocked/i)});
  it("backs up invalid data and returns a visible warning",()=>{const raw='{"version":1,"jars":[{"bad":true}]}',storage={getItem:vi.fn(()=>raw),setItem:vi.fn()};const result=loadData(storage);expect(result.data.jars).toEqual([]);expect(result.warning).toMatch(/damaged/i);expect(storage.setItem).toHaveBeenCalledWith(expect.stringContaining(`${STORAGE_KEY}:recovery:`),raw)});
  it("reports write failures and never throws",()=>{const storage={setItem:vi.fn(()=>{throw new Error("quota")})};expect(saveData({version:1,jars:[]},storage)).toEqual({ok:false,error:expect.stringMatching(/could not be saved/i)})});
});
