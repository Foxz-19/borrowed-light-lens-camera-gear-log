// @vitest-environment jsdom
import { describe,expect,it } from "vitest";
import { Jar } from "../src/domain";
import { renderJar } from "../src/render";

const fixture=(count=6):Jar=>({id:"x",name:"<script>Dream</script>",emoji:"✈️",target:100,createdAt:"2026-01-01T00:00:00Z",deposits:Array.from({length:count},(_,i)=>({id:String(i),amount:10,note:i?`Deposit ${i}`:"",date:"2026-01-02",createdAt:"2026-01-02T00:00:00Z"}))});

describe("rendering",()=>{
  it("renders safe text, progress semantics, and only five history rows",()=>{const node=renderJar(fixture());expect(node.querySelector("h3")?.textContent).toBe("<script>Dream</script>");expect(node.querySelector("script")).toBeNull();expect(node.querySelectorAll(".history li")).toHaveLength(5);expect(node.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("60")});
});
